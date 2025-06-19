'use server'

import { APIError, getPayload } from 'payload'
import config from '@payload-config'
import { cookies } from 'next/headers'
import { User } from '@/payload-types'
import { getTranslations } from 'next-intl/server'
import { verifyUserStatus } from '@/helpers/userHelper'
import { render } from '@react-email/components'
import React from 'react'
import { sendEmail } from '@/helpers/emailHelper'
import { UserResetPassword } from '@/email/UserResetPassword'

interface LoginParams {
  email: string
  password: string
}

export interface LoginResponse {
  success: boolean
  user?: User
  error?: string
}

export type Result = {
  exp?: number
  token?: string
  user?: User
}

export async function login({ email, password }: LoginParams): Promise<LoginResponse> {
  const payload = await getPayload({ config })
  const t = await getTranslations()
  try {
    const result: Result = await payload.login({
      collection: 'users',
      data: { email, password },
    })

    if (result.token) {
      const cookieStore = await cookies()
      cookieStore.set('payload-token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
      })

      await verifyUserStatus(result.user)

      return { success: true }
    } else {
      return { success: false, error: t('Common.loginError') }
    }
  } catch (error) {
    if (error instanceof Error && 'status' in error) {
      if (error && error.status === 401) {
        payload.logger.info(error)
        return { success: false, error: t('Common.loginAuthenticationError') }
      }

      payload.logger.error(error)
      return { success: false, error: t('Common.unexpectedError') }
    }
    payload.logger.error(error)
    return { success: false, error: t('Common.unexpectedError') }
  }
}

export type ResetPasswordResponse = {
  success: boolean
  message: string
  error?: APIError
}

export async function resetPassword({
  email,
  token,
  password,
}: {
  email?: string
  token?: string
  password?: string
}): Promise<ResetPasswordResponse> {
  const payload = await getPayload({ config })
  const t = await getTranslations()

  try {
    if (email) {
      const token = await payload.forgotPassword({
        collection: 'users',
        data: { email },
        disableEmail: true,
      })

      if (!token) {
        return {
          success: false,
          message: t('Sign-in.resetPasswordError'),
        }
      }

      const emailHtml = await render(React.createElement(UserResetPassword, { token }))

      await sendEmail({
        emailHtml,
        subject: t('Email.ResetPassword.subject'),
        to: email,
      })

      return {
        success: true,
        message: t('Sign-in.resetPasswordSuccess'),
      }

      // If token and password are provided, reset the password
    } else if (token && password) {
      await payload.resetPassword({
        collection: 'users',
        data: { token, password },
        overrideAccess: true,
      })

      return {
        success: true,
        message: 'Ok',
      }
    }

    return {
      success: false,
      message: t('Sign-in.resetPasswordError'),
    }
  } catch (error) {
    return {
      success: false,
      message: t('Sign-in.resetPasswordError'),
      error: error as APIError,
    }
  }
}
