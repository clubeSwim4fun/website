import type { Metadata } from 'next/types'
import configPromise from '@payload-config'
import { getPayload, TypedLocale } from 'payload'
import React from 'react'
import PageClient from './page.client'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { GeneralConfig, Post } from '@/payload-types'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { BlogPageContent } from '../../BlogPageContent'

export const revalidate = 600

type Args = {
  params: Promise<{
    pageNumber: string
    locale: TypedLocale
  }>
  searchParams: Promise<{ category?: string }>
}

export default async function Page({ params: paramsPromise, searchParams }: Args) {
  const { pageNumber, locale } = await paramsPromise
  const { category } = await searchParams
  const payload = await getPayload({ config: configPromise })

  const sanitizedPageNumber = Number(pageNumber)
  if (!Number.isInteger(sanitizedPageNumber)) notFound()

  // Fetch posts with proper depth for relationships
  const posts = await payload.find({
    collection: 'posts',
    depth: 2,
    limit: 10,
    page: sanitizedPageNumber,
    locale,
    overrideAccess: false,
    where: category
      ? {
          categories: {
            in: [category],
          },
        }
      : undefined,
    sort: '-publishedAt',
  })

  // Fetch categories for filter
  const categories = await payload.find({
    collection: 'categories',
    depth: 0,
    limit: 100,
    locale,
    overrideAccess: false,
    sort: 'title',
  })

  // Get recent posts for sidebar
  const recentPosts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 5,
    locale,
    overrideAccess: false,
    sort: '-publishedAt',
    select: {
      title: true,
      slug: true,
      meta: true,
      publishedAt: true,
    },
  })

  // For paginated pages, don't show featured post
  const featuredPost = null

  return (
    <>
      <PageClient />
      <BlogPageContent
        posts={posts.docs}
        featuredPost={featuredPost}
        categories={categories.docs}
        recentPosts={recentPosts.docs as Post[]}
        currentPage={posts.page || sanitizedPageNumber}
        totalPages={posts.totalPages || 1}
        totalPosts={posts.totalDocs || 0}
        activeCategory={category || null}
      />
    </>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { pageNumber, locale } = await paramsPromise
  const t = await getTranslations({ locale, namespace: 'Metadata' })
  const globalConfig = (await getCachedGlobal(
    'generalConfigs',
    1,
    locale as TypedLocale,
  )()) as GeneralConfig
  const clubTitle = globalConfig?.clubName || t('Club')

  return {
    title: `${clubTitle} - ${t('Post')} ${pageNumber || ''}`,
  }
}

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const { totalDocs } = await payload.count({
    collection: 'posts',
    overrideAccess: false,
  })

  const totalPages = Math.ceil(totalDocs / 10)

  const pages: { pageNumber: string }[] = []

  for (let i = 1; i <= totalPages; i++) {
    pages.push({ pageNumber: String(i) })
  }

  return pages
}
