import { CollectionBeforeChangeHook } from 'payload'

const updateImageName: CollectionBeforeChangeHook = async ({ data, req }) => {
  const userId = data.user

  data.filename = `${userId}_${data.filename}`
  data.sizes.square = {
    ...data.sizes.square,
    filename: `${userId}_${data.sizes.square.filename}`,
  }

  return data
}

export default updateImageName
