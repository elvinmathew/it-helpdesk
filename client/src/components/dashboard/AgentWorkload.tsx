import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { AgentCount } from '../../api/types'
import { initials } from '../../lib/ticket-meta'

interface AgentWorkloadProps {
  data: AgentCount[]
}

export function AgentWorkload({ data }: AgentWorkloadProps) {
  return (
    <Card className="gap-0 py-0 shadow-none">
      <CardHeader className="border-b border-slate-200 px-5 py-4">
        <CardTitle className="text-sm font-semibold text-slate-900">
          Tickets handled per agent
        </CardTitle>
        <CardDescription>Tickets currently assigned to each agent.</CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        {data.length === 0 ? (
          <p className="px-5 py-8 text-sm text-slate-500">
            No active agents yet.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead>Agent</TableHead>
                <TableHead className="text-right">Tickets</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((agent) => (
                <TableRow key={agent.agentId}>
                  <TableCell className="py-3">
                    <span className="flex items-center gap-2.5">
                      <span className="flex size-7 items-center justify-center rounded-full bg-brand-50 text-[11px] font-semibold text-brand-700">
                        {initials(agent.agentName)}
                      </span>
                      <span className="font-medium text-slate-800">
                        {agent.agentName}
                      </span>
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-medium text-slate-700">
                    {agent.count}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
