import { CollectionBeforeChangeHook, ValidationError, ValidationFieldError } from 'payload'

const saveFederationHistory: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
  operation,
  req,
}) => {
  if (operation === 'update' && originalDoc.federationId !== data.federationId) {
    const { i18n } = req

    const season = `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`

    const historyCollection = await req.payload.find({
      collection: 'federationHistory',
      where: {
        and: [
          {
            user: {
              equals: originalDoc.id,
            },
          },
          {
            season: {
              equals: season,
            },
          },
        ],
      },
    })

    if (historyCollection.totalDocs > 0) {
      console.log('aaaaaaaa')
      const error: ValidationFieldError = {
        message:
          i18n.language === 'pt'
            ? 'Utilizador já possui ID da federação para esta temporada'
            : 'User already has an ID for this season',
        label:
          i18n.language === 'pt'
            ? 'Utilizador já possui ID da federação para esta temporada'
            : 'User already has an ID for this season',
        path: 'federationId',
      }
      throw new ValidationError({
        errors: [error],
      })
    }

    await req.payload.create({
      collection: 'federationHistory',
      data: {
        user: originalDoc.id,
        federationId: data.federationId,
        season,
      },
    })
  }

  return data
}

export default saveFederationHistory
