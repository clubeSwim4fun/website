import { Block } from 'payload'

export const Media: Block = {
  slug: 'media',
  interfaceName: 'MediaUpload',
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'label',
      type: 'text',
      required: true,
    },
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'required',
      type: 'checkbox',
    },
  ],
}
