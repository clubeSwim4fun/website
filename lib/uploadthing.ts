import { OurFileRouter } from '@/app/(payload)/api/uploadthing/core'
import { generateReactHelpers } from '@uploadthing/react'

export const { useUploadThing, uploadFiles } = generateReactHelpers<OurFileRouter>()
