import {
  ArrowLeft,
  Clock3,
  LoaderCircle,
  MessageSquare,
  Send,
} from 'lucide-react'
import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { catalogApi } from '../api/catalog'
import { ticketsApi } from '../api/tickets'
import type { Priority } from '../api/types'
import { useAuth } from '../auth/context'
import { AppShell } from '../components/layout/AppShell'
import {
  OverdueBadge,
  PriorityBadge,
  StatusBadge,
} from '../components/tickets/TicketBadges'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { FeedbackAlert } from '../components/ui/FeedbackAlert'
import { errorMessage } from '../lib/errors'
import {
  formatDateTime,
  initials,
  PRIORITY_LABELS,
  relativeTime,
} from '../lib/ticket-meta'
import { useAsyncData } from '../lib/use-async-data'

const NO_PRIORITY = 'none'

interface DetailLocationState {
  notice?: string
}

export function TicketDetailPage() {
  const { ticketId = '' } = useParams()
  const { user } = useAuth()
  const location = useLocation()
  const notice = (location.state as DetailLocationState | null)?.notice

  const [comment, setComment] = useState('')
  const [commentError, setCommentError] = useState<string | null>(null)
  const [submittingComment, setSubmittingComment] = useState(false)
  const [pending, setPending] = useState(false)

  const detail = useAsyncData(() => ticketsApi.get(ticketId), ticketId)
  const catalog = useAsyncData(() => catalogApi.statuses(), 'detail-statuses')

  const canManage = user?.role === 'agent' || user?.role === 'admin'
  const backTo = user?.role === 'employee' ? '/employee' : '/agent'
  const backLabel =
    user?.role === 'employee' ? 'Back to my tickets' : 'Back to queue'

  const ticket = detail.data

  const run = async (action: () => Promise<unknown>, message: string) => {
    setPending(true)

    try {
      await action()
      toast.success(message)
      detail.reload()
    } catch (error) {
      toast.error(errorMessage(error))
    } finally {
      setPending(false)
    }
  }

  const handleStatus = (statusId: string) => {
    const status = catalog.data?.find((item) => item.id === statusId)
    void run(
      () => ticketsApi.setStatus(ticketId, statusId),
      `Moved to ${status?.name ?? 'the new status'}`,
    )
  }

  const handlePriority = (value: string) => {
    const priority = value === NO_PRIORITY ? null : (value as Priority)
    void run(
      () => ticketsApi.setPriority(ticketId, priority),
      priority
        ? `Priority set to ${PRIORITY_LABELS[priority]}`
        : 'Priority cleared',
    )
  }

  const handleAssign = () => {
    if (!user || !ticket) return
    const isMine = ticket.assignedTo === user.id

    void run(
      () => ticketsApi.assign(ticket.id, isMine ? null : user.id),
      isMine ? 'Ticket unassigned' : 'Ticket assigned to you',
    )
  }

  const handleComment = async (event: FormEvent) => {
    event.preventDefault()
    setCommentError(null)

    if (!comment.trim()) {
      setCommentError('Write a comment before sending.')
      return
    }

    setSubmittingComment(true)

    try {
      await ticketsApi.addComment(ticketId, comment)
      setComment('')
      toast.success('Comment added')
      detail.reload()
    } catch (error) {
      setCommentError(errorMessage(error))
    } finally {
      setSubmittingComment(false)
    }
  }

  return (
    <AppShell>
      <div>
        <Link
          to={backTo}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {backLabel}
        </Link>
      </div>

      {detail.loading && !detail.data ? (
        <div className="mt-4 space-y-4">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : detail.error || !ticket ? (
        <div className="mt-6">
          <FeedbackAlert>
            {detail.error ?? 'That ticket could not be found.'}
          </FeedbackAlert>
          <Button variant="outline" asChild className="mt-4">
            <Link to={backTo}>Go back</Link>
          </Button>
        </div>
      ) : (
        <>
          {notice ? (
            <FeedbackAlert tone="success" className="mt-4">
              {notice}
            </FeedbackAlert>
          ) : null}

          <div className="mt-4">
            <p className="font-mono text-xs text-slate-500">{ticket.id}</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
              {ticket.title}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StatusBadge name={ticket.statusName} />
              <PriorityBadge priority={ticket.priority} />
              {ticket.overdue ? <OverdueBadge /> : null}
              <span className="text-xs text-slate-500">
                Updated {relativeTime(ticket.updatedAt)}
              </span>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-6">
              <Card className="gap-0 py-0 shadow-none">
                <CardHeader className="border-b border-slate-200 px-5 py-4">
                  <CardTitle className="text-sm font-semibold text-slate-900">
                    Description
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <p className="text-sm leading-6 whitespace-pre-wrap text-slate-700">
                    {ticket.description}
                  </p>
                </CardContent>
              </Card>

              <Card className="gap-0 py-0 shadow-none">
                <CardHeader className="border-b border-slate-200 px-5 py-4">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <MessageSquare
                      className="size-4 text-slate-500"
                      aria-hidden="true"
                    />
                    Comments
                    <span className="font-normal text-slate-500">
                      ({ticket.comments.length})
                    </span>
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-5">
                  {ticket.comments.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      No comments yet. Add the first update below.
                    </p>
                  ) : (
                    <ul className="space-y-4">
                      {ticket.comments.map((entry) => (
                        <li key={entry.id} className="flex gap-3">
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-semibold text-slate-600">
                            {initials(entry.authorName)}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-baseline gap-x-2">
                              <p className="text-sm font-medium text-slate-900">
                                {entry.authorName}
                              </p>
                              <p className="text-xs text-slate-500">
                                {relativeTime(entry.createdAt)}
                              </p>
                            </div>
                            <p className="mt-1 text-sm leading-6 whitespace-pre-wrap text-slate-700">
                              {entry.message}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}

                  <form
                    onSubmit={handleComment}
                    className="mt-6 border-t border-slate-200 pt-5"
                  >
                    <Label htmlFor="comment" className="sr-only">
                      Add a comment
                    </Label>
                    <Textarea
                      id="comment"
                      value={comment}
                      onChange={(event) => setComment(event.target.value)}
                      placeholder="Add an update or ask a question…"
                      className="min-h-24 resize-y border-slate-300 bg-white shadow-xs focus-visible:border-brand-500 focus-visible:ring-brand-100"
                    />

                    {commentError ? (
                      <p className="mt-1.5 text-xs text-red-600">
                        {commentError}
                      </p>
                    ) : null}

                    <div className="mt-3 flex justify-end">
                      <Button
                        type="submit"
                        size="sm"
                        disabled={submittingComment || !comment.trim()}
                      >
                        {submittingComment ? (
                          <LoaderCircle
                            className="size-4 animate-spin"
                            aria-hidden="true"
                          />
                        ) : (
                          <Send className="size-4" aria-hidden="true" />
                        )}
                        Add comment
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card className="gap-0 py-0 shadow-none">
                <CardHeader className="border-b border-slate-200 px-5 py-4">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <Clock3
                      className="size-4 text-slate-500"
                      aria-hidden="true"
                    />
                    Status history
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  {ticket.history.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      No status changes yet.
                    </p>
                  ) : (
                    <ol className="space-y-4">
                      {ticket.history.map((entry) => (
                        <li key={entry.id} className="relative pl-5">
                          <span
                            className="absolute top-1.5 left-0 size-2 rounded-full bg-brand-500"
                            aria-hidden="true"
                          />
                          <p className="text-sm text-slate-800">
                            {entry.fromStatusName
                              ? `${entry.fromStatusName} → ${entry.toStatusName}`
                              : `Moved to ${entry.toStatusName}`}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {entry.changedByName} ·{' '}
                            {formatDateTime(entry.changedAt)}
                          </p>
                        </li>
                      ))}
                    </ol>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="gap-0 py-0 shadow-none">
                <CardHeader className="border-b border-slate-200 px-5 py-4">
                  <CardTitle className="text-sm font-semibold text-slate-900">
                    Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 p-5 text-sm">
                  <DetailRow label="Status">
                    <StatusBadge name={ticket.statusName} />
                  </DetailRow>
                  <DetailRow label="Priority">
                    <PriorityBadge priority={ticket.priority} />
                  </DetailRow>
                  <DetailRow label="Category">
                    <span className="text-slate-700">
                      {ticket.categoryName}
                    </span>
                  </DetailRow>
                  <DetailRow label="Raised by">
                    <span className="text-slate-700">
                      {ticket.createdByName}
                    </span>
                  </DetailRow>
                  <DetailRow label="Assignee">
                    <span className="text-slate-700">
                      {ticket.assignedTo
                        ? ticket.assignedTo === user?.id
                          ? 'You'
                          : ticket.assignedToName
                        : 'Unassigned'}
                    </span>
                  </DetailRow>
                  <DetailRow label="Created">
                    <span className="text-slate-700">
                      {formatDateTime(ticket.createdAt)}
                    </span>
                  </DetailRow>
                  <DetailRow label="Updated">
                    <span className="text-slate-700">
                      {formatDateTime(ticket.updatedAt)}
                    </span>
                  </DetailRow>
                </CardContent>
              </Card>

              {canManage ? (
                <Card className="gap-0 py-0 shadow-none">
                  <CardHeader className="border-b border-slate-200 px-5 py-4">
                    <CardTitle className="text-sm font-semibold text-slate-900">
                      Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 p-5">
                    <div>
                      <Label className="text-slate-700">Status</Label>
                      <Select
                        value={ticket.statusId}
                        onValueChange={handleStatus}
                        disabled={pending}
                      >
                        <SelectTrigger className="mt-1.5 h-9 w-full border-slate-300 bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(catalog.data ?? [])
                            .filter((status) => status.active)
                            .map((status) => (
                              <SelectItem key={status.id} value={status.id}>
                                {status.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-slate-700">Priority</Label>
                      <Select
                        value={ticket.priority ?? NO_PRIORITY}
                        onValueChange={handlePriority}
                        disabled={pending}
                      >
                        <SelectTrigger className="mt-1.5 h-9 w-full border-slate-300 bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={NO_PRIORITY}>
                            No priority
                          </SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleAssign}
                      disabled={pending}
                    >
                      {pending ? (
                        <LoaderCircle
                          className="size-4 animate-spin"
                          aria-hidden="true"
                        />
                      ) : null}
                      {ticket.assignedTo === user?.id
                        ? 'Unassign me'
                        : 'Assign to me'}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="gap-0 py-0 shadow-none">
                  <CardContent className="p-5">
                    <h2 className="text-sm font-semibold text-slate-900">
                      Need a change?
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Add a comment and an agent will update the status or
                      priority for you.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </>
      )}
    </AppShell>
  )
}

function DetailRow({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="shrink-0 text-slate-500">{label}</span>
      <span className="text-right">{children}</span>
    </div>
  )
}
