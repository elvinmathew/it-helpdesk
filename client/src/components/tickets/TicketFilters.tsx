import { Search, X } from 'lucide-react'
import type { FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type {
  Category,
  Status,
  TicketFilters as Filters,
} from '../../api/types'

interface TicketFiltersProps {
  value: Filters
  onChange: (next: Filters) => void
  statuses: Status[]
  categories?: Category[]
  assigneeOptions?: Array<{ value: string; label: string }>
  showCategory?: boolean
  showAssignee?: boolean
  showSearch?: boolean
}

const ANY = 'all'

export function TicketFilters({
  value,
  onChange,
  statuses,
  categories,
  assigneeOptions,
  showCategory = false,
  showAssignee = false,
  showSearch = false,
}: TicketFiltersProps) {
  const hasFilters = Boolean(
    value.statusId ||
      value.priority ||
      value.categoryId ||
      value.assignee ||
      value.search,
  )

  const clear = () => onChange({})

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const search = String(data.get('search') ?? '').trim()

    onChange({ ...value, search: search || undefined })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {showSearch ? (
          // Remounting on the applied term keeps the uncontrolled input in
          // sync with URL changes without an effect.
          <form
            key={value.search ?? 'all'}
            onSubmit={submitSearch}
            className="relative sm:col-span-2 lg:col-span-1"
          >
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <Input
              name="search"
              defaultValue={value.search ?? ''}
              placeholder="Search by title"
              aria-label="Search tickets by title"
              className="h-9 border-slate-300 bg-white pr-9 pl-9"
            />
            <button
              type="submit"
              aria-label="Apply search"
              className="absolute inset-y-0 right-0 flex cursor-pointer items-center rounded-r-md px-2.5 text-slate-500 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <Search className="size-4" aria-hidden="true" />
            </button>
          </form>
        ) : null}

        <Select
          value={value.statusId ?? ANY}
          onValueChange={(next) =>
            onChange({
              ...value,
              statusId: next === ANY ? undefined : next,
            })
          }
        >
          <SelectTrigger
            className="h-9 w-full border-slate-300 bg-white"
            aria-label="Filter by status"
          >
            <SelectValue placeholder="Any status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Any status</SelectItem>
            {statuses.map((status) => (
              <SelectItem key={status.id} value={status.id}>
                {status.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={value.priority ?? ANY}
          onValueChange={(next) =>
            onChange({
              ...value,
              priority:
                next === ANY
                  ? undefined
                  : (next as NonNullable<Filters['priority']>),
            })
          }
        >
          <SelectTrigger
            className="h-9 w-full border-slate-300 bg-white"
            aria-label="Filter by priority"
          >
            <SelectValue placeholder="Any priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Any priority</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>

        {showCategory && categories ? (
          <Select
            value={value.categoryId ?? ANY}
            onValueChange={(next) =>
              onChange({
                ...value,
                categoryId: next === ANY ? undefined : next,
              })
            }
          >
            <SelectTrigger
              className="h-9 w-full border-slate-300 bg-white"
              aria-label="Filter by category"
            >
              <SelectValue placeholder="Any category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY}>Any category</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}

        {showAssignee && assigneeOptions ? (
          <Select
            value={value.assignee ?? ANY}
            onValueChange={(next) =>
              onChange({
                ...value,
                assignee: next === ANY ? undefined : next,
              })
            }
          >
            <SelectTrigger
              className="h-9 w-full border-slate-300 bg-white"
              aria-label="Filter by assignee"
            >
              <SelectValue placeholder="Any assignee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY}>Any assignee</SelectItem>
              {assigneeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}
      </div>

      {hasFilters ? (
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clear}
            className="h-8 px-2 text-slate-600"
          >
            <X className="size-3.5" aria-hidden="true" />
            Clear filters
          </Button>
        </div>
      ) : null}
    </div>
  )
}
