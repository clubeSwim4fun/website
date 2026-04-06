'use client'

import { useState, useTransition } from 'react'
import { Heart, MessageCircle, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/utilities/ui'
import { addComment, deleteComment, toggleLike } from '@/actions/post-interactions'
import { useToast } from '@/hooks/use-toast'

type Comment = {
  id: string
  content: string
  createdAt: string
  user: { id: string; name: string; surname: string }
}

type Props = {
  postId: string
  locale: string
  initialComments: Comment[]
  initialLikeCount: number
  initialHasLiked: boolean
  currentUserId?: string
  currentUserRole?: string
  isLoggedIn: boolean
  i18n: Record<string, string>
}

export default function PostInteractionsClient({
  postId,
  locale,
  initialComments,
  initialLikeCount,
  initialHasLiked,
  currentUserId,
  currentUserRole,
  isLoggedIn,
  i18n,
}: Props) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [hasLiked, setHasLiked] = useState(initialHasLiked)
  const [commentText, setCommentText] = useState('')

  function handleLike() {
    if (!isLoggedIn) {
      toast({ description: i18n.loginToInteract, variant: 'destructive' })
      return
    }
    // Optimistic update
    setHasLiked((prev) => !prev)
    setLikeCount((prev) => (hasLiked ? prev - 1 : prev + 1))

    startTransition(async () => {
      const result = await toggleLike({ postId, locale })
      if (!result.success) {
        // Revert
        setHasLiked((prev) => !prev)
        setLikeCount((prev) => (result.liked ? prev - 1 : prev + 1))
      }
    })
  }

  function handleAddComment() {
    if (!isLoggedIn) {
      toast({ description: i18n.loginToInteract, variant: 'destructive' })
      return
    }
    if (!commentText.trim()) {
      toast({ description: i18n.commentRequired, variant: 'destructive' })
      return
    }

    startTransition(async () => {
      const result = await addComment({ postId, content: commentText, locale })
      if (result.success && result.comment) {
        const c = result.comment as any
        setComments((prev) => [
          {
            id: c.id,
            content: c.content,
            createdAt: c.createdAt,
            user: {
              id: typeof c.user === 'object' ? c.user.id : c.user,
              name: typeof c.user === 'object' ? c.user.name : '',
              surname: typeof c.user === 'object' ? c.user.surname : '',
            },
          },
          ...prev,
        ])
        setCommentText('')
      } else {
        toast({ description: result.message, variant: 'destructive' })
      }
    })
  }

  function handleDeleteComment(commentId: string) {
    startTransition(async () => {
      const result = await deleteComment({ commentId, locale })
      if (result.success) {
        setComments((prev) => prev.filter((c) => c.id !== commentId))
      } else {
        toast({ description: result.message, variant: 'destructive' })
      }
    })
  }

  const canDelete = (comment: Comment) =>
    currentUserId === comment.user.id || currentUserRole === 'admin'

  return (
    <div className="max-w-[48rem] mx-auto mt-12 space-y-8">
      {/* Like button */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          disabled={isPending}
          className={cn('gap-2', hasLiked && 'text-red-500')}
          aria-label={hasLiked ? i18n.unlike : i18n.like}
        >
          <Heart className={cn('w-5 h-5', hasLiked && 'fill-current')} />
          <span>{likeCount}</span>
        </Button>
        <span className="text-sm text-muted-foreground">{i18n.likes}</span>
      </div>

      {/* Comments section */}
      <div className="space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          {i18n.comments} ({comments.length})
        </h3>

        {/* Add comment */}
        {isLoggedIn ? (
          <div className="space-y-2">
            <Textarea
              placeholder={i18n.commentPlaceholder}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={3}
              maxLength={1000}
            />
            <Button
              size="sm"
              onClick={handleAddComment}
              disabled={isPending || !commentText.trim()}
            >
              {i18n.addComment}
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{i18n.loginToInteract}</p>
        )}

        {/* Comment list */}
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground">{i18n.noComments}</p>
        ) : (
          <ul className="space-y-4">
            {comments.map((comment) => (
              <li key={comment.id} className="border rounded-lg p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">
                    {comment.user.name} {comment.user.surname}
                  </span>
                  <div className="flex items-center gap-2">
                    <time className="text-xs text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleString(locale, {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </time>
                    {canDelete(comment) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteComment(comment.id)}
                        disabled={isPending}
                        aria-label={i18n.deleteComment}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
