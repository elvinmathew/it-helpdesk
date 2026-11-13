import { AppShell } from '../components/layout/AppShell'
import { DashboardPlaceholder } from '../components/dashboard/DashboardPlaceholder'

export function EmployeeDashboard() {
  return (
    <AppShell>
      <DashboardPlaceholder
        role="Employee"
        title="Your tickets"
        description="Raise a ticket and follow it from open to resolved."
        upcoming={[
          'Open and resolved ticket counts',
          'A list of your recent tickets with status badges',
          'The Raise new ticket form with active categories',
          'Ticket details, status history, and comments',
        ]}
      />
    </AppShell>
  )
}
