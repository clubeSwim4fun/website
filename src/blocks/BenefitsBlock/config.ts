import type { Block } from 'payload'
import { blockVisibilityDynamicField } from '@/fields/blockVisibilityDynamic'
import { statsFields } from '@/fields/statsFields'

export const BenefitsBlock: Block = {
  slug: 'benefitsBlock',
  interfaceName: 'BenefitsBlock',
  labels: {
    singular: { en: 'Benefits Page', pt: 'Página de Benefícios' },
    plural: { en: 'Benefits Pages', pt: 'Páginas de Benefícios' },
  },
  fields: [
    blockVisibilityDynamicField,

    // ── Hero ──────────────────────────────────────────────────────────
    {
      name: 'hero',
      type: 'group',
      label: { en: 'Hero', pt: 'Hero' },
      fields: [
        {
          name: 'eyebrow',
          type: 'text',
          localized: true,
          label: { en: 'Eyebrow badge', pt: 'Badge superior' },
          defaultValue: 'Área de sócios',
        },
        {
          name: 'title',
          type: 'text',
          localized: true,
          required: true,
          label: { en: 'Title', pt: 'Título' },
          defaultValue: 'Benefícios para os Sócios',
        },
        {
          name: 'description',
          type: 'textarea',
          localized: true,
          label: { en: 'Description', pt: 'Descrição' },
        },
        statsFields({ maxRows: 3, admin: { initCollapsed: true } }),
      ],
    },

    // ── Info box ──────────────────────────────────────────────────────
    {
      name: 'infoBox',
      type: 'group',
      label: { en: 'Info box', pt: 'Caixa de informação' },
      fields: [
        {
          name: 'content',
          type: 'richText',
          localized: true,
          label: { en: 'Content', pt: 'Conteúdo' },
        },
      ],
    },

    // ── Pool section ──────────────────────────────────────────────────
    {
      name: 'pool',
      type: 'group',
      label: { en: 'Pool section', pt: 'Secção Piscina' },
      fields: [
        {
          name: 'sectionLabel',
          type: 'text',
          localized: true,
          label: { en: 'Section label', pt: 'Rótulo da secção' },
          defaultValue: 'Treinos',
        },
        {
          name: 'title',
          type: 'text',
          localized: true,
          label: { en: 'Title', pt: 'Título' },
          defaultValue: 'Piscina Jamor',
        },
        {
          name: 'description',
          type: 'textarea',
          localized: true,
          label: { en: 'Description', pt: 'Descrição' },
        },
        {
          name: 'cardTitle',
          type: 'text',
          localized: true,
          label: { en: 'Card title', pt: 'Título do cartão' },
        },
        {
          name: 'cardDesc',
          type: 'textarea',
          localized: true,
          label: { en: 'Card description', pt: 'Descrição do cartão' },
        },
        {
          name: 'schedule',
          type: 'text',
          localized: true,
          label: { en: 'Schedule', pt: 'Horário' },
        },
        {
          name: 'location',
          type: 'text',
          localized: true,
          label: { en: 'Location', pt: 'Localização' },
        },
        {
          name: 'cost',
          type: 'text',
          localized: true,
          label: { en: 'Cost', pt: 'Custo' },
        },
        {
          name: 'cta',
          type: 'text',
          localized: true,
          label: { en: 'CTA button text', pt: 'Texto do botão CTA' },
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: { en: 'Pool image', pt: 'Imagem da piscina' },
        },
      ],
    },

    // ── Nutrition partners ────────────────────────────────────────────
    {
      name: 'nutrition',
      type: 'group',
      label: { en: 'Nutrition section', pt: 'Secção Nutrição' },
      fields: [
        {
          name: 'sectionLabel',
          type: 'text',
          localized: true,
          label: { en: 'Section label', pt: 'Rótulo da secção' },
        },
        {
          name: 'title',
          type: 'text',
          localized: true,
          label: { en: 'Title', pt: 'Título' },
        },
        {
          name: 'description',
          type: 'textarea',
          localized: true,
          label: { en: 'Description', pt: 'Descrição' },
        },
        {
          name: 'partners',
          type: 'array',
          label: { en: 'Partners', pt: 'Parceiros' },
          admin: { initCollapsed: true },
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'name',
                  type: 'text',
                  required: true,
                  label: { en: 'Name', pt: 'Nome' },
                  admin: { width: '40%' },
                },
                {
                  name: 'discount',
                  type: 'text',
                  required: true,
                  label: { en: 'Discount (e.g. -12%)', pt: 'Desconto (ex: -12%)' },
                  admin: { width: '20%' },
                },
                {
                  name: 'color',
                  type: 'select',
                  required: true,
                  label: { en: 'Color', pt: 'Cor' },
                  admin: { width: '40%' },
                  options: [
                    { label: 'Blue', value: 'blue' },
                    { label: 'Green', value: 'green' },
                    { label: 'Amber', value: 'amber' },
                    { label: 'Coral', value: 'coral' },
                    { label: 'Purple', value: 'purple' },
                  ],
                },
              ],
            },
            {
              name: 'icon',
              type: 'select',
              label: { en: 'Icon', pt: 'Ícone' },
              defaultValue: 'circle',
              options: [
                { label: { en: 'Circle (generic)', pt: 'Círculo (genérico)' }, value: 'circle' },
                { label: { en: 'Nutrition / Cup', pt: 'Nutrição / Copo' }, value: 'nutrition' },
                { label: { en: 'Drop / Hydration', pt: 'Gota / Hidratação' }, value: 'drop' },
                { label: { en: 'Heart / Wellness', pt: 'Coração / Bem-estar' }, value: 'heart' },
                { label: { en: 'Waves / Swimming', pt: 'Ondas / Natação' }, value: 'waves' },
                { label: { en: 'Star / Premium', pt: 'Estrela / Premium' }, value: 'star' },
                { label: { en: 'Bolt / Energy', pt: 'Raio / Energia' }, value: 'bolt' },
                { label: { en: 'Leaf / Natural', pt: 'Folha / Natural' }, value: 'leaf' },
                { label: { en: 'Shield / Protection', pt: 'Escudo / Proteção' }, value: 'shield' },
                { label: { en: 'Tag / Discount', pt: 'Etiqueta / Desconto' }, value: 'tag' },
              ],
            },
            {
              name: 'description',
              type: 'textarea',
              localized: true,
              label: { en: 'Description', pt: 'Descrição' },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'code',
                  type: 'text',
                  label: { en: 'Discount code', pt: 'Código de desconto' },
                  admin: { width: '50%' },
                },
                {
                  name: 'href',
                  type: 'text',
                  required: true,
                  label: { en: 'Website URL', pt: 'URL do site' },
                  admin: { width: '50%' },
                },
              ],
            },
          ],
        },
      ],
    },

    // ── Equipment partners ────────────────────────────────────────────
    {
      name: 'equipment',
      type: 'group',
      label: { en: 'Equipment section', pt: 'Secção Equipamentos' },
      fields: [
        {
          name: 'sectionLabel',
          type: 'text',
          localized: true,
          label: { en: 'Section label', pt: 'Rótulo da secção' },
        },
        {
          name: 'title',
          type: 'text',
          localized: true,
          label: { en: 'Title', pt: 'Título' },
        },
        {
          name: 'description',
          type: 'textarea',
          localized: true,
          label: { en: 'Description', pt: 'Descrição' },
        },
        {
          name: 'partners',
          type: 'array',
          label: { en: 'Partners', pt: 'Parceiros' },
          admin: { initCollapsed: true },
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'name',
                  type: 'text',
                  required: true,
                  label: { en: 'Name', pt: 'Nome' },
                  admin: { width: '40%' },
                },
                {
                  name: 'discount',
                  type: 'text',
                  required: true,
                  label: { en: 'Discount', pt: 'Desconto' },
                  admin: { width: '20%' },
                },
                {
                  name: 'color',
                  type: 'select',
                  required: true,
                  label: { en: 'Color', pt: 'Cor' },
                  admin: { width: '40%' },
                  options: [
                    { label: 'Blue', value: 'blue' },
                    { label: 'Green', value: 'green' },
                    { label: 'Amber', value: 'amber' },
                    { label: 'Coral', value: 'coral' },
                    { label: 'Purple', value: 'purple' },
                  ],
                },
              ],
            },
            {
              name: 'icon',
              type: 'select',
              label: { en: 'Icon', pt: 'Ícone' },
              defaultValue: 'circle',
              options: [
                { label: { en: 'Circle (generic)', pt: 'Círculo (genérico)' }, value: 'circle' },
                { label: { en: 'Nutrition / Cup', pt: 'Nutrição / Copo' }, value: 'nutrition' },
                { label: { en: 'Drop / Hydration', pt: 'Gota / Hidratação' }, value: 'drop' },
                { label: { en: 'Heart / Wellness', pt: 'Coração / Bem-estar' }, value: 'heart' },
                { label: { en: 'Waves / Swimming', pt: 'Ondas / Natação' }, value: 'waves' },
                { label: { en: 'Star / Premium', pt: 'Estrela / Premium' }, value: 'star' },
                { label: { en: 'Bolt / Energy', pt: 'Raio / Energia' }, value: 'bolt' },
                { label: { en: 'Leaf / Natural', pt: 'Folha / Natural' }, value: 'leaf' },
                { label: { en: 'Shield / Protection', pt: 'Escudo / Proteção' }, value: 'shield' },
                { label: { en: 'Tag / Discount', pt: 'Etiqueta / Desconto' }, value: 'tag' },
              ],
            },
            {
              name: 'description',
              type: 'textarea',
              localized: true,
              label: { en: 'Description', pt: 'Descrição' },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'variant',
                  type: 'select',
                  required: true,
                  label: { en: 'Variant', pt: 'Variante' },
                  defaultValue: 'code',
                  admin: { width: '30%' },
                  options: [
                    { label: { en: 'Discount code', pt: 'Código de desconto' }, value: 'code' },
                    { label: { en: 'Via contact', pt: 'Via contacto' }, value: 'contact' },
                  ],
                },
                {
                  name: 'codeOrContact',
                  type: 'text',
                  label: { en: 'Code or contact name', pt: 'Código ou nome do contacto' },
                  admin: { width: '35%' },
                },
                {
                  name: 'href',
                  type: 'text',
                  required: true,
                  label: { en: 'Website URL', pt: 'URL do site' },
                  admin: { width: '35%' },
                },
              ],
            },
            {
              name: 'disclaimer',
              type: 'text',
              localized: true,
              label: { en: 'Disclaimer (optional)', pt: 'Aviso (opcional)' },
            },
          ],
        },
      ],
    },

    // ── Races / SwimGP ────────────────────────────────────────────────
    {
      name: 'races',
      type: 'group',
      label: { en: 'Races section', pt: 'Secção Provas' },
      fields: [
        {
          name: 'sectionLabel',
          type: 'text',
          localized: true,
          label: { en: 'Section label', pt: 'Rótulo da secção' },
        },
        {
          name: 'title',
          type: 'text',
          localized: true,
          label: { en: 'Title', pt: 'Título' },
        },
        {
          name: 'description',
          type: 'textarea',
          localized: true,
          label: { en: 'Description', pt: 'Descrição' },
        },
        {
          name: 'swimgpLabel',
          type: 'text',
          localized: true,
          label: { en: 'SwimGP badge label', pt: 'Rótulo do badge SwimGP' },
        },
        {
          name: 'swimgpTitle',
          type: 'text',
          localized: true,
          label: { en: 'SwimGP title', pt: 'Título SwimGP' },
        },
        {
          name: 'swimgpDescription',
          type: 'textarea',
          localized: true,
          label: { en: 'SwimGP description', pt: 'Descrição SwimGP' },
        },
        {
          name: 'teamCodeLabel',
          type: 'text',
          localized: true,
          label: { en: 'Team code label', pt: 'Rótulo código de equipa' },
        },
        {
          name: 'teamCode',
          type: 'text',
          label: { en: 'Team code', pt: 'Código de equipa' },
        },
        {
          name: 'promoCodeLabel',
          type: 'text',
          localized: true,
          label: { en: 'Promo code label', pt: 'Rótulo código promocional' },
        },
        {
          name: 'promoCode',
          type: 'text',
          label: { en: 'Promo code', pt: 'Código promocional' },
        },
      ],
    },
  ],
}
