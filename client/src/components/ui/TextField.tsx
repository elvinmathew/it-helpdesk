import { CircleExclamationPoint } from 'lucide-react'
import {
  forwardRef,
  useId,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react'
import { cn } from '../../lib/cn'

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
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-slate-700"
        >
          {label}
        </label>

        <div className="relative mt-1.5">
          {startIcon ? (
            <span
              className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"
              aria-hidden="true"
            >
              {startIcon}
            </span>
          ) : null}

          <input
            ref={ref}
            id={inputId}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={cn(
              'h-11 w-full rounded-md border bg-white text-sm text-slate-900 shadow-xs outline-none transition-colors placeholder:text-slate-400 focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500',
              'focus:border-brand-500 focus:ring-brand-100',
              startIcon ? 'pl-10' : 'pl-3',
              endAdornment ? 'pr-11' : 'pr-3',
              error ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-slate-300',
              className,
            )}
            {...props}
          />

          {endAdornment ? (
            <div className="absolute inset-y-0 right-0 flex items-center pr-1">
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
