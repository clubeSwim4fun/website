'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { CreateuserType, ProfileFile } from '@/blocks/Form/Component'
import { UserMedia } from '@/payload-types'

interface CreateUserResponse {
  success: boolean
  error?: string
}

export async function createUser(
  userData: CreateuserType,
  files?: ProfileFile[] | undefined,
): Promise<CreateUserResponse> {
  const payload = await getPayload({ config })

  try {
    // Upload the file to the media collection
    let test: UserMedia | null

    const createdMediaIds: { id: string; relatesTo?: string }[] = []
    if (files?.length) {
      for (const file of files) {
        console.log('file: ', file)
        const arrayBuffer = await file.file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        test = await payload.create({
          collection: 'user-media',
          data: {
            alt: 'description test',
          },
          file: {
            data: buffer,
            mimetype: file.file.type,
            name: file.file.name,
            size: file.file.size,
          },
        })

        console.log('created: ', test)

        createdMediaIds.push({ id: test.id, relatesTo: file.relatesTo })
      }
    } else {
      test = null
    }

    const profilePictureFile = createdMediaIds?.find((f) => f.relatesTo === 'profilePicture')

    console.log('file: ', profilePictureFile)
    const response = await payload.create({
      collection: 'users',
      data: {
        ...userData,
        profilePicture: files && files[0]?.file, // I need to simplify and use Media without converting to File
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
