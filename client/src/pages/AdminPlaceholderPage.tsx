import { Construction } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface AdminPlaceholderPageProps {
  title: string
  description: string
}

export function AdminPlaceholderPage({
  title,
  description,
}: AdminPlaceholderPageProps) {
  return (
    <AppShell>
      <div className="mx-auto w-full max-w-2xl">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          {title}
        </h1>
        <p className="mt-1 text-sm text-slate-600">{description}</p>

        <Card className="mt-6 gap-0 py-0 shadow-none">
          <CardContent className="flex flex-col items-center px-6 py-12 text-center">
            <span className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <Construction className="size-5" aria-hidden="true" />
            </span>
            <h2 className="mt-3 text-sm font-semibold text-slate-900">
              Not built yet
            </h2>
            <p className="mt-1 max-w-sm text-sm text-slate-600">
              This settings screen is next on the list. Until then, the
              dashboard and ticket queue are fully usable.
            </p>
            <Button variant="outline" asChild className="mt-5">
              <Link to="/admin">Back to overview</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
