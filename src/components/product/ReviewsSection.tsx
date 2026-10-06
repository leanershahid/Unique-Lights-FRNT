import { BadgeCheck, MessageSquareText, Star, Trash2 } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ApiError } from '@/api/axios'
import { collapse, staggerContainer, staggerItem } from '@/animations/variants'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Field'
import { Pagination } from '@/components/ui/Pagination'
import { Rating, RatingInput } from '@/components/ui/Rating'
import { Skeleton } from '@/components/ui/Skeleton'
import { useCreateReview, useDeleteReview, useReviews, useReviewSummary } from '@/features/products/hooks'
import { selectIsAuthenticated, useAppSelector } from '@/store/hooks'
import { formatDate } from '@/utils/format'

function ReviewForm({ productId, onDone }: { productId: string; onDone: () => void }) {
  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const create = useCreateReview()
  const err = create.error instanceof ApiError ? create.error : null

  return (
    <form
      className="grid gap-4 rounded-[var(--radius-card)] border border-line bg-surface p-5"
      onSubmit={(e) => {
        e.preventDefault()
        if (!rating) return
        create.mutate({ productId, rating, title: title.trim() || null, comment: comment.trim() || null }, { onSuccess: onDone })
      }}
    >
      <div>
        <p className="mb-1 text-[0.85rem] font-medium text-muted">Your rating</p>
        <RatingInput value={rating} onChange={setRating} />
        {!rating && create.isIdle && <p className="mt-1 text-[0.8rem] text-subtle">Choose 1 to 5 stars.</p>}
      </div>
      <Input label="Title" optional maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Warm, even light over our dining table" error={err?.fieldError('title')} />
      <Textarea label="Review" optional maxLength={2000} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="How does it look when lit? Was it easy to install?" error={err?.fieldError('comment')} />
      {err && !err.errors && <p className="text-[0.85rem] text-danger">{err.message}</p>}
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" variant="accent" loading={create.isPending} disabled={!rating}>
          Post review
        </Button>
      </div>
    </form>
  )
}

export function ReviewsSection({ productId }: { productId: string }) {
  const [page, setPage] = useState(1)
  const [writing, setWriting] = useState(false)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const location = useLocation()
  const summary = useReviewSummary(productId)
  const reviews = useReviews(productId, { page, pageSize: 5 })
  const remove = useDeleteReview(productId)
  const hasMine = reviews.data?.items.some((r) => r.isMine) ?? false

  return (
    <section id="reviews" className="scroll-mt-24" aria-labelledby="reviews-title">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div>
          <h2 id="reviews-title" className="text-[clamp(1.8rem,3vw,2.4rem)]">
            Reviews
          </h2>
          {summary.data ? (
            <div className="mt-5">
              <div className="flex items-end gap-3">
                <span className="font-display text-[3.4rem] leading-none tabular">{summary.data.averageRating.toFixed(1)}</span>
                <div className="pb-1.5">
                  <Rating value={summary.data.averageRating} size={16} />
                  <p className="text-[0.82rem] text-subtle">
                    {summary.data.reviewCount} review{summary.data.reviewCount === 1 ? '' : 's'}
                  </p>
                </div>
              </div>
              <ul className="mt-5 grid gap-2">
                {(['5', '4', '3', '2', '1'] as const).map((star) => {
                  const count = summary.data.distribution[star] ?? 0
                  const pct = summary.data.reviewCount ? (count / summary.data.reviewCount) * 100 : 0
                  return (
                    <li key={star} className="grid grid-cols-[2.2rem_minmax(0,1fr)_2rem] items-center gap-3 text-[0.82rem] text-muted">
                      <span className="flex items-center gap-1">
                        {star} <Star size={11} fill="currentColor" strokeWidth={0} />
                      </span>
                      <span className="h-1.5 overflow-hidden rounded-full bg-line">
                        <motion.span className="block h-full rounded-full bg-brass" initial={{ width: 0 }} whileInView={{ width: `${pct}%` }} viewport={{ once: true }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} />
                      </span>
                      <span className="text-right font-mono tabular">{count}</span>
                    </li>
                  )
                })}
              </ul>
            </div>
          ) : (
            <Skeleton className="mt-5 h-40" />
          )}
          <div className="mt-6">
            {isAuthenticated ? (
              !hasMine && (
                <Button variant="outline" onClick={() => setWriting((w) => !w)}>
                  <MessageSquareText size={16} /> Write a review
                </Button>
              )
            ) : (
              <Link to="/login" state={{ from: `${location.pathname}#reviews` }} className="text-[0.9rem] font-semibold text-brass hover:underline">
                Sign in to write a review
              </Link>
            )}
          </div>
        </div>

        <div className="min-w-0">
          <AnimatePresence initial={false}>
            {writing && (
              <motion.div variants={collapse} initial="hidden" animate="visible" exit="exit" className="mb-6 overflow-hidden">
                <ReviewForm productId={productId} onDone={() => setWriting(false)} />
              </motion.div>
            )}
          </AnimatePresence>

          {reviews.isPending ? (
            <div className="grid gap-6">
              {[0, 1].map((i) => (
                <div key={i} className="grid gap-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ))}
            </div>
          ) : reviews.data && reviews.data.items.length > 0 ? (
            <>
              <motion.ul key={page} variants={staggerContainer(0.05)} initial="hidden" animate="visible" className="divide-y divide-line">
                {reviews.data.items.map((r) => (
                  <motion.li key={r.id} variants={staggerItem} className="py-6 first:pt-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Rating value={r.rating} />
                      <span className="text-[0.8rem] text-subtle">{formatDate(r.createdAt)}</span>
                    </div>
                    {r.title && <p className="mt-2 font-semibold text-ink">{r.title}</p>}
                    {r.comment && <p className="mt-1.5 whitespace-pre-line text-muted">{r.comment}</p>}
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-[0.82rem]">
                      <span className="text-ink">{r.authorName}</span>
                      {r.isVerifiedPurchase && (
                        <span className="inline-flex items-center gap-1 text-success">
                          <BadgeCheck size={14} /> Verified purchase
                        </span>
                      )}
                      {r.isMine && (
                        <button type="button" onClick={() => remove.mutate(r.id)} className="ml-auto inline-flex items-center gap-1 text-subtle hover:text-danger">
                          <Trash2 size={13} /> Delete
                        </button>
                      )}
                    </div>
                  </motion.li>
                ))}
              </motion.ul>
              <Pagination className="mt-6" page={page} totalPages={reviews.data.totalPages} onChange={setPage} />
            </>
          ) : (
            <p className="rounded-[var(--radius-card)] border border-dashed border-line p-8 text-center text-muted">No reviews yet. Bought this light? Tell other shoppers how it looks in your home.</p>
          )}
        </div>
      </div>
    </section>
  )
}
