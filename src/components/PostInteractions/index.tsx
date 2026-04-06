import { getMeUser } from '@/utilities/getMeUser'
import { getPostInteractions } from '@/actions/post-interactions'
import { getTranslations } from 'next-intl/server'
import PostInteractionsClient from './PostInteractionsClient'

type Props = {
  postId: string
  locale: string
}

export default async function PostInteractions({ postId, locale }: Props) {
  const { user } = await getMeUser()
  const t = await getTranslations({ locale, namespace: 'Posts' })

  const { comments, likeCount, hasLiked } = await getPostInteractions({
    postId,
    userId: user?.id,
  })

  const serializedComments = comments.map((c) => ({
    id: c.id as string,
    content: c.content,
    createdAt: c.createdAt as string,
    user: {
      id: typeof c.user === 'object' ? (c.user.id as string) : (c.user as string),
      name: typeof c.user === 'object' ? (c.user as any).name : '',
      surname: typeof c.user === 'object' ? (c.user as any).surname : '',
    },
  }))

  return (
    <PostInteractionsClient
      postId={postId}
      locale={locale}
      initialComments={serializedComments}
      initialLikeCount={likeCount}
      initialHasLiked={hasLiked}
      currentUserId={user?.id}
      currentUserRole={user?.role ?? undefined}
      isLoggedIn={!!user}
      i18n={{
        likes: t('likes'),
        like: t('like'),
        unlike: t('unlike'),
        comments: t('comments'),
        addComment: t('addComment'),
        commentPlaceholder: t('commentPlaceholder'),
        submit: t('submit'),
        loginToInteract: t('loginToInteract'),
        deleteComment: t('deleteComment'),
        noComments: t('noComments'),
        commentRequired: t('commentRequired'),
      }}
    />
  )
}
