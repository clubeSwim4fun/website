import type { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'
import { isAdminOrSelf } from '@/access/isAdminOrSelf'

export const PoolSlotRegistrations: CollectionConfig = {
  slug: 'pool-slot-registrations',
  labels: {
    plural: { en: 'Pool Slot Registrations', pt: 'Inscrições em Horários de Piscina' },
    singular: { en: 'Pool Slot Registration', pt: 'Inscrição em Horário de Piscina' },
  },
  access: {
    create: isAdmin,
    read: isAdminOrSelf,
    update: isAdmin,
    delete: isAdmin,
  },
  admin: {
    defaultColumns: ['athlete', 'cycle', 'slotDay', 'slotTime', 'createdAt'],
    useAsTitle: 'slotDay',
  },
  fields: [
    {
      name: 'athlete',
      label: { en: 'Athlete', pt: 'Atleta' },
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'cycle',
      label: { en: 'Pool Cycle', pt: 'Ciclo de Piscina' },
      type: 'relationship',
      relationTo: 'pool-cycles',
      required: true,
    },
    {
      name: 'slotId',
      label: { en: 'Slot ID', pt: 'ID do Horário' },
      type: 'text',
      required: true,
      admin: { readOnly: true },
    },
    {
      name: 'slotDay',
      label: { en: 'Day', pt: 'Dia' },
      type: 'text',
      required: true,
      admin: { readOnly: true },
    },
    {
      name: 'slotTime',
      label: { en: 'Time', pt: 'Hora' },
      type: 'text',
      required: true,
      admin: { readOnly: true },
    },
  ],
}
