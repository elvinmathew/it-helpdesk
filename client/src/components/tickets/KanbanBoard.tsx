import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from '@hello-pangea/dnd'
import { LoaderCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Status, Ticket } from '../../api/types'
import {
  initials,
  priorityTone,
  PRIORITY_LABELS,
  statusDot,
} from '../../lib/ticket-meta'
import { cn } from '@/lib/utils'
import { OverdueBadge } from './TicketBadges'

interface KanbanBoardProps {
  tickets: Ticket[]
  statuses: Status[]
  onMove: (ticketId: string, statusId: string) => void
  pendingTicketId?: string | null
}

export function KanbanBoard({
  tickets,
  statuses,
  onMove,
  pendingTicketId,
}: KanbanBoardProps) {
  const navigate = useNavigate()
  const columns = statuses.filter((status) => status.active)

  const handleDragEnd = (result: DropResult) => {
    const { draggableId, source, destination } = result

    if (!destination || destination.droppableId === source.droppableId) {
      return
    }

    onMove(draggableId, destination.droppableId)
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex items-start gap-4 overflow-x-auto pb-3">
        {columns.map((status) => {
          const items = tickets.filter(
            (ticket) => ticket.statusId === status.id,
          )

          return (
            <section key={status.id} className="w-72 shrink-0">
              <div className="mb-2 flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span
                    className={cn('size-2 rounded-full', statusDot(status.name))}
                    aria-hidden="true"
                  />
                  <h2 className="text-sm font-semibold text-slate-700">
                    {status.name}
                  </h2>
                </div>
                <span className="rounded-full bg-slate-200/80 px-2 py-0.5 text-xs font-medium text-slate-600">
                  {items.length}
                </span>
              </div>

              <Droppable droppableId={status.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      'min-h-40 rounded-lg border border-slate-200 bg-slate-100/70 p-2 transition-colors',
                      snapshot.isDraggingOver &&
                        'border-brand-300 bg-brand-50/70',
                    )}
                  >
                    <div className="space-y-2">
                      {items.map((ticket, index) => (
                        <Draggable
                          key={ticket.id}
                          draggableId={ticket.id}
                          index={index}
                        >
                          {(dragProvided, dragSnapshot) => (
                            <article
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              {...dragProvided.dragHandleProps}
                              onClick={() =>
                                navigate(`/tickets/${ticket.id}`)
                              }
                              className={cn(
                                'cursor-pointer rounded-md border border-slate-200 bg-white p-3 shadow-xs transition-colors hover:border-slate-300',
                                dragSnapshot.isDragging &&
                                  'border-brand-300 shadow-md ring-2 ring-brand-100',
                                pendingTicketId === ticket.id && 'opacity-60',
                              )}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-mono text-[11px] text-slate-500">
                                  {ticket.id}
                                </span>
                                {pendingTicketId === ticket.id ? (
                                  <LoaderCircle
                                    className="size-3.5 animate-spin text-brand-600"
                                    aria-label="Updating status"
                                  />
                                ) : ticket.overdue ? (
                                  <OverdueBadge />
                                ) : null}
                              </div>

                              <h3 className="mt-1.5 line-clamp-2 text-sm font-medium text-slate-900">
                                {ticket.title}
                              </h3>

                              <p className="mt-1 truncate text-xs text-slate-500">
                                {ticket.categoryName}
                              </p>

                              <div className="mt-3 flex items-center justify-between gap-2">
                                {ticket.priority ? (
                                  <span
                                    className={cn(
                                      'rounded-full border px-2 py-0.5 text-[11px] font-medium',
                                      priorityTone(ticket.priority),
                                    )}
                                  >
                                    {PRIORITY_LABELS[ticket.priority]}
                                  </span>
                                ) : (
                                  <span className="text-[11px] text-slate-400">
                                    No priority
                                  </span>
                                )}

                                {ticket.assignedTo ? (
                                  <span
                                    className="flex size-6 items-center justify-center rounded-full bg-slate-100 text-[10px] font-semibold text-slate-600"
                                    title={ticket.assignedToName ?? ''}
                                  >
                                    {initials(ticket.assignedToName ?? '')}
                                  </span>
                                ) : (
                                  <span className="text-[11px] text-slate-400">
                                    Unassigned
                                  </span>
                                )}
                              </div>
                            </article>
                          )}
                        </Draggable>
                      ))}
                    </div>

                    {provided.placeholder}

                    {items.length === 0 && !snapshot.isDraggingOver ? (
                      <p className="px-2 py-6 text-center text-xs text-slate-400">
                        Nothing here
                      </p>
                    ) : null}
                  </div>
                )}
              </Droppable>
            </section>
          )
        })}
      </div>
    </DragDropContext>
  )
}
