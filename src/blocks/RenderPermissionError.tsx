import { Group, GroupCategory, Page, Post, User } from '@/payload-types'
import { PageVisibilityResponse } from '@/utilities/pageValidations'
import RichText from '@/components/RichText'
import { CMSLink } from '@/components/Link'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

type RichTextContent = {
  root: {
    type: string
    children: {
      type: string
      version: number
      [k: string]: unknown
    }[]
    direction: ('ltr' | 'rtl') | null
    format: 'left' | 'start' | 'center' | 'right' | 'end' | 'justify' | ''
    indent: number
    version: number
  }
  [k: string]: unknown
}

type LinkItem = {
  link: {
    type?: ('reference' | 'custom' | 'subscription') | null
    newTab?: boolean | null
    reference?:
      | ({ relationTo: 'pages'; value: string | Page } | null)
      | ({ relationTo: 'posts'; value: string | Post } | null)
    subscriptionGroup?: (string | null) | Group
    url?: string | null
    label: string
    appearance?: ('default' | 'outline') | null
  }
  id?: string | null
}

type VisibilityGroup =
  | { relationTo: 'groups'; value: string | Group }
  | { relationTo: 'group-categories'; value: string | GroupCategory }

type VisibilityConfig = {
  groups?: VisibilityGroup[] | null
  errorMessage?: RichTextContent | null
  links?: LinkItem[] | null
  backgroundColor?: BackgroundColor | null
}

type BackgroundColor = 'green' | 'blue' | 'dark' | 'light' | 'red'

const bgClasses: Record<BackgroundColor, string> = {
  green: 'bg-gradient-to-br from-[#1a5c3a] to-[#0d3d26] text-white',
  blue: 'bg-gradient-to-br from-[#1a3a5c] to-[#0d2640] text-white',
  dark: 'bg-gradient-to-br from-[#1a1a2e] to-[#0d0d1a] text-white',
  light: 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900',
  red: 'bg-gradient-to-br from-[#5c1a1a] to-[#3d0d0d] text-white',
}

const badgeBgClasses: Record<BackgroundColor, string> = {
  green: 'bg-white/10 border-white/20 text-white',
  blue: 'bg-white/10 border-white/20 text-white',
  dark: 'bg-white/10 border-white/20 text-white',
  light: 'bg-black/5 border-black/10 text-gray-900',
  red: 'bg-white/10 border-white/20 text-white',
}

const subtitleClasses: Record<BackgroundColor, string> = {
  green: 'text-white/80',
  blue: 'text-white/80',
  dark: 'text-white/80',
  light: 'text-gray-500',
  red: 'text-white/80',
}

const isDarkBg: Record<BackgroundColor, boolean> = {
  green: true,
  blue: true,
  dark: true,
  light: false,
  red: true,
}

type Args = {
  data: PageVisibilityResponse
  user?: User | null
  content:
    | {
        visibleForConfig?: VisibilityConfig | null
        hiddenForConfig?: VisibilityConfig | null
      }
    | undefined
}

type ResolvedLink = {
  href: string
  label: string
  newTab?: boolean | null
  appearance?: ('default' | 'outline') | null
  id?: string | null
}

function getMatchingGroupTitle(
  user: User | null | undefined,
  groups: VisibilityGroup[] | null | undefined,
): string | null {
  if (!user?.groups || !groups) return null

  for (const pageGroup of groups) {
    const pageGroupId = typeof pageGroup.value === 'string' ? pageGroup.value : pageGroup.value.id

    for (const userGroup of user.groups) {
      const userGroupId =
        typeof userGroup.value === 'string'
          ? userGroup.value
          : (userGroup.value as Group | GroupCategory).id

      if (userGroupId === pageGroupId && typeof pageGroup.value !== 'string') {
        return (pageGroup.value as Group | GroupCategory).title
      }
    }
  }

  return null
}

async function resolveLinks(links: LinkItem[]): Promise<ResolvedLink[]> {
  const payload = await getPayload({ config: configPromise })
  const resolved: ResolvedLink[] = []

  for (const item of links) {
    const { type, newTab, reference, url, label, appearance } = item.link

    let href: string | null = null

    if (type === 'subscription') {
      href = '/group-subscription'
    } else if (type === 'custom' && url) {
      href = url
    } else if (type === 'reference' && reference) {
      const val = reference.value
      if (typeof val === 'object' && val !== null && 'slug' in val && val.slug) {
        // already populated
        href =
          reference.relationTo === 'pages' ? `/${val.slug}` : `/${reference.relationTo}/${val.slug}`
      } else if (typeof val === 'string') {
        // unpopulated — fetch the slug
        try {
          const doc = await payload.findByID({
            collection: reference.relationTo as 'pages' | 'posts',
            id: val,
            depth: 0,
          })
          if (doc?.slug) {
            href =
              reference.relationTo === 'pages'
                ? `/${doc.slug}`
                : `/${reference.relationTo}/${doc.slug}`
          }
        } catch {
          // skip if not found
        }
      }
    }

    if (href) {
      resolved.push({ href, label, newTab, appearance, id: item.id })
    }
  }

  return resolved
}

export const RenderPermissionError = async ({ data, content, user }: Args) => {
  const isHiddenFor = data.message?.code === 404
  const config = isHiddenFor ? content?.hiddenForConfig : content?.visibleForConfig

  const errorMessage = config?.errorMessage
  const bg: BackgroundColor = config?.backgroundColor ?? 'green'
  const matchingGroupTitle = getMatchingGroupTitle(user, config?.groups)
  const resolvedLinks = await resolveLinks(config?.links ?? [])

  return (
    <div className={`min-h-[60vh] flex items-center justify-center px-4 py-16 ${bgClasses[bg]}`}>
      <div className="max-w-xl w-full text-center space-y-8">
        {errorMessage && (
          <div
            className={`space-y-2 [&_h1]:text-4xl [&_h1]:font-extrabold [&_h1]:leading-tight [&_p]:text-base [&_p]:leading-relaxed [&_p]:${subtitleClasses[bg]}`}
          >
            <RichText data={errorMessage} enableGutter={false} />
          </div>
        )}

        {matchingGroupTitle && (
          <div className="flex justify-center">
            <div
              className={`inline-flex items-center gap-3 border rounded-xl px-5 py-3 text-left ${badgeBgClasses[bg]}`}
            >
              <div className="flex flex-col">
                <span
                  className={`text-xs uppercase tracking-widest font-medium ${subtitleClasses[bg]}`}
                >
                  O teu grupo
                </span>
                <span className="text-base font-bold">{matchingGroupTitle}</span>
              </div>
            </div>
          </div>
        )}

        {resolvedLinks.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3">
            {resolvedLinks.map((item, i) => {
              const isOutline = item.appearance === 'outline'
              return (
                <CMSLink
                  key={item.id ?? i}
                  type="custom"
                  url={item.href}
                  newTab={item.newTab}
                  label={item.label}
                  appearance={isOutline ? 'outline' : 'default'}
                  className={
                    isOutline && isDarkBg[bg]
                      ? 'min-w-[160px] border-white text-white bg-transparent hover:!bg-white/10 hover:!text-white'
                      : 'min-w-[160px]'
                  }
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
