import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, LoaderCircle } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { catalogApi } from '../api/catalog'
import { ticketsApi } from '../api/tickets'
import { AppShell } from '../components/layout/AppShell'
import { TextField } from '../components/ui/TextField'
import { FeedbackAlert } from '../components/ui/FeedbackAlert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
import { applyApiError } from '../lib/form-errors'
import { useAsyncData } from '../lib/use-async-data'
import {
  raiseTicketSchema,
  type RaiseTicketValues,
} from '../lib/validation'

export function RaiseTicketPage() {
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string | null>(null)
  const categories = useAsyncData(
    () =>
      catalogApi
        .categories()
        .then((items) => items.filter((category) => category.active)),
    'raise-categories',
  )

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RaiseTicketValues>({
    resolver: zodResolver(raiseTicketSchema),
    defaultValues: {
      title: '',
      description: '',
      categoryId: '',
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)

    try {
      const ticket = await ticketsApi.create(values)
      toast.success(`Ticket ${ticket.id} raised`)
      navigate(`/tickets/${ticket.id}`, {
        state: { notice: 'Your ticket was raised and is now open.' },
      })
    } catch (error) {
      applyApiError(error, setError, setFormError, [
        'title',
        'description',
        'categoryId',
      ])
    }
  })

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-3xl">
        <Link
          to="/employee"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to my tickets
        </Link>

        <div className="mt-4">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Raise a new ticket
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Tell us what is wrong and pick the closest category. An agent will
            pick it up from there.
          </p>
        </div>

        <Card className="mt-6 gap-0 py-0 shadow-none">
          <CardContent className="p-5 sm:p-6">
            <form onSubmit={onSubmit} className="space-y-5" noValidate>
              {formError ? <FeedbackAlert>{formError}</FeedbackAlert> : null}

              <TextField
                label="Title"
                placeholder="Short summary of the issue"
                error={errors.title?.message}
                hint="For example: Laptop will not connect to the office Wi-Fi."
                autoFocus
                {...register('title')}
              />

              <div>
                <Label htmlFor="description" className="text-slate-700">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="What happened, when it started, and anything you have already tried."
                  aria-invalid={errors.description ? true : undefined}
                  aria-describedby={
                    errors.description ? 'description-error' : undefined
                  }
                  className="mt-1.5 min-h-40 resize-y border-slate-300 bg-white shadow-xs focus-visible:border-brand-500 focus-visible:ring-brand-100 aria-invalid:border-red-300"
                  {...register('description')}
                />
                {errors.description ? (
                  <p
                    id="description-error"
                    className="mt-1.5 text-xs text-red-600"
                  >
                    {errors.description.message}
                  </p>
                ) : (
                  <p className="mt-1.5 text-xs text-slate-500">
                    Include error messages and steps you have tried.
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="category" className="text-slate-700">
                  Category
                </Label>

                {categories.error ? (
                  <FeedbackAlert className="mt-1.5">
                    <div className="flex flex-wrap items-center gap-3">
                      <span>{categories.error}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={categories.reload}
                        className="border-red-200 bg-white text-red-800"
                      >
                        Try again
                      </Button>
                    </div>
                  </FeedbackAlert>
                ) : categories.loading ? (
                  <Skeleton className="mt-1.5 h-10 w-full" />
                ) : (
                  <Controller
                    control={control}
                    name="categoryId"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger
                          id="category"
                          aria-invalid={
                            errors.categoryId ? true : undefined
                          }
                          className="mt-1.5 h-10 w-full border-slate-300 bg-white"
                        >
                          <SelectValue placeholder="Choose a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {(categories.data ?? []).map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                )}

                {errors.categoryId ? (
                  <p className="mt-1.5 text-xs text-red-600">
                    {errors.categoryId.message}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                <Button variant="outline" asChild>
                  <Link to="/employee">Cancel</Link>
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || categories.loading}
                >
                  {isSubmitting ? (
                    <LoaderCircle
                      className="size-4 animate-spin"
                      aria-hidden="true"
                    />
                  ) : null}
                  Raise ticket
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
