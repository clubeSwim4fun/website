'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { getMeUser } from '@/utilities/getMeUser'
import { getTranslations } from 'next-intl/server'
import { revalidatePath } from 'next/cache'

export async function addComment({
  postId,
  content,
  locale,
}: {
  postId: string
  content: string
  locale: string
}) {
  const t = await getTranslations({ locale, namespace: 'Posts' })
  const { user } = await getMeUser()

  if (!user) return { success: false, message: t('commentLoginRequired') }
  if (!content?.trim()) return { success: false, message: t('commentRequired') }

  const payload = await getPayload({ config })

  const comment = await payload.create({
    collection: 'post-comments',
    data: { post: postId, user: user.id, content: content.trim() },
  })

  revalidatePath(`/${locale}/posts`)

  return { success: true, message: t('commentAdded'), comment }
}

export async function deleteComment({ commentId, locale }: { commentId: string; locale: string }) {
  const t = await getTranslations({ locale, namespace: 'Posts' })
  const { user } = await getMeUser()

  if (!user) return { success: false, message: t('commentLoginRequired') }

  const payload = await getPayload({ config })

  const existing = await payload.findByID({ collection: 'post-comments', id: commentId })
  const ownerId = typeof existing.user === 'object' ? existing.user.id : existing.user

  if (ownerId !== user.id && user.role !== 'admin') {
    return { success: false, message: t('notAuthorized') }
  }

  await payload.delete({ collection: 'post-comments', id: commentId })

  revalidatePath(`/${locale}/posts`)

  return { success: true, message: t('commentDeleted') }
}

export async function toggleLike({ postId, locale }: { postId: string; locale: string }) {
  const t = await getTranslations({ locale, namespace: 'Posts' })
  const { user } = await getMeUser()

  if (!user) return { success: false, message: t('commentLoginRequired'), liked: false }

  const payload = await getPayload({ config })

  const existing = await payload.find({
    collection: 'post-likes',
    where: { and: [{ post: { equals: postId } }, { user: { equals: user.id } }] },
    limit: 1,
  })

  if (existing.docs.length > 0 && existing.docs[0]?.id) {
    await payload.delete({ collection: 'post-likes', id: existing.docs[0].id })
    revalidatePath(`/${locale}/posts`)
    return { success: true, liked: false }
  }

  await payload.create({ collection: 'post-likes', data: { post: postId, user: user.id } })
  revalidatePath(`/${locale}/posts`)
  return { success: true, liked: true }
}

export async function getPostInteractions({ postId, userId }: { postId: string; userId?: string }) {
  const payload = await getPayload({ config })

  const [commentsResult, likesResult, userLike] = await Promise.all([
    payload.find({
      collection: 'post-comments',
      where: { post: { equals: postId } },
      sort: '-createdAt',
      depth: 1,
      limit: 100,
    }),
    payload.find({
      collection: 'post-likes',
      where: { post: { equals: postId } },
      limit: 0,
    }),
    userId
      ? payload.find({
          collection: 'post-likes',
          where: { and: [{ post: { equals: postId } }, { user: { equals: userId } }] },
          limit: 1,
        })
      : Promise.resolve({ docs: [] }),
  ])

  return {
    comments: commentsResult.docs,
    likeCount: likesResult.totalDocs,
    hasLiked: userLike.docs.length > 0,
  }
}
