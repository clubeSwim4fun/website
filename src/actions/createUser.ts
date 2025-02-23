'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { CreateUserMediaType, CreateuserType } from '@/blocks/Form/Component'

interface CreateUserResponse {
  success: boolean
  error?: string
}

export async function createUser(
  userData: CreateuserType,
  files: CreateUserMediaType[] | undefined,
): Promise<CreateUserResponse> {
  const payload = await getPayload({ config })

  try {
    // Upload the file to the media collection
    const createdMediaIds: { id: string; relatesTo?: string }[] = []
    if (files?.length) {
      for (const file of files) {
        console.log('file: ', file)
        const mediaDoc = await payload.create({
          collection: 'user-media',
          data: {
            _key: file?._key,
            mimeType: file?.mimeType,
            filename: file?.filename,
            filesize: file?.filesize,
            url: file?.url,
          },
        })

        createdMediaIds.push({ id: mediaDoc.id, relatesTo: file.relatesTo })
      }
    }
    console.log('medias: ', createdMediaIds)

    const profilePictureFile = createdMediaIds?.find((f) => f.relatesTo === 'profilePicture')

    console.log('file: ', profilePictureFile)
    const response = await payload.create({
      collection: 'users',
      data: {
        ...userData,
        profilePicture: profilePictureFile?.id,
      },
    })

    console.log('created: ', response)

    return {
      success: true,
    }
  } catch (error) {
    console.log('error', error)

    return {
      success: false,
      error: 'An error has happened', // improve this later
    }
  }
}
