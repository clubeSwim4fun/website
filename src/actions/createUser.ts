'use server'

import { getPayload, User } from 'payload'
import config from '@payload-config'

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

export async function createUser(userData: CreateUserRequestType): Promise<CreateUserResponse> {
  const payload = await getPayload({ config })
  const tempFilesToDelete = []

  try {
    const userObject: CreateuserType = {}

    for (const [name, data] of Object.entries(userData)) {
      const uploadedFiles = []
      // If data value is an array, we need to treat all files to first upload,
      //  then add as reference to user object
      if (Array.isArray(data.value)) {
        const files = data.value

        for (const file of files) {
          const fileBuffer = await file?.arrayBuffer()

          if (fileBuffer) {
            const mediaToUpload = await payload.create({
              collection: 'user-media',
              data: {
                alt: `${name}_image`,
              },
              file: {
                data: Buffer.from(fileBuffer),
                name: file.name,
                mimetype: file.type,
                size: file.size,
              },
            })

            uploadedFiles.push(mediaToUpload)
            tempFilesToDelete.push(mediaToUpload)
          }
        }

        userObject[data.relatesTo] = uploadedFiles
      } else {
        userObject[data.relatesTo] = data.value
      }
    }

    await payload.create({
      collection: 'users',
      data: {
        ...userObject,
        name: userObject.name,
        surname: userObject.surname,
        email: userObject.email,
      },
    })

    return {
      success: true,
      message: 'user created successfully',
    }
  } catch (err) {
    tempFilesToDelete.forEach((file) => {
      payload.delete({
        collection: 'user-media',
        id: file.id,
      })
    })
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    }
  }
}
