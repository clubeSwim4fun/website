import { getPayload } from 'payload'
import config from '@payload-config'

const SUPPORTED_LOCALES = ['pt', 'en']

function detectLocale(req: Request, urlLocale?: string | null): string {
  // 1. Locale embedded in the URL (most reliable — set at send time)
  if (urlLocale && SUPPORTED_LOCALES.includes(urlLocale)) return urlLocale

  // 2. Accept-Language header (browser preference, unreliable from email clients)
  const accept = req.headers.get('accept-language') ?? ''
  for (const part of accept.split(',')) {
    const lang = part.split(';')[0]?.trim().split('-')[0]?.toLowerCase() ?? ''
    if (SUPPORTED_LOCALES.includes(lang)) return lang
  }

  return 'pt'
}

export async function GET(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')
  const urlLocale = searchParams.get('locale')
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? ''
  const locale = detectLocale(req, urlLocale)

  const redirectTo = (status: string) =>
    Response.redirect(`${baseUrl}/${locale}/newsletter-unsubscribe?status=${status}`, 302)

  if (!token || token.length !== 32 || !/^[0-9a-f]+$/.test(token)) {
    return redirectTo('invalid')
  }

  try {
    const payload = await getPayload({ config })

    const result = await payload.find({
      collection: 'newsletters',
      where: { 'recipients.trackingToken': { equals: token } },
      limit: 1,
      depth: 0,
    })

    const newsletter = result.docs[0]
    if (!newsletter) return redirectTo('invalid')

    const recipients = (newsletter.recipients ?? []) as Array<{
      user?: string | null
      trackingToken?: string | null
    }>

    const recipient = recipients.find((r) => r.trackingToken === token)
    if (!recipient?.user) return redirectTo('invalid')

    await payload.update({
      collection: 'users',
      id: recipient.user as string,
      data: { emailNotificationsEnabled: false },
    })

    return redirectTo('success')
  } catch {
    return redirectTo('error')
  }
}
