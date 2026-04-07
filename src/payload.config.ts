// storage-adapter-import-placeholder
import { mongooseAdapter } from '@payloadcms/db-mongodb'

import sharp from 'sharp' // sharp-import
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'
import { pt } from '@payloadcms/translations/languages/pt'
import { en } from '@payloadcms/translations/languages/en'

import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Users } from './collections/Users'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { getServerSideURL } from './utilities/getURL'
import { Groups } from './collections/Groups/Groups'
import { GroupCategories } from './collections/Groups/GroupCategories'
import { UserMedia } from './collections/Users/Media'
import { Events } from './collections/Events/Events'
import { Carts } from './collections/Ecommerce/Carts'
import { Tickets } from './collections/Events/Tickets'
import { Orders } from './collections/Ecommerce/Orders'
import localization from './i18n/localization'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import nodemailer from 'nodemailer'
import { Gender } from './collections/Users/Genders'
import { GeneralConfigs } from './GeneralConfigs'
import { Disability } from './collections/Users/Disability'
import { AboutClub } from './collections/Users/HeardAboutClub'
import { FederationHistory } from './collections/Users/FederationHistory'
import { Subscription } from './collections/Users/Subscription'
import { GroupSubscription } from './collections/Groups/GroupSubscription'
import { PoolCycles } from '@/collections/Pool/PoolCycles'
import { PoolSubscriptions } from '@/collections/Pool/PoolSubscriptions'
import { PoolSlotRegistrations } from '@/collections/Pool/PoolSlotRegistrations'
import { PoolSlotWaitlist } from '@/collections/Pool/PoolSlotWaitlist'
import { PostComments } from './collections/Posts/PostComments'
import { PostLikes } from './collections/Posts/PostLikes'
import { Newsletters } from './collections/Newsletters'
import { dashboardPool } from './admin/endpoints/dashboardPool'
import { dashboardPoolSlot, dashboardPoolWeek } from './admin/endpoints/dashboardPoolSlot'
import { dashboardMembers } from './admin/endpoints/dashboardMembers'
import { dashboardEvents } from './admin/endpoints/dashboardEvents'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  i18n: {
    fallbackLanguage: 'pt',
    supportedLanguages: { pt, en },
  },
  endpoints: [
    dashboardPool,
    dashboardPoolSlot,
    dashboardPoolWeek,
    dashboardMembers,
    dashboardEvents,
  ],
  admin: {
    suppressHydrationWarning: true,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    components: {
      views: {
        ClubDashboard: {
          Component: '@/admin/views/ClubDashboard#default',
          path: '/dashboard',
        },
      },
      afterNavLinks: ['@/admin/components/DashboardNavLinks#default'],
      afterDashboard: ['@/admin/components/DashboardLinks#default'],
    },
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
  }),
  collections: [
    Pages,
    Posts,
    Media,
    Categories,
    Users,
    UserMedia,
    FederationHistory,
    Groups,
    GroupCategories,
    Events,
    Carts,
    Tickets,
    Orders,
    Gender,
    Disability,
    AboutClub,
    Subscription,
    GroupSubscription,
    PoolCycles,
    PoolSubscriptions,
    PoolSlotRegistrations,
    PoolSlotWaitlist,
    PostComments,
    PostLikes,
    Newsletters,
  ],
  cors: [getServerSideURL()].filter(Boolean),
  globals: [Header, Footer, GeneralConfigs],
  plugins: [
    ...plugins,
    // storage-adapter-placeholder
    s3Storage({
      collections: {
        'user-media': {
          prefix: `user_media`,
        },
        media: {
          prefix: 'site',
        },
      },
      bucket: process.env.S3_BUCKET || '',
      config: {
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
        region: process.env.S3_REGION,
        // ... Other S3 configuration
      },
    }),
  ],
  localization,
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${process.env.CRON_SECRET}`
      },
    },
    tasks: [],
  },
  email: nodemailerAdapter({
    defaultFromAddress: 'noreply@clube-swim4fun.pt',
    defaultFromName: 'Clube Swim4Fun',
    // Any Nodemailer transport
    transport: await nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    }),
  }),
})
