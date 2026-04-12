/**
 * RichText renderer that handles TextStateFeature colour state.
 * Used in Hero and Content blocks.
 * Reads node["$"]?.color and applies the matching inline style.
 */
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import {
  DefaultNodeTypes,
  SerializedBlockNode,
  SerializedLinkNode,
  SerializedTextNode,
} from '@payloadcms/richtext-lexical'
import { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import {
  JSXConvertersFunction,
  LinkJSXConverter,
  RichText as RichTextWithoutBlocks,
} from '@payloadcms/richtext-lexical/react'

import type {
  BannerBlock as BannerBlockProps,
  CallToActionBlock as CTABlockProps,
  MediaBlock as MediaBlockProps,
} from '@/payload-types'
import { BannerBlock } from '@/blocks/Banner/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { cn } from '@/utilities/ui'

export const COLOR_STYLES: Record<string, React.CSSProperties> = {
  'brand-blue': { color: '#3bb8d8' },
  'deep-blue': { color: '#0a4a6e' },
  white: { color: '#ffffff' },
  'white-muted': { color: 'rgba(255,255,255,0.78)' },
}

type NodeTypes =
  | DefaultNodeTypes
  | SerializedBlockNode<CTABlockProps | MediaBlockProps | BannerBlockProps>

const internalDocToHref = ({ linkNode }: { linkNode: SerializedLinkNode }) => {
  const { value, relationTo } = linkNode.fields.doc!
  if (typeof value !== 'object') throw new Error('Expected value to be an object')
  const slug = value.slug
  return relationTo === 'posts' ? `/posts/${slug}` : `/${slug}`
}

const jsxConverters: JSXConvertersFunction<NodeTypes> = ({ defaultConverters }) => ({
  ...defaultConverters,
  ...LinkJSXConverter({ internalDocToHref }),
  text: ({ node }) => {
    const stateKey = (node as any)['$']?.color as string | undefined
    const style = stateKey ? COLOR_STYLES[stateKey] : undefined
    const textNode = node as SerializedTextNode
    let text: React.ReactNode = textNode.text
    if (textNode.format & 1) text = <strong>{text}</strong>
    if (textNode.format & 2) text = <em>{text}</em>
    if (textNode.format & 8) text = <u>{text}</u>
    if (textNode.format & 4) text = <s>{text}</s>
    if (textNode.format & 32) text = <sub>{text}</sub>
    if (textNode.format & 64) text = <sup>{text}</sup>
    if (style) return <span style={style}>{text}</span>
    return <>{text}</>
  },
  quote: ({ node, nodesToJSX }) => (
    <blockquote className="border-l-[3px] border-light pl-5 my-6 italic text-lg leading-relaxed">
      {nodesToJSX({ nodes: node.children })}
    </blockquote>
  ),
  blocks: {
    banner: ({ node }) => <BannerBlock className="col-start-2 mb-4" {...node.fields} />,
    mediaBlock: ({ node }) => (
      <MediaBlock
        className="col-start-1 col-span-3"
        imgClassName="m-0"
        {...node.fields}
        captionClassName="mx-auto max-w-[48rem]"
        enableGutter={false}
        disableInnerContainer={true}
      />
    ),
    cta: ({ node }) => <CallToActionBlock {...node.fields} />,
  },
})

type Props = {
  data: SerializedEditorState
  enableGutter?: boolean
  enableProse?: boolean
} & React.HTMLAttributes<HTMLDivElement>

export default function RichTextColor(props: Props) {
  const { className, enableProse = false, enableGutter = false, ...rest } = props
  return (
    <RichTextWithoutBlocks
      converters={jsxConverters}
      className={cn(
        {
          container: enableGutter,
          'max-w-none': !enableGutter,
          'mx-auto prose md:prose-md dark:prose-invert': enableProse,
        },
        className,
      )}
      {...rest}
    />
  )
}
