import type { Metadata } from 'next/types'
import configPromise from '@payload-config'
import { getPayload, TypedLocale } from 'payload'
import React from 'react'
import PageClient from './page.client'
import { getTranslations } from 'next-intl/server'
import type { Post, GeneralConfig } from '@/payload-types'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { BlogPageContent } from './BlogPageContent'

export const dynamic = 'force-static'
export const revalidate = 600

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: TypedLocale }>
  searchParams: Promise<{ category?: string }>
}) {
  const { locale } = await params
  const { category } = await searchParams
  const payload = await getPayload({ config: configPromise })

  // Fetch posts with proper depth for relationships
  const posts = await payload.find({
    collection: 'posts',
    depth: 2,
    limit: 10,
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

  // Get recent posts for sidebar (excluding featured)
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

  // Get featured post (most recent)
  const featuredPost = posts.docs[0] || null

  return (
    <>
      <PageClient />
      <BlogPageContent
        posts={posts.docs}
        featuredPost={featuredPost}
        categories={categories.docs}
        recentPosts={recentPosts.docs as Post[]}
        currentPage={posts.page || 1}
        totalPages={posts.totalPages || 1}
        totalPosts={posts.totalDocs || 0}
        activeCategory={category || null}
      />
    </>
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Metadata' })
  const globalConfig = (await getCachedGlobal(
    'generalConfigs',
    1,
    locale as TypedLocale,
  )()) as GeneralConfig

  const clubTitle = globalConfig?.clubName || t('Club')
  const blog = globalConfig?.settings?.fixedPages?.blog

  const blogTitle = blog?.title || t('Blog')

  return {
    title: `${clubTitle} - ${blogTitle}`,
  }
}
