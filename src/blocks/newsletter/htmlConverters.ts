import type { Payload, Where } from 'payload'
import type { Media, Post } from '@/payload-types'

const buttonColors: Record<string, string> = {
  blue: '#2D6CB3',
  green: '#2e7d32',
  red: '#c62828',
}

const colWidths: Record<string, string> = {
  oneThird: '33.33%',
  half: '50%',
  twoThirds: '66.66%',
  full: '100%',
}

const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? ''

function internalDocToUrl(relationTo: string, value: unknown): string {
  const slug = typeof value === 'object' && value !== null ? (value as any).slug : null
  if (!slug) return baseUrl
  return relationTo === 'posts' ? `${baseUrl}/posts/${slug}` : `${baseUrl}/${slug}`
}

export function buildLinkConverters() {
  return {
    link: async ({ node, nodesToHTML }: any): Promise<string> => {
      const fields = node.fields ?? {}
      const children = await nodesToHTML({ nodes: node.children ?? [] })

      let href: string
      if (fields.linkType === 'internal' && fields.doc) {
        const { relationTo, value } = fields.doc
        href = internalDocToUrl(relationTo, value)
      } else {
        href = fields.url ?? '#'
      }

      const target = fields.newTab ? ' target="_blank" rel="noopener noreferrer"' : ''
      return `<a href="${href}"${target} style="color:#2D6CB3;">${children}</a>`
    },
  }
}

export function ctaBlockToHtml(fields: Record<string, unknown>): string {
  const color = buttonColors[(fields.buttonColor as string) ?? 'blue'] ?? buttonColors.blue
  const text = fields.text
    ? `<p style="margin:0 0 16px;color:#555;font-size:15px;">${fields.text}</p>`
    : ''
  return `<div style="background:#f0f4fa;border-radius:8px;padding:24px;margin:24px 0;text-align:center;">
  <h2 style="margin:0 0 8px;font-size:20px;color:#1a1a1a;">${fields.title ?? ''}</h2>
  ${text}
  <a href="${fields.buttonUrl ?? '#'}" style="display:inline-block;background:${color};color:#fff;padding:10px 24px;border-radius:4px;text-decoration:none;font-weight:bold;font-size:15px;">${fields.buttonLabel ?? ''}</a>
</div>`
}

export async function postsBlockToHtml(
  fields: Record<string, unknown>,
  payload: Payload,
): Promise<string> {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? ''
  let posts: Partial<Post>[] = []

  if (fields.populateBy === 'selection') {
    const selected = (fields.selectedPosts ?? []) as (string | Post)[]
    if (selected.length > 0) {
      const ids = selected.map((p) => (typeof p === 'string' ? p : (p as Post).id))
      const result = await payload.find({
        collection: 'posts',
        where: { id: { in: ids } },
        depth: 1,
        limit: 10,
      })
      posts = result.docs
    }
  } else {
    const where: Where = { _status: { equals: 'published' } }
    if (fields.category) where['categories'] = { equals: fields.category as string }
    const result = await payload.find({
      collection: 'posts',
      where,
      sort: '-publishedAt',
      limit: (fields.limit as number) ?? 3,
      depth: 1,
    })
    posts = result.docs
  }

  const showImage = fields.showImage !== false

  const sectionTitle = fields.title
    ? `<h3 style="margin:0 0 12px;font-size:18px;color:#1a1a1a;">${fields.title}</h3>`
    : ''

  const cards = posts
    .map((post) => {
      const title = typeof post.title === 'string' ? post.title : ''
      const description = (post.meta as { description?: string } | undefined)?.description ?? ''
      const url = `${baseUrl}/posts/${post.slug ?? ''}`
      const heroImage = post.heroImage as Media | null | undefined
      const imageUrl =
        showImage && heroImage && typeof heroImage === 'object' ? heroImage.url : null

      const imgHtml = imageUrl
        ? `<a href="${url}"><img src="${imageUrl}" alt="${heroImage?.alt ?? title}" style="display:block;width:100%;height:180px;object-fit:cover;border-radius:4px 4px 0 0;margin-bottom:0;" /></a>`
        : ''

      const bodyStyle = imageUrl ? 'padding:12px 16px 16px;' : 'padding:16px;'

      return `<div style="border:1px solid #e0e0e0;border-radius:6px;margin:8px 0;overflow:hidden;">
  ${imgHtml}
  <div style="${bodyStyle}">
    <a href="${url}" style="text-decoration:none;color:#2D6CB3;font-size:17px;font-weight:bold;line-height:1.3;">${title}</a>
    ${description ? `<p style="margin:6px 0 0;color:#555;font-size:14px;">${description}</p>` : ''}
  </div>
</div>`
    })
    .join('\n')

  return `<div style="margin:24px 0;">${sectionTitle}${cards}</div>`
}

export async function layoutBlockToHtml(
  fields: Record<string, unknown>,
  payload: Payload,
): Promise<string> {
  const { convertLexicalToHTMLAsync, defaultHTMLConvertersAsync } = await import(
    '@payloadcms/richtext-lexical/html-async'
  )

  const columns = (fields.columns ?? []) as Array<{
    size?: string
    richText?: unknown
  }>

  const cells = await Promise.all(
    columns.map(async (col) => {
      const width = colWidths[col.size ?? 'half'] ?? '50%'
      const html = col.richText
        ? await convertLexicalToHTMLAsync({
            converters: {
              ...defaultHTMLConvertersAsync,
              ...buildLinkConverters(),
              blocks: {
                newsletterCta: async ({ node }) =>
                  ctaBlockToHtml(node.fields as Record<string, unknown>),
                newsletterPosts: async ({ node }) =>
                  postsBlockToHtml(node.fields as Record<string, unknown>, payload),
              },
            },
            data: col.richText as Parameters<typeof convertLexicalToHTMLAsync>[0]['data'],
          })
        : ''
      return `<td style="width:${width};vertical-align:top;padding:0 8px;">${html}</td>`
    }),
  )

  return `<table style="width:100%;border-collapse:collapse;margin:24px 0;" cellpadding="0" cellspacing="0">
  <tr>${cells.join('')}</tr>
</table>`
}
