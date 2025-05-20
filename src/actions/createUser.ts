'use server'

import { getPayload, User } from 'payload'
import config from '@payload-config'
import AWS from 'aws-sdk'
import { getTranslations } from 'next-intl/server'

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

const s3 = new AWS.S3({
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  region: process.env.S3_REGION,
})

const deleteS3Files = async (files: string[]) => {
  const deletePromises = files.map((fileKey) =>
    s3
      .deleteObject({
        Bucket: process.env.S3_BUCKET || 'clube-swim-4fun-bucket',
        Key: fileKey,
      })
      .promise(),
  )

  await Promise.all(deletePromises)
}

export async function createUser(userData: CreateUserRequestType): Promise<CreateUserResponse> {
  const payload = await getPayload({ config })
  const tempFilesToDelete: string[] = []
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
        userObject[data.relatesTo] = data.value
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

        for (const file of files) {
          const fileBuffer = await file?.arrayBuffer()

          if (fileBuffer) {
            const mediaToUpload = await payload.create({
              req: { transactionID },
              collection: 'user-media',
              data: {
                alt: `${name}_image`,
                user: createdUser.id,
              },
              file: {
                data: Buffer.from(fileBuffer),
                name: file.name,
                mimetype: file.type,
                size: file.size,
              },
            })

            tempFilesToDelete.push(`user_media/${mediaToUpload.filename}`)
            if (mediaToUpload.sizes?.square) {
              tempFilesToDelete.push(`user_media/${mediaToUpload.sizes.square.filename}`)
            }

            await payload.update({
              req: { transactionID },
              collection: 'users',
              data: {
                [data.relatesTo]: mediaToUpload.id,
              },
              where: {
                id: {
                  equals: createdUser.id,
                },
              },
            })
          }
        }
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
