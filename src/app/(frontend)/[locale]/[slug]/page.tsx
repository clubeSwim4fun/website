import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload, TypedLocale } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { getMeUser } from '@/utilities/getMeUser'
import { checkPageVisibility, PageVisibilityResponse } from '@/utilities/pageValidations'
import { redirect } from 'next/navigation'
import { RenderPermissionError } from '@/blocks/RenderPermissionError'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const pages = await payload.find({
    collection: 'pages',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  const params = pages.docs
    ?.filter((doc) => {
      return doc.slug !== 'home'
    })
    .map(({ slug }) => {
      return { slug }
    })

  return params
}

type Args = {
  params: Promise<{
    slug?: string
    locale: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = 'home', locale } = await paramsPromise
  const url = '/' + slug
  const userObject = (await getMeUser()).user

  const page = await queryPageBySlug({
    slug,
    locale,
  })

  if (!page) {
    return <PayloadRedirects url={url} />
  }

  const canSeePage: PageVisibilityResponse = await checkPageVisibility({ user: userObject, page })

  if (!canSeePage.success) {
    if (canSeePage.message?.code === 401) {
      redirect(`sign-in?callbackUrl=/${page.slug}`)
    }
  }

  const { hero, layout } = page

  return (
    <article className="pt-[104px] pb-24">
      <PageClient />
      {canSeePage.success ? (
        <>
          <PayloadRedirects disableNotFound url={url} />
          {draft && <LivePreviewListener />}
          <RenderHero {...hero} />
          <RenderBlocks blocks={layout} />
        </>
      ) : (
        <RenderPermissionError data={canSeePage} content={page.visibility} />
      )}
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = 'home', locale } = await paramsPromise
  const page = await queryPageBySlug({
    slug,
    locale,
  })

  return generateMeta({ doc: page, locale })
}

const queryPageBySlug = cache(async ({ slug, locale }: { slug: string; locale: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'pages',
    draft,
    limit: 1,
    locale: locale as TypedLocale,
    pagination: false,
    overrideAccess: draft,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})
