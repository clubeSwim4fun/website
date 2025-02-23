import { getMeUser } from '@/utilities/getMeUser'
import { ratelimit } from 'lib/rate-limit'
import { createUploadthing, type FileRouter } from 'uploadthing/next'
import { UploadThingError } from 'uploadthing/server'

const f = createUploadthing()

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({ image: { maxFileSize: '4MB', maxFileCount: 8 } })
    // Set permissions and file types for this FileRoute
    .middleware(async () => {
      // Rate limit the upload
      // const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1'

      // const { success } = await ratelimit.limit(ip)

      // if (!success) {
      //   throw new UploadThingError('Rate limit exceeded')
      // }

      // This code runs on your server before upload
      const meUser = await getMeUser()

      // If you throw, the user will not be able to upload

      if (!meUser) throw new UploadThingError('Unauthorized')

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: meUser.user.id, userName: `${meUser.user.name}_${meUser.user.surname}` }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return {
        uploadedBy: { id: metadata.userId, name: metadata.userName },
        updatedFile: { ...file, relatesTo: '' },
      }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
