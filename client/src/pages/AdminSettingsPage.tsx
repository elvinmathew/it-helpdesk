import {
  ArrowLeft,
  LoaderCircle,
  Plus,
  Timer,
  UserCog,
} from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { adminApi } from '../api/admin'
import { catalogApi } from '../api/catalog'
import type { Category, Role, Status, User } from '../api/types'
import { useAuth } from '../auth/context'
import { AppShell } from '../components/layout/AppShell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FeedbackAlert } from '../components/ui/FeedbackAlert'
import { errorMessage } from '../lib/errors'
import { useResource } from '../lib/use-resource'

const ROLE_LABELS: Record<Role, string> = {
  employee: 'Employee',
  agent: 'Agent',
  admin: 'Admin',
}

type Tab = 'users' | 'statuses' | 'categories' | 'automation'

export function AdminSettingsPage() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = (searchParams.get('tab') as Tab | null) ?? 'users'
  const [busy, setBusy] = useState<string | null>(null)
  const [newStatus, setNewStatus] = useState('')
  const [newCategory, setNewCategory] = useState('')

  const resource = useResource(
    () =>
      Promise.all([
        adminApi.users(),
        catalogApi.statuses(),
        catalogApi.categories(),
        adminApi.settings(),
      ]).then(([users, statuses, categories, settings]) => ({
        users,
        statuses,
        categories,
        settings,
      })),
    'admin-settings',
  )

  const data = resource.data

  const run = async (
    key: string,
    action: () => Promise<unknown>,
    message: string,
  ) => {
    setBusy(key)

    try {
      await action()
      toast.success(message)
      resource.reload()
    } catch (error) {
      toast.error(errorMessage(error))
    } finally {
      setBusy(null)
    }
  }

  const addStatus = (event: FormEvent) => {
    event.preventDefault()
    const name = newStatus.trim()
    if (!name) return

    void run('new-status', () => adminApi.createStatus(name), 'Status added')
    setNewStatus('')
  }

  const addCategory = (event: FormEvent) => {
    event.preventDefault()
    const name = newCategory.trim()
    if (!name) return

    void run(
      'new-category',
      () => adminApi.createCategory(name),
      'Category added',
    )
    setNewCategory('')
  }

  return (
    <AppShell>
      <Link
        to="/admin"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to overview
      </Link>

      <div className="mt-4">
        <p className="text-sm font-medium text-brand-700">Admin workspace</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
          Settings
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Manage the people, statuses, categories, and rules behind the queue.
        </p>
      </div>

      {resource.error ? (
        <FeedbackAlert className="mt-6">
          <div className="flex flex-wrap items-center gap-3">
            <span>{resource.error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={resource.reload}
              className="border-red-200 bg-white text-red-800"
            >
              Try again
            </Button>
          </div>
        </FeedbackAlert>
      ) : null}

      <Tabs
        value={tab}
        onValueChange={(next) =>
          setSearchParams(next === 'users' ? {} : { tab: next }, {
            replace: true,
          })
        }
        className="mt-6"
      >
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="statuses">Statuses</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-4">
          {!data ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <UsersCard
              users={data.users}
              currentUserId={user?.id}
              busy={busy}
              onRoleChange={(target, role) =>
                void run(
                  `role-${target.id}`,
                  () => adminApi.setUserRole(target.id, role),
                  `${target.name} is now ${ROLE_LABELS[role].toLowerCase()}`,
                )
              }
              onActiveChange={(target, active) =>
                void run(
                  `active-${target.id}`,
                  () => adminApi.setUserActive(target.id, active),
                  active
                    ? `${target.name} activated`
                    : `${target.name} deactivated`,
                )
              }
            />
          )}
        </TabsContent>

        <TabsContent value="statuses" className="mt-4">
          {!data ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <TaxonomyCard
              title="Statuses"
              description="Only active statuses appear on the board and in the ticket actions."
              items={data.statuses}
              newValue={newStatus}
              onNewValueChange={setNewStatus}
              onAdd={addStatus}
              addLabel="Add status"
              busyKey="new-status"
              busyPrefix="status"
              busy={busy}
              onToggle={(item) =>
                void run(
                  `status-${item.id}`,
                  () => adminApi.setStatusActive(item.id, !item.active),
                  item.active
                    ? `${item.name} deactivated`
                    : `${item.name} activated`,
                )
              }
            />
          )}
        </TabsContent>

        <TabsContent value="categories" className="mt-4">
          {!data ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <TaxonomyCard
              title="Categories"
              description="Inactive categories stay on existing tickets but cannot be selected when raising a ticket."
              items={data.categories}
              newValue={newCategory}
              onNewValueChange={setNewCategory}
              onAdd={addCategory}
              addLabel="Add category"
              busyKey="new-category"
              busyPrefix="category"
              busy={busy}
              onToggle={(item) =>
                void run(
                  `category-${item.id}`,
                  () => adminApi.setCategoryActive(item.id, !item.active),
                  item.active
                    ? `${item.name} deactivated`
                    : `${item.name} activated`,
                )
              }
            />
          )}
        </TabsContent>

        <TabsContent value="automation" className="mt-4">
          {!data ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <AutomationCard
              key={data.settings.overdueHours}
              overdueHours={data.settings.overdueHours}
              saving={busy === 'settings'}
              onSave={(hours) =>
                void run(
                  'settings',
                  () => adminApi.saveSettings({ overdueHours: hours }),
                  'Automation rule saved',
                )
              }
            />
          )}
        </TabsContent>
      </Tabs>
    </AppShell>
  )
}

function UsersCard({
  users,
  currentUserId,
  busy,
  onRoleChange,
  onActiveChange,
}: {
  users: User[]
  currentUserId?: string
  busy: string | null
  onRoleChange: (user: User, role: Role) => void
  onActiveChange: (user: User, active: boolean) => void
}) {
  return (
    <Card className="gap-0 py-0 shadow-none">
      <CardHeader className="border-b border-slate-200 px-5 py-4">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <UserCog className="size-4 text-slate-500" aria-hidden="true" />
          Users
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead className="pl-5">Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="pr-5 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const isSelf = user.id === currentUserId

              return (
                <TableRow key={user.id} className="hover:bg-white">
                  <TableCell className="py-3 pl-5">
                    <p className="font-medium text-slate-900">
                      {user.name}
                      {isSelf ? (
                        <span className="ml-1.5 text-xs font-normal text-slate-500">
                          (you)
                        </span>
                      ) : null}
                    </p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </TableCell>

                  <TableCell>
                    <Select
                      value={user.role}
                      onValueChange={(next) =>
                        onRoleChange(user, next as Role)
                      }
                      disabled={isSelf || busy === `role-${user.id}`}
                    >
                      <SelectTrigger
                        className="h-8 w-32 border-slate-300 bg-white"
                        aria-label={`Role for ${user.name}`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(ROLE_LABELS) as Role[]).map((role) => (
                          <SelectItem key={role} value={role}>
                            {ROLE_LABELS[role]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        user.active
                          ? 'rounded-full border-emerald-200 bg-emerald-50 text-emerald-700'
                          : 'rounded-full border-slate-200 bg-slate-100 text-slate-600'
                      }
                    >
                      {user.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>

                  <TableCell className="pr-5 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isSelf || busy === `active-${user.id}`}
                      onClick={() => onActiveChange(user, !user.active)}
                    >
                      {busy === `active-${user.id}` ? (
                        <LoaderCircle
                          className="size-3.5 animate-spin"
                          aria-hidden="true"
                        />
                      ) : null}
                      {user.active ? 'Deactivate' : 'Activate'}
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function TaxonomyCard({
  title,
  description,
  items,
  newValue,
  onNewValueChange,
  onAdd,
  addLabel,
  busyKey,
  busyPrefix,
  busy,
  onToggle,
}: {
  title: string
  description: string
  items: Array<Status | Category>
  newValue: string
  onNewValueChange: (value: string) => void
  onAdd: (event: FormEvent) => void
  addLabel: string
  busyKey: string
  busyPrefix: string
  busy: string | null
  onToggle: (item: Status | Category) => void
}) {
  return (
    <Card className="gap-0 py-0 shadow-none">
      <CardHeader className="border-b border-slate-200 px-5 py-4">
        <CardTitle className="text-sm font-semibold text-slate-900">
          {title}
        </CardTitle>
        <p className="text-sm text-slate-600">{description}</p>
      </CardHeader>

      <CardContent className="p-5">
        <form onSubmit={onAdd} className="flex flex-col gap-2 sm:flex-row">
          <div className="flex-1">
            <Label htmlFor={`new-${busyKey}`} className="sr-only">
              {addLabel}
            </Label>
            <Input
              id={`new-${busyKey}`}
              value={newValue}
              onChange={(event) => onNewValueChange(event.target.value)}
              placeholder={`New ${title.slice(0, -1).toLowerCase()} name`}
              className="h-9 border-slate-300 bg-white"
            />
          </div>
          <Button
            type="submit"
            disabled={!newValue.trim() || busy === busyKey}
          >
            {busy === busyKey ? (
              <LoaderCircle
                className="size-4 animate-spin"
                aria-hidden="true"
              />
            ) : (
              <Plus className="size-4" aria-hidden="true" />
            )}
            {addLabel}
          </Button>
        </form>

        <ul className="mt-5 divide-y divide-slate-200 border-t border-slate-200">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-800">
                  {item.name}
                </p>
                <p className="font-mono text-[11px] text-slate-500">
                  {item.id}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <Badge
                  variant="outline"
                  className={
                    item.active
                      ? 'rounded-full border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'rounded-full border-slate-200 bg-slate-100 text-slate-600'
                  }
                >
                  {item.active ? 'Active' : 'Inactive'}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={busy === `${busyPrefix}-${item.id}`}
                  onClick={() => onToggle(item)}
                >
                  {item.active ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

function AutomationCard({
  overdueHours,
  saving,
  onSave,
}: {
  overdueHours: number
  saving: boolean
  onSave: (hours: number) => void
}) {
  const [hours, setHours] = useState(String(overdueHours))

  return (
    <Card className="max-w-xl gap-0 py-0 shadow-none">
      <CardHeader className="border-b border-slate-200 px-5 py-4">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Timer className="size-4 text-slate-500" aria-hidden="true" />
          Overdue rule
        </CardTitle>
        <p className="text-sm text-slate-600">
          An open, unassigned ticket is marked overdue after this many hours.
        </p>
      </CardHeader>

      <CardContent className="p-5">
        <form
          onSubmit={(event) => {
            event.preventDefault()
            onSave(Number(hours))
          }}
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <div className="w-full sm:w-40">
            <Label htmlFor="overdue-hours" className="text-slate-700">
              Hours
            </Label>
            <Input
              id="overdue-hours"
              type="number"
              min={1}
              max={168}
              value={hours}
              onChange={(event) => setHours(event.target.value)}
              className="mt-1.5 h-9 border-slate-300 bg-white"
            />
          </div>

          <Button type="submit" disabled={saving}>
            {saving ? (
              <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
            ) : null}
            Save rule
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
