import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthProvider'
import { GuestOnly, HomeRedirect, RequireAuth } from './auth/RequireAuth'
import { AdminDashboard } from './pages/AdminDashboard'
import { AgentDashboard } from './pages/AgentDashboard'
import { EmployeeDashboard } from './pages/EmployeeDashboard'
import { LoginPage } from './pages/LoginPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { SignupPage } from './pages/SignupPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />

          <Route element={<GuestOnly />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
          </Route>

          <Route element={<RequireAuth roles={['employee']} />}>
            <Route path="/employee" element={<EmployeeDashboard />} />
          </Route>

          <Route element={<RequireAuth roles={['agent']} />}>
            <Route path="/agent" element={<AgentDashboard />} />
          </Route>

          <Route element={<RequireAuth roles={['admin']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
