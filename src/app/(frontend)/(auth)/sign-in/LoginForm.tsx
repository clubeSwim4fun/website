'use client'

import { useRouter } from 'next/navigation'
import React, { FormEvent, ReactElement, useState } from 'react'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { login, LoginResponse } from '@/actions/login'
import { Input } from '@/components/ui/input'

export default function LoginForm(): ReactElement {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsPending(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const result: LoginResponse = await login({ email, password })

    if (result.success) {
      // Redirect manually after successful login
      router.push('/')
    } else {
      // Display the error message
      setError(result.error || 'Login failed')
    }

    setIsPending(false)
  }

  return (
    <div className="flex gap-8 min-h-full flex-col justify-center items-center">
      <div className="text-3xl">Login</div>
      <div className="w-full mx-auto sm:max-w-lg">
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label htmlFor="email">Email</label>
            <Input
              className="w-full focus:outline-none"
              name="email"
              id="email"
              type="email"
              required
            />
          </div>
          <div className="flex flex-col gap-2 mb-8">
            <label htmlFor="password">Password</label>
            <Input
              className="w-full focus:outline-none"
              name="password"
              id="password"
              type="password"
              required
            />
          </div>
          {error && <div className="text-red-500">{error}</div>}
          <Button>Login</Button>
        </form>
        <p className="mt-10 text-center text-sm text-gray-400">
          Don&apos;t have an account?{' '}
          <Link
            href="/sign-up"
            className="font-semibold leading-6 text-headBlue-500 hover:text-headBlue-400"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  )
}
