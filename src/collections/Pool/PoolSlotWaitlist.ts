import type { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'
import { isAdminOrSelf } from '@/access/isAdminOrSelf'

export const PoolSlotWaitlist: CollectionConfig = {
  slug: 'pool-slot-waitlist',
  labels: {
    plural: { en: 'Pool Slot Waitlist', pt: 'Lista de Espera de Horários de Piscina' },
    singular: { en: 'Pool Slot Waitlist Entry', pt: 'Entrada na Lista de Espera de Horário' },
  },
  access: {
    create: isAdmin,
    read: isAdminOrSelf,
    update: isAdmin,
    delete: isAdmin,
  },
  admin: {
    defaultColumns: ['athlete', 'cycle', 'slotId', 'position', 'createdAt'],
    useAsTitle: 'slotId',
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
    {
      name: 'position',
      label: { en: 'Waitlist Position', pt: 'Posição na Lista de Espera' },
      type: 'number',
      required: true,
      admin: { readOnly: true },
    },
  ],
}
