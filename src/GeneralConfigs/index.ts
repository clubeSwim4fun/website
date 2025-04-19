import type { GlobalConfig } from 'payload'

import { revalidateConfigs } from './hooks/revalidateConfigs'
import { updateCollections } from './hooks/updateCollections'

export const GeneralConfigs: GlobalConfig = {
  slug: 'generalConfigs',
  label: {
    en: 'General Configs',
    pt: 'Configurações Gerais',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          name: 'userData',
          fields: [
            {
              name: 'genders',
              type: 'array',
              fields: [
                {
                  name: 'label',
                  localized: true,
                  type: 'text',
                  required: true,
                },
                {
                  name: 'value',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'genderId',
                  type: 'text',
                  admin: {
                    hidden: true,
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [updateCollections],
    afterChange: [revalidateConfigs],
  },
}
