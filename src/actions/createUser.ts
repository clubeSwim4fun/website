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

// Field metadata is passed as JSON alongside the FormData files
export type CreateUserFieldMeta = {
  [key: string]: {
    value: string
    relatesTo: string
  }
}

// Legacy type kept for reference — file fields are now passed via FormData directly
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

export async function createUser(formData: FormData): Promise<CreateUserResponse> {
  const payload = await getPayload({ config })
  let tempFilesToDelete: string[] = []
  const transactionID = await payload.db.beginTransaction()
  const t = await getTranslations()

  if (!transactionID) {
    return { success: false, error: t('Common.transactionError') }
  }

  try {
    // Parse the JSON metadata for all scalar fields
    const metaRaw = formData.get('__meta') as string
    const meta: CreateUserFieldMeta = JSON.parse(metaRaw)

    const userObject: CreateuserType = {}
    const fileEntries: Array<{ files: File[]; relatesTo: string }> = []

    // Process scalar fields from meta
    for (const [, entry] of Object.entries(meta)) {
      if (entry.relatesTo.startsWith('Address.')) {
        const subKey = entry.relatesTo.split('.')[1]!
        if (!userObject['Address']) userObject['Address'] = {} as any
        ;(userObject['Address'] as any)[subKey] = entry.value
      } else {
        const val = entry.value === 'true' ? true : entry.value === 'false' ? false : entry.value
        userObject[entry.relatesTo] = val as any
      }
    }

    // Extract File entries from FormData
    for (const [key, value] of formData.entries()) {
      if (key === '__meta') continue
      if (value instanceof File && value.name) {
        // Normalise missing MIME type (common on Android camera captures)
        const mime =
          value.type ||
          (value.name.match(/\.(jpe?g)$/i)
            ? 'image/jpeg'
            : value.name.match(/\.png$/i)
              ? 'image/png'
              : value.name.match(/\.pdf$/i)
                ? 'application/pdf'
                : 'application/octet-stream')
        const file = mime === value.type ? value : new File([value], value.name, { type: mime })
        const relatesTo = key // key is the relatesTo value (e.g. 'identityFile', 'profilePicture')
        const existing = fileEntries.find((e) => e.relatesTo === relatesTo)
        if (existing) {
          existing.files.push(file)
        } else {
          fileEntries.push({ files: [file], relatesTo })
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
    console.error('[createUser] error:', err)
    await payload.db.rollbackTransaction(transactionID)
    await deleteS3Files(tempFilesToDelete)
    const errMsg =
      err instanceof Error
        ? err.message
        : typeof err === 'object' && err !== null && 'message' in err
          ? String((err as { message: unknown }).message)
          : JSON.stringify(err)
    console.error('[createUser] error detail:', errMsg)
    return {
      success: false,
      error: errMsg,
    }
  }
}
