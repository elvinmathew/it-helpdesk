import { AppShell } from '../components/layout/AppShell'
import { DashboardPlaceholder } from '../components/dashboard/DashboardPlaceholder'

export function AdminDashboard() {
  return (
    <AppShell>
      <DashboardPlaceholder
        role="Admin"
        title="Administration"
        description="Oversee the queue and shape how tickets move through the system."
        upcoming={[
          'Total, open, and overdue ticket counts with active agents',
          'Tickets by status and tickets handled per agent',
          'User management with role changes and deactivation',
          'Status, category, and auto-rule settings',
        ]}
      />
    </AppShell>
  )
}
