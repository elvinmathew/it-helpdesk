import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { StatusCount } from '../../api/types'

interface TicketsChartProps {
  data: StatusCount[]
}

export function TicketsChart({ data }: TicketsChartProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0)
  const chartData = data.filter((item) => item.count > 0)

  return (
    <Card className="gap-0 py-0 shadow-none">
      <CardHeader className="border-b border-slate-200 px-5 py-4">
        <CardTitle className="text-sm font-semibold text-slate-900">
          Tickets by status
        </CardTitle>
        <CardDescription>Current distribution across the workflow.</CardDescription>
      </CardHeader>

      <CardContent className="p-5">
        {total === 0 || chartData.length === 0 ? (
          <p className="flex h-56 items-center justify-center text-sm text-slate-500">
            No tickets to chart yet.
          </p>
        ) : (
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid
                  vertical={false}
                  stroke="#e2e8f0"
                  strokeDasharray="3 3"
                />
                <XAxis
                  dataKey="statusName"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    fontSize: 12,
                  }}
                />
                <Bar
                  dataKey="count"
                  name="Tickets"
                  fill="#4f46e5"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={56}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
