import { CollectionBeforeChangeHook } from 'payload'

const autoIncrement: CollectionBeforeChangeHook = async ({ data, operation, req }) => {
  if (operation === 'create') {
    const lastUser = await req.payload.find({
      collection: 'users',
      sort: '-associateId',
      limit: 1,
    })

    const lastAssociateId = lastUser.docs[0]?.associateId || 0
    data.associateId = lastAssociateId + 1
  }

  return data
}

export default autoIncrement
