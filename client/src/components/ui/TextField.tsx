import { CircleExclamationPoint } from 'lucide-react'
import {
  forwardRef,
  useId,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export interface TextFieldProps extends ComponentPropsWithoutRef<'input'> {
  label: string
  error?: string
  hint?: string
  startIcon?: ReactNode
  endAdornment?: ReactNode
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField(
    { label, error, hint, startIcon, endAdornment, id, className, ...props },
    ref,
  ) {
    const generatedId = useId()
    const inputId = id ?? generatedId
    const describedBy = error
      ? `${inputId}-error`
      : hint
        ? `${inputId}-hint`
        : undefined

    return (
      <div>
        <Label htmlFor={inputId} className="text-slate-700">
          {label}
        </Label>

        <div className="relative mt-1.5">
          {startIcon ? (
            <span
              className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3 text-slate-400"
              aria-hidden="true"
            >
              {startIcon}
            </span>
          ) : null}

          <Input
            ref={ref}
            id={inputId}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={cn(
              'h-11 border-slate-300 bg-white shadow-xs focus-visible:border-brand-500 focus-visible:ring-brand-100',
              startIcon ? 'pl-10' : 'pl-3',
              endAdornment ? 'pr-11' : 'pr-3',
              error &&
                'border-red-300 focus-visible:border-red-400 focus-visible:ring-red-100',
              className,
            )}
            {...props}
          />

          {endAdornment ? (
            <div className="absolute inset-y-0 right-0 z-10 flex items-center pr-1">
              {endAdornment}
            </div>
          ) : null}
        </div>

        {error ? (
          <p
            id={`${inputId}-error`}
            className="mt-1.5 flex items-start gap-1.5 text-xs text-red-600"
          >
            <CircleExclamationPoint
              className="mt-px size-3.5 shrink-0"
              aria-hidden="true"
            />
            <span>{error}</span>
          </p>
        ) : hint ? (
          <p id={`${inputId}-hint`} className="mt-1.5 text-xs text-slate-500">
            {hint}
          </p>
        ) : null}
      </div>
    )
  },
)
