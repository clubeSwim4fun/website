'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { CreateuserType, ProfileFile } from '@/blocks/Form/Component'
import { Media, UserMedia } from '@/payload-types'
import fs from 'fs'

interface CreateUserResponse {
  success: boolean
  error?: string
}

export async function createUser(
  userData: CreateuserType,
  files?: ProfileFile[] | undefined,
  media?: File,
): Promise<CreateUserResponse> {
  const payload = await getPayload({ config })

  try {
    // // Upload the file to the media collection
    // let test: UserMedia | null

    // const createdMediaIds: { id: string; relatesTo?: string }[] = []

    // let buffer;
    // if (files?.length) {
    //   for (const file of files) {
    //     console.log('file: ', file)
    //     const arrayBuffer = await file.file.arrayBuffer()
    //     buffer = Buffer.from(arrayBuffer)
    //     test = await payload.create({
    //       collection: 'user-media',
    //       data: {
    //         alt: 'test',
    //       },
    //       disableVerificationEmail: true,

    //       file: {
    //         data: buffer,
    //         mimetype: file.file.type,
    //         name: file.file.name,
    //         size: file.file.size,
    //       },
    //     })

    //     console.log('created: ', test)

    //     createdMediaIds.push({ id: test.id, relatesTo: file.relatesTo })
    //   }
    // } else {
    //   test = null
    // }

    console.log('mmm', media)
    const fileBuffer = await media?.arrayBuffer()

    const mediaData = {
      alt: 'description test',
      file: {
        data: fileBuffer,
        filename: media?.name, // replace with your file name
        mimeType: media?.type,
      },
    }
    if (fileBuffer) {
      const newMedia = await payload.create({
        collection: 'user-media',
        data: mediaData,
        file: {
          data: Buffer.from(fileBuffer),
          name: media?.name || '',
          size: Number(media?.type) || 200,
          mimetype: media?.type || '',
        },
      })
      console.log('media created: ', newMedia)
      const response = await payload.create({
        collection: 'users',
        data: {
          ...userData,
          name: 'test',
          profilePicture: newMedia, // I need to simplify and use Media without converting to File
        },
      })
      console.log('created: ', response)
    }

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
