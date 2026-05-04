'use client'
import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from '@/i18n/routing'
import {
  BlogHero,
  FeaturedPost,
  PostGrid,
  BlogSidebar,
  BlogPagination,
  MobileBlog,
} from '@/components/Blog'
import type { Post, Category } from '@/payload-types'

interface BlogPageContentProps {
  posts: Post[]
  featuredPost: Post | null
  categories: Category[]
  recentPosts: Post[]
  currentPage: number
  totalPages: number
  totalPosts: number
  activeCategory: string | null
}

export const BlogPageContent: React.FC<BlogPageContentProps> = ({
  posts,
  featuredPost,
  categories,
  recentPosts,
  currentPage,
  totalPages,
  totalPosts,
  activeCategory,
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(activeCategory)

  useEffect(() => {
    setSelectedCategory(activeCategory)
  }, [activeCategory])

  const handleCategoryChange = (categoryId: string | null) => {
    setSelectedCategory(categoryId)

    const params = new URLSearchParams(searchParams.toString())
    if (categoryId) {
      params.set('category', categoryId)
    } else {
      params.delete('category')
    }

    const queryString = params.toString()
    const newUrl = queryString ? `/posts?${queryString}` : '/posts'
    router.push(newUrl)
  }

  const handleSearch = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`)
  }

  // Filter posts excluding featured post for grid
  const gridPosts = featuredPost ? posts.filter((post) => post.id !== featuredPost.id) : posts

  return (
    <>
      {/* Mobile Layout */}
      <MobileBlog
        featuredPost={featuredPost ?? undefined}
        posts={gridPosts}
        categories={categories}
        currentPage={currentPage}
        totalPages={totalPages}
        totalPosts={totalPosts}
        activeCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
      />

      {/* Desktop Layout */}
      <div className="hidden md:block">
        {/* Hero Section */}
        <BlogHero onSearch={handleSearch} />

        {/* Main Content */}
        <div className="max-w-[1200px] mx-auto px-20 py-14 grid grid-cols-[1fr_320px] gap-12 items-start">
          <div>
            {/* Featured Post */}
            {featuredPost && <FeaturedPost post={featuredPost} />}

            {/* Posts Grid */}
            <PostGrid posts={gridPosts} />

            {/* Pagination */}
            {totalPages > 1 && <BlogPagination currentPage={currentPage} totalPages={totalPages} />}
          </div>

          {/* Sidebar */}
          <BlogSidebar recentPosts={recentPosts} categories={categories} />
        </div>
      </div>
    </>
  )
}
