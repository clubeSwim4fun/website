/**
 * Seed script: creates the SwimRun 1ª Etapa Tróia event in PayloadCMS.
 * Run with: npx tsx scripts/seed-swimrun-troia.ts
 */
import { getPayload } from 'payload'
import configPromise from '@payload-config'

async function main() {
  const payload = await getPayload({ config: configPromise })

  // Find or create the "Águas Abertas" category
  const categories = await payload.find({ collection: 'categories', limit: 50 })
  let category = categories.docs.find((c) => c.slug === 'aguas-abertas')

  if (!category) {
    category = await payload.create({
      collection: 'categories',
      data: { title: 'Águas Abertas', slug: 'aguas-abertas' },
    })
    console.log('Created category:', category.id)
  } else {
    console.log('Found category:', category.id)
  }

  // Check if event already exists
  const existing = await payload.find({
    collection: 'events',
    where: { slug: { equals: 'swimrun-1a-etapa-troia' } },
    limit: 1,
  })

  if (existing.docs.length > 0) {
    console.log('Event already exists:', existing.docs[0].id)
    process.exit(0)
  }

  const event = await payload.create({
    collection: 'events',
    data: {
      title: 'SwimRun 1ª etapa Tróia',
      start: '2026-04-19T07:00:00.000Z',
      end: '2026-04-19T14:00:00.000Z',
      timeToBeConfirmed: false,
      isRiver: false,
      category: category.id,
      hasTshirt: false,
      promoCode: 'SWIM4FUN_TROIA',
      memberDiscount: 20,
      externalRegistrationUrl: 'https://bit.ly/TroiaSwimrun2026',
      address: {
        street: 'Tróia',
        state: 'Grândola',
        country: 'Portugal',
      },
      distanceCategories: [
        {
          name: 'STANDARD',
          totalDistance: 23600,
          swimDistance: 4400,
          runDistance: 19200,
          transitions: '6 Natação / 7 Corrida',
          longestSwim: 1100,
          longestRun: 5500,
          elevationGain: 200,
          timeLimit: '6 Horas',
          registrationUrl: 'https://bit.ly/TroiaSwimrun2026',
        },
        {
          name: 'SPRINT',
          totalDistance: 15100,
          swimDistance: 3200,
          runDistance: 11900,
          transitions: '4 Natação / 5 Corrida',
          longestSwim: 1300,
          longestRun: 5000,
          elevationGain: 176,
          timeLimit: '4 Horas',
          registrationUrl: 'https://bit.ly/TroiaSwimrun2026',
        },
        {
          name: 'EXPERIENCE',
          totalDistance: 10800,
          swimDistance: 1200,
          runDistance: 9600,
          transitions: '2 Natação / 3 Corrida',
          longestSwim: 800,
          longestRun: 5500,
          elevationGain: 120,
          timeLimit: '3 Horas',
          registrationUrl: 'https://bit.ly/TroiaSwimrun2026',
        },
      ],
      slug: 'swimrun-1a-etapa-troia',
      slugLock: true,
      description: {
        root: {
          type: 'root',
          children: [
            {
              type: 'heading',
              tag: 'h2',
              children: [{ type: 'text', text: 'Sobre Tróia SwimRun', version: 1 }],
              version: 1,
            },
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  version: 1,
                  text: 'Situada numa zona de grande beleza natural, a Península de Tróia com a sua faixa de areia dourada com cerca de 17km de comprimento e 1,5km de largura, rodeada por um mar azul e pelo Rio Sado, faz de Tróia um destino privilegiado para acolher o Swimrun, enquadrando-se perfeitamente no espírito desta modalidade.',
                },
              ],
              version: 1,
            },
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  version: 1,
                  text: 'Toda a paisagem deste local é deslumbrante, com os seus extensos areais, bancos de areia selvagens, a laguna da Caldeira em pleno estuário do Sado, guardada pelas seculares ruínas romanas e um habitat natural de golfinhos no mar a sul. Tudo isto bem guardado sob o olhar atento da majestosa Serra da Arrábida, como pano de fundo.',
                },
              ],
              version: 1,
            },
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  version: 1,
                  text: 'A 4ª edição do Tróia Swimrun irá novamente contar o formato "Swimrun Kids", onde os mais novos podem tomar contacto com o nosso desporto, partilhando essa experiência com todos os seus parceiros.',
                },
              ],
              version: 1,
            },
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  version: 1,
                  text: 'A organização desta etapa conta mais uma vez com o apoio do Município de Grândola e do Clube Amiciclo Grândola, parceiros fundamentais no sucesso da nossa primeira edição.',
                },
              ],
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        },
      },
    },
  })

  console.log('✅ Event created:', event.id, event.slug)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
