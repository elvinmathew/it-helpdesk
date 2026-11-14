import { lazy, Suspense } from 'react'
import { LoaderCircle } from 'lucide-react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from './auth/AuthProvider'
import { GuestOnly, HomeRedirect, RequireAuth } from './auth/RequireAuth'
import { EmployeeDashboard } from './pages/EmployeeDashboard'
import { LoginPage } from './pages/LoginPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { RaiseTicketPage } from './pages/RaiseTicketPage'
import { SignupPage } from './pages/SignupPage'
import { TicketDetailPage } from './pages/TicketDetailPage'

// The kanban board (dnd) and the admin charts (recharts) are the heaviest
// dependencies, so their pages load on demand.
const AgentDashboard = lazy(() =>
  import('./pages/AgentDashboard').then((module) => ({
    default: module.AgentDashboard,
  })),
)
const AdminDashboard = lazy(() =>
  import('./pages/AdminDashboard').then((module) => ({
    default: module.AdminDashboard,
  })),
)
const AdminInsightsPage = lazy(() =>
  import('./pages/AdminInsightsPage').then((module) => ({
    default: module.AdminInsightsPage,
  })),
)
const AdminSettingsPage = lazy(() =>
  import('./pages/AdminSettingsPage').then((module) => ({
    default: module.AdminSettingsPage,
  })),
)

function RouteFallback() {
  return (
    <div className="grid min-h-dvh place-items-center bg-slate-50">
      <LoaderCircle
        className="size-5 animate-spin text-brand-600"
        aria-label="Loading"
      />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<HomeRedirect />} />

            <Route element={<GuestOnly />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
            </Route>

            <Route element={<RequireAuth roles={['employee']} />}>
              <Route path="/employee" element={<EmployeeDashboard />} />
              <Route path="/tickets/new" element={<RaiseTicketPage />} />
            </Route>

            <Route
              element={<RequireAuth roles={['employee', 'agent', 'admin']} />}
            >
              <Route path="/tickets/:ticketId" element={<TicketDetailPage />} />
            </Route>

            <Route element={<RequireAuth roles={['agent', 'admin']} />}>
              <Route path="/agent" element={<AgentDashboard />} />
            </Route>

            <Route element={<RequireAuth roles={['admin']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/insights" element={<AdminInsightsPage />} />
              <Route path="/admin/settings" element={<AdminSettingsPage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </AuthProvider>

      <Toaster richColors position="top-right" closeButton />
    </BrowserRouter>
  )
}
