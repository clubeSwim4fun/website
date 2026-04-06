import type { Block } from 'payload'
import { defaultLexical } from '@/fields/defaultLexical'
import { blockVisibilityDynamicField } from '@/fields/blockVisibilityDynamic'

export const FormBlock: Block = {
  slug: 'formBlock',
  interfaceName: 'FormBlock',
  fields: [
    blockVisibilityDynamicField,
    {
      name: 'form',
      type: 'relationship',
      relationTo: 'forms',
      required: false,
      admin: {
        description: 'Select the form to display in this block',
      },
    },
    {
      name: 'isRegistrationForm',
      label: 'Formulário para Registo de utilizador?',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'enableIntro',
      type: 'checkbox',
      label: 'Enable Intro Content',
    },
    {
      name: 'introContent',
      type: 'richText',
      admin: {
        condition: (_, { enableIntro }) => Boolean(enableIntro),
      },
      editor: defaultLexical,
      label: 'Intro Content',
    },
  ],
  graphQL: {
    singularName: 'FormBlock',
  },
  labels: {
    plural: 'Form Blocks',
    singular: 'Form Block',
  },
}
