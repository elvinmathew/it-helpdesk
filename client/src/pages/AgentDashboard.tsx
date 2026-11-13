import { AppShell } from '../components/layout/AppShell'
import { DashboardPlaceholder } from '../components/dashboard/DashboardPlaceholder'

export function AgentDashboard() {
  return (
    <AppShell>
      <DashboardPlaceholder
        role="Agent"
        title="Ticket queue"
        description="Work through incoming tickets and keep requesters up to date."
        upcoming={[
          'Unassigned and overdue counts',
          'The full ticket queue with status, priority, and category filters',
          'Quick actions to pick up a ticket and change its status',
          'Assignment, priority, and comment controls',
        ]}
      />
    </AppShell>
  )
}
