import type { BasePayload, Payload, TypedLocale } from 'payload'
import { GlobalBeforeChangeHook } from 'payload'

type CollectionData = {
  id: string
  collectionId: string
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
  collection: 'gender' | 'disability' | 'aboutClub'
}) => {
  const dataProperty =
    collection === 'gender' ? 'genders' : collection === 'disability' ? 'disabilities' : collection
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

          data.userData.genders[index].collectionId = response.docs[0]?.id
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

        if (collection === 'gender') {
          if (userData.genders[index]) {
            userData.genders[index].collectionId = response.id
          }
        } else if (collection === 'disability') {
          if (userData.disabilities[index]) {
            userData.disabilities[index].collectionId = response.id
          }
        } else if (collection === 'aboutClub') {
          if (userData.aboutClub[index]) {
            userData.aboutClub[index].collectionId = response.id
          }
        }
      }
    } catch (error) {
      payload.logger.error('error while creating gender', error)
    }
  }

  return data
}

const wasDeleted = (original: CollectionData[], updated: CollectionData[]) => {
  const originalIds = original.map((item) => item.collectionId)
  const updatedIds = updated.map((item) => item.collectionId)
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

  if (userData && userData.aboutClub?.length > 0) {
    data = await updateRelatedCollection({ payload, locale, data, collection: 'aboutClub' })
  }

  // Check for original user Data to delete deleted files
  if (
    originalUserData &&
    (originalUserData.genders?.length > 0 || originalUserData.disabilities?.length > 0)
  ) {
    const deletedGenders = wasDeleted(originalUserData?.genders || [], userData?.genders || [])
    const deletedAboutClub = wasDeleted(
      originalUserData?.aboutClub || [],
      userData?.aboutClub || [],
    )
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

    if (deletedAboutClub.length > 0) {
      for (const aboutToDelete of deletedAboutClub) {
        await payload.delete({
          collection: 'aboutClub',
          id: aboutToDelete,
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
