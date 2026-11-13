import { Eye, EyeOff, Lock } from 'lucide-react'
import { forwardRef, useState } from 'react'
import { TextField, type TextFieldProps } from '../ui/TextField'

type PasswordFieldProps = Omit<
  TextFieldProps,
  'type' | 'startIcon' | 'endAdornment'
>

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  function PasswordField(props, ref) {
    const [visible, setVisible] = useState(false)

    return (
      <TextField
        {...props}
        ref={ref}
        type={visible ? 'text' : 'password'}
        startIcon={<Lock className="size-4" />}
        endAdornment={
          <button
            type="button"
            onClick={() => setVisible((current) => !current)}
            className="rounded p-2 text-slate-400 transition-colors hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            aria-label={visible ? 'Hide password' : 'Show password'}
          >
            {visible ? (
              <EyeOff className="size-4" aria-hidden="true" />
            ) : (
              <Eye className="size-4" aria-hidden="true" />
            )}
          </button>
        }
      />
    )
  },
)
