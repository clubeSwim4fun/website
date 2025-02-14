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
  file: CreateUserMediaType | undefined,
): Promise<CreateUserResponse> {
  const payload = await getPayload({ config })

  console.log('will upload file ', file)
  try {
    // Upload the file to the media collection
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

    console.log('media', mediaDoc)
    // const response = await payload.create({
    //   collection: 'users',
    //   data: {
    //     ...userData,
    //     profilePicutre: file,
    //   },
    // })

    // console.log('res', response)

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
