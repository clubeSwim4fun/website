'use server'

import { getPayload, User } from 'payload'
import config from '@payload-config'
import { S3 } from '@aws-sdk/client-s3'
import { getTranslations } from 'next-intl/server'
import { uploadUserFiles } from '@/helpers/userHelper'

interface CreateUserResponse {
  success: boolean
  message?: string
  error?: string
}

export type CreateUserRequestType = {
  [key: string]: {
    value: string | File[]
    relatesTo: string
  }
}

export type CreateuserType = Omit<User, 'id' | 'createdAt' | 'updatedAt'>

const { S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_REGION } = process.env

if (!S3_ACCESS_KEY_ID || !S3_SECRET_ACCESS_KEY || !S3_REGION) {
  throw new Error('Missing required AWS S3 environment variables')
}

const s3 = new S3({
  credentials: {
    accessKeyId: S3_ACCESS_KEY_ID,
    secretAccessKey: S3_SECRET_ACCESS_KEY,
  },
  region: S3_REGION,
})

export const deleteS3Files = async (files: string[]) => {
  const deletePromises = files.map((fileKey) =>
    s3.deleteObject({
      Bucket: process.env.S3_BUCKET || 'clube-swim-4fun-bucket',
      Key: fileKey,
    }),
  )

  await Promise.all(deletePromises)
}

export async function createUser(userData: CreateUserRequestType): Promise<CreateUserResponse> {
  const payload = await getPayload({ config })
  let tempFilesToDelete: string[] = []
  const transactionID = await payload.db.beginTransaction()
  const t = await getTranslations()

  if (!transactionID) {
    return { success: false, error: t('Common.transactionError') }
  }

  try {
    const userObject: CreateuserType = {}
    // Collect file entries separately — they arrive as File[] and need S3 upload after user creation
    const fileEntries: Array<{ files: File[]; relatesTo: string }> = []

    for (const [, entry] of Object.entries(userData)) {
      if (Array.isArray(entry.value)) {
        // File fields — defer until after user is created
        if (entry.value.length > 0) {
          fileEntries.push({ files: entry.value as File[], relatesTo: entry.relatesTo })
        }
      } else {
        if (entry.relatesTo.startsWith('Address.')) {
          const subKey = entry.relatesTo.split('.')[1]!
          if (!userObject['Address']) userObject['Address'] = {} as any
          ;(userObject['Address'] as any)[subKey] = entry.value
        } else {
          const val = entry.value === 'true' ? true : entry.value === 'false' ? false : entry.value
          userObject[entry.relatesTo] = val as any
        }
      }
    }

    const createdUser = await payload.create({
      collection: 'users',
      data: {
        ...userObject,
        name: userObject.name,
        surname: userObject.surname,
        email: userObject.email,
      },
      req: { transactionID },
    })

    for (const { files, relatesTo } of fileEntries) {
      tempFilesToDelete = await uploadUserFiles({
        transactionID,
        files,
        user: createdUser,
        dataRelatesTo: relatesTo,
      })
    }

    await payload.db.commitTransaction(transactionID)
    return { success: true, message: 'user created successfully' }
  } catch (err) {
    await payload.db.rollbackTransaction(transactionID)
    await deleteS3Files(tempFilesToDelete)
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    }
  }
}
