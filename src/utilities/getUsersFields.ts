import { Users } from '@/collections/Users'
import { Field, Option } from 'payload'

const userCollection = Users

// `email` is injected by Payload auth and not present in Users.fields
const userCollectionFieldsName: Option[] = [{ value: 'email', label: { en: 'Email', pt: 'Email' } }]

const checkFields = (fields: Field[]) => {
  fields.forEach((field) => {
    if (
      field.type !== 'row' &&
      field.type !== 'array' &&
      field.type !== 'collapsible' &&
      field.type !== 'tabs'
    ) {
      if ('name' in field && typeof field.name === 'string') {
        userCollectionFieldsName.push({
          value: field.name,
          label: field.label || field.name,
        })
      }
    } else if (field.type === 'row') {
      checkFields(field.fields)
    }
  })
}

checkFields(userCollection.fields)

export default userCollectionFieldsName
