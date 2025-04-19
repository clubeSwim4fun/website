import type { BasePayload, Payload, TypedLocale } from 'payload'
import { GlobalBeforeChangeHook } from 'payload'

type GenderData = {
  id: string
  genderId: string
  label: string
  value: string
}

type DisabilityData = {
  id: string
  disabilityId: string
  label: string
  value: string
}

const updateRelatedCollection = async ({
  payload,
  locale,
  data,
  collection,
}: {
  payload: BasePayload
  locale?: 'en' | 'pt' | 'all'
  data: any
  collection: 'gender' | 'disability'
}) => {
  const dataProperty = collection === 'gender' ? 'genders' : 'disabilities'
  const { userData } = data

  for (const [index, dataObj] of (userData[dataProperty] ?? []).entries()) {
    try {
      const returnedCollection = await payload.find({
        collection,
        limit: 1,
        where: {
          hiddenId: {
            equals: dataObj.id,
          },
        },
      })

      const returnedColectionData = returnedCollection.docs?.[0]

      if (returnedColectionData) {
        if (
          returnedColectionData.label !== dataObj.label ||
          returnedColectionData.value !== dataObj.value
        ) {
          const response = await payload.update({
            collection,
            locale: locale as TypedLocale,
            data: {
              label: dataObj.label,
              value: dataObj.value,
            },
            where: {
              hiddenId: {
                equals: dataObj.id,
              },
            },
          })

          if (collection === 'gender') {
            data.userData.genders[index].genderId = response.docs[0]?.id
          } else if (collection === 'disability') {
            data.userData.genders[index].disabilityId = response.docs[0]?.id
          }
        }
      } else {
        const response = await payload.create({
          collection,
          locale: locale as TypedLocale,
          data: {
            label: dataObj.label,
            value: dataObj.value,
            hiddenId: dataObj.id,
          },
        })

        console.log('created', response)

        if (collection === 'gender') {
          console.log('if here', userData.genders[index])
          if (userData.genders[index]) {
            userData.genders[index].genderId = response.id
          }
          console.log('after if here', userData.genders[index])
        } else if (collection === 'disability') {
          if (userData.disabilities[index]) {
            userData.disabilities[index].disabilityId = response.id
          }
        }
      }
    } catch (error) {
      payload.logger.error('error while creating gender', error)
    }
  }

  return data
}

const wasDeleted = (
  original: (GenderData | DisabilityData)[],
  updated: (GenderData | DisabilityData)[],
) => {
  const originalIds = original.map((item) =>
    'genderId' in item ? item.genderId : item.disabilityId,
  )
  const updatedIds = updated.map((item) => ('genderId' in item ? item.genderId : item.disabilityId))
  return originalIds.filter((id) => !updatedIds.includes(id))
}

export const updateCollections: GlobalBeforeChangeHook = async ({
  originalDoc,
  data,
  req: { payload, locale },
}) => {
  const { userData } = data
  const { userData: originalUserData } = originalDoc

  // Checks for current user Data to update
  if (userData && userData.genders?.length > 0) {
    data = await updateRelatedCollection({ payload, locale, data, collection: 'gender' })
  }

  if (userData && userData.disabilities?.length > 0) {
    data = await updateRelatedCollection({ payload, locale, data, collection: 'disability' })
  }

  // Check for original user Data to delete deleted files
  if (
    originalUserData &&
    (originalUserData.genders?.length > 0 || originalUserData.disabilities?.length > 0)
  ) {
    const deletedGenders = wasDeleted(originalUserData?.genders || [], userData?.genders || [])
    const deletedDisabilities = wasDeleted(
      originalUserData?.disabilities || [],
      userData?.disabilities || [],
    )

    if (deletedGenders.length > 0) {
      for (const genderToDelete of deletedGenders) {
        await payload.delete({
          collection: 'gender',
          id: genderToDelete,
        })
      }
    }

    if (deletedDisabilities.length > 0) {
      for (const disabilityToDelete of deletedDisabilities) {
        await payload.delete({
          collection: 'disability',
          id: disabilityToDelete,
        })
      }
    }
  }

  return data
}
