import { ChevronRight, MoreHorizontal, UserCheck, UserX } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Priority, Status, Ticket } from '../../api/types'
import {
  PRIORITIES,
  PRIORITY_LABELS,
  initials,
  relativeTime,
} from '../../lib/ticket-meta'
import { OverdueBadge, PriorityBadge, StatusBadge } from './TicketBadges'

interface TicketTableProps {
  tickets: Ticket[]
  perspective: 'employee' | 'agent'
  statuses?: Status[]
  currentUserId?: string
  onStatusChange?: (ticket: Ticket, statusId: string) => void
  onPriorityChange?: (ticket: Ticket, priority: Priority | null) => void
  onAssign?: (ticket: Ticket, assigneeId: string | null) => void
}

export function TicketTable({
  tickets,
  perspective,
  statuses = [],
  currentUserId,
  onStatusChange,
  onPriorityChange,
  onAssign,
}: TicketTableProps) {
  const navigate = useNavigate()
  const canManage = perspective === 'agent'

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 hover:bg-slate-50">
            <TableHead className="min-w-64">Ticket</TableHead>
            <TableHead className="hidden md:table-cell">Category</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            {canManage ? (
              <TableHead className="hidden lg:table-cell">Assignee</TableHead>
            ) : null}
            <TableHead className="hidden sm:table-cell">Updated</TableHead>
            {canManage ? (
              <TableHead className="w-12 text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            ) : null}
          </TableRow>
        </TableHeader>

        <TableBody>
          {tickets.map((ticket) => {
            const isMine = currentUserId === ticket.assignedTo

            return (
              <TableRow
                key={ticket.id}
                className="cursor-pointer"
                onClick={() => navigate(`/tickets/${ticket.id}`)}
              >
                <TableCell className="py-3">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <Link
                      to={`/tickets/${ticket.id}`}
                      className="font-medium text-slate-900 underline-offset-2 hover:text-brand-700 hover:underline"
                      onClick={(event) => event.stopPropagation()}
                    >
                      {ticket.title}
                    </Link>
                    {ticket.overdue ? <OverdueBadge /> : null}
                  </div>
                  <p className="mt-0.5 font-mono text-xs text-slate-500">
                    {ticket.id}
                  </p>
                </TableCell>

                <TableCell className="hidden text-slate-600 md:table-cell">
                  {ticket.categoryName}
                </TableCell>

                <TableCell>
                  <PriorityBadge priority={ticket.priority} />
                </TableCell>

                <TableCell>
                  <StatusBadge name={ticket.statusName} />
                </TableCell>

                {canManage ? (
                  <TableCell className="hidden lg:table-cell">
                    {ticket.assignedTo ? (
                      <span className="flex items-center gap-2">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-semibold text-slate-600">
                          {initials(ticket.assignedToName ?? '')}
                        </span>
                        <span className="truncate text-slate-600">
                          {isMine ? 'You' : ticket.assignedToName}
                        </span>
                      </span>
                    ) : (
                      <span className="text-slate-400">Unassigned</span>
                    )}
                  </TableCell>
                ) : null}

                <TableCell className="hidden text-slate-500 sm:table-cell">
                  {relativeTime(ticket.updatedAt)}
                </TableCell>

                {canManage ? (
                  <TableCell
                    className="text-right"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Actions for ${ticket.title}`}
                        >
                          <MoreHorizontal
                            className="size-4"
                            aria-hidden="true"
                          />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end" className="w-52">
                        <DropdownMenuItem
                          onSelect={() => navigate(`/tickets/${ticket.id}`)}
                        >
                          <ChevronRight aria-hidden="true" />
                          Open ticket
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          onSelect={() =>
                            onAssign?.(
                              ticket,
                              isMine ? null : (currentUserId ?? null),
                            )
                          }
                        >
                          {isMine ? (
                            <UserX aria-hidden="true" />
                          ) : (
                            <UserCheck aria-hidden="true" />
                          )}
                          {isMine ? 'Unassign me' : 'Assign to me'}
                        </DropdownMenuItem>

                        {statuses.length > 0 ? (
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                              Set status
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                              {statuses
                                .filter((status) => status.active)
                                .map((status) => (
                                  <DropdownMenuItem
                                    key={status.id}
                                    disabled={status.id === ticket.statusId}
                                    onSelect={() =>
                                      onStatusChange?.(ticket, status.id)
                                    }
                                  >
                                    {status.name}
                                  </DropdownMenuItem>
                                ))}
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>
                        ) : null}

                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>
                            Set priority
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            {PRIORITIES.map((priority) => (
                              <DropdownMenuItem
                                key={priority}
                                disabled={ticket.priority === priority}
                                onSelect={() =>
                                  onPriorityChange?.(ticket, priority)
                                }
                              >
                                {PRIORITY_LABELS[priority]}
                              </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              disabled={ticket.priority === null}
                              onSelect={() => onPriorityChange?.(ticket, null)}
                            >
                              No priority
                            </DropdownMenuItem>
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>

                        <DropdownMenuLabel className="text-xs font-normal text-slate-500">
                          Created by {ticket.createdByName}
                        </DropdownMenuLabel>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                ) : null}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
