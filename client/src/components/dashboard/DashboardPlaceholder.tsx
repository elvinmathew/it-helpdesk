import { useAuth } from '../../auth/context'

interface DashboardPlaceholderProps {
  role: string
  title: string
  description: string
  upcoming: string[]
}

export function DashboardPlaceholder({
  role,
  title,
  description,
  upcoming,
}: DashboardPlaceholderProps) {
  const { user } = useAuth()

  return (
    <div>
      <div>
        <p className="text-sm font-medium text-brand-700">{role} workspace</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
          {title}
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm text-slate-600">{description}</p>
      </div>

      <section className="mt-8 rounded-lg border border-slate-200 bg-white p-6 sm:p-8">
        <div className="max-w-2xl">
          <h2 className="text-sm font-semibold text-slate-900">
            You are signed in
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            {user?.name} ({user?.email}) · {role} access. This page is a
            placeholder; the ticket features for this role will be built next.
          </p>

          <h3 className="mt-6 text-sm font-medium text-slate-900">
            Coming next
          </h3>
          <ul className="mt-2 space-y-2">
            {upcoming.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2.5 text-sm text-slate-600"
              >
                <span
                  className="mt-[7px] size-1 shrink-0 rounded-full bg-slate-400"
                  aria-hidden="true"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}
