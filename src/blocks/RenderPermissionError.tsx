import { Group, GroupCategory, Page, Post } from '@/payload-types'
import { PageVisibilityResponse } from '@/utilities/pageValidations'
import RichText from '@/components/RichText'
import { CMSLink } from '@/components/Link'
import { Card, CardContent, CardTitle } from '@/components/ui/card'

type Args = {
  data: PageVisibilityResponse
  content:
    | {
        visibleFor?:
          | (
              | {
                  relationTo: 'groups'
                  value: string | Group
                }
              | {
                  relationTo: 'group-categories'
                  value: string | GroupCategory
                }
            )[]
          | null
        errorMessage?: {
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
        } | null
        enableLink?: boolean | null
        link?: {
          type?: ('reference' | 'custom') | null
          newTab?: boolean | null
          reference?:
            | ({
                relationTo: 'pages'
                value: string | Page
              } | null)
            | ({
                relationTo: 'posts'
                value: string | Post
              } | null)
          url?: string | null
          label: string
          hasChildren?: boolean | null
          childrenPages?:
            | {
                reference: {
                  relationTo: 'pages'
                  value: string | Page
                }
                label: string
                id?: string | null
              }[]
            | null
          appearance?: ('default' | 'outline') | null
        }
      }
    | undefined
}

export const RenderPermissionError: React.FC<Args> = (props) => {
  const { data, content } = props

  const errorMessage = content?.errorMessage
  const enableLink = content?.enableLink
  const link = content?.link

  return (
    <div className="container mx-auto max-w-7xl">
      <Card className="max-w-xl mx-auto pt-6">
        <CardContent>
          {errorMessage && <RichText data={errorMessage} enableGutter={false} />}
          {enableLink && <CMSLink {...link} />}
        </CardContent>
      </Card>
    </div>
  )
}
