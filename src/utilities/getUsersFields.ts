import { Users } from '@/collections/Users'
import { Field, Option } from 'payload'

const userCollection = Users

const userCollectionFieldsName: Option[] = []

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
