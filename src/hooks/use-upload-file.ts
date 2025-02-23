import * as React from 'react'
import type { AnyFileRoute, UploadFilesOptions } from 'uploadthing/types'

import { getErrorMessage } from '@/utilities/handle-error'
import { toast } from '@payloadcms/ui'
import { type ClientUploadedFileData } from 'uploadthing/types'
import { OurFileRouter } from '@/app/(payload)/api/uploadthing/core'
import { uploadFiles } from 'lib/uploadthing'
import { ProfileFile } from '@/blocks/Form/Component'

interface UploadedFile<T = unknown> extends ClientUploadedFileData<T> {}

interface UseUploadFileOptions<TFileRoute extends AnyFileRoute>
  extends Pick<
    UploadFilesOptions<TFileRoute>,
    'headers' | 'onUploadBegin' | 'onUploadProgress' | 'skipPolling'
  > {
  defaultUploadedFiles?: UploadedFile[]
}

export function useUploadFile(
  endpoint: keyof OurFileRouter,
  {
    defaultUploadedFiles = [],
    ...props
  }: UseUploadFileOptions<OurFileRouter[keyof OurFileRouter]> = {},
) {
  const [uploadedFiles, setUploadedFiles] = React.useState<UploadedFile[]>(defaultUploadedFiles)
  const [progresses, setProgresses] = React.useState<Record<string, number>>({})
  const [isUploading, setIsUploading] = React.useState(false)

  async function onUpload(profileFiles: ProfileFile[]) {
    const files = profileFiles.map((p) => p.file)

    setIsUploading(true)
    try {
      const res = await uploadFiles(endpoint, {
        ...props,
        files,
        onUploadProgress: ({ file, progress }) => {
          setProgresses((prev) => {
            return {
              ...prev,
              [file.name]: progress,
            }
          })
        },
      })

      res.forEach((r) => {
        const profileFile = profileFiles.find(
          (file) => file.file.name === r.serverData.updatedFile.name,
        )
        r.serverData.updatedFile.relatesTo = profileFile?.relatesTo || 'noMatch'
      })

      setUploadedFiles((prev) => (prev ? [...prev, ...res] : res))

      return res
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setProgresses({})
      setIsUploading(false)
    }
  }

  return {
    onUpload,
    uploadedFiles,
    progresses,
    isUploading,
  }
}
