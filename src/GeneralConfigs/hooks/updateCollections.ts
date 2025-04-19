import type { TypedLocale } from 'payload'
import { GlobalBeforeChangeHook } from 'payload'

export const updateCollections: GlobalBeforeChangeHook = async ({
  data,
  req: { payload, locale },
}) => {
  const { userData } = data

  if (userData && userData.genders && userData.genders.length > 0) {
    for (const [index, gender] of userData.genders.entries()) {
      try {
        const genderCollection = await payload.find({
          collection: 'gender',
          limit: 1,
          where: {
            hiddenId: {
              equals: gender.id,
            },
          },
        })

        const genderColData = genderCollection.docs?.[0]

        if (genderColData) {
          if (genderColData.label !== gender.label || genderColData.value !== gender.value) {
            const response = await payload.update({
              collection: 'gender',
              locale: locale as TypedLocale,
              data: {
                label: gender.label,
                value: gender.value,
              },
              where: {
                hiddenId: {
                  equals: gender.id,
                },
              },
            })

            data.userData.genders[index].genderId = response.docs[0]?.id
          }
        } else {
          const response = await payload.create({
            collection: 'gender',
            locale: locale as TypedLocale,
            data: {
              label: gender.label,
              value: gender.value,
              hiddenId: gender.id,
            },
          })

          userData.genders[index].genderId = response.id
        }
      } catch (error) {
        payload.logger.error('error while creating gender', error)
      }
    }
  }

  return data
}
