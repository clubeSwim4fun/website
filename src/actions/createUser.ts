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
    return {
      success: false,
      error: t('Common.transactionError'),
    }
  }

  try {
    const userObject: CreateuserType = {}

    for (const [name, data] of Object.entries(userData)) {
      if (!Array.isArray(data.value)) {
        // Handle nested Address fields (e.g. relatesTo = 'Address.street')
        if (data.relatesTo.startsWith('Address.')) {
          const subKey = data.relatesTo.split('.')[1]!
          if (!userObject['Address']) userObject['Address'] = {} as any
          ;(userObject['Address'] as any)[subKey] = data.value
        } else {
          // Handle booleans stored as strings
          const val = data.value === 'true' ? true : data.value === 'false' ? false : data.value
          userObject[data.relatesTo] = val as any
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

    for (const [name, data] of Object.entries(userData)) {
      // If data value is an array, we need to treat all files to first upload,
      //  then add as reference to user object
      if (Array.isArray(data.value)) {
        const files = data.value

        tempFilesToDelete = await uploadUserFiles({
          transactionID,
          files,
          user: createdUser,
          dataRelatesTo: data.relatesTo,
        })
      }
    }

    await payload.db.commitTransaction(transactionID)

    return {
      success: true,
      message: 'user created successfully',
    }
  } catch (err) {
    await payload.db.rollbackTransaction(transactionID)

    await deleteS3Files(tempFilesToDelete)

    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    }
  }
}
