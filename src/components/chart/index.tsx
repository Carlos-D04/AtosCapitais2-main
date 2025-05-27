'use client'

import { DollarSign } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '../ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend
} from 'recharts'

interface ChartData {
  month: string
  atual: number
  anterior: number
}

interface ChartOverviewProps {
  data: ChartData[]
}

export default function ChartOverview({ data }: ChartOverviewProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg sm:text-xl text-gray-800">
            Overview Histórico
          </CardTitle>
          <DollarSign className="w-5 h-5" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                interval={0}
              />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(value: any, name: string) => [
                  `R$ ${Number(value).toLocaleString('pt-BR')}`,
                  name
                ]}
                labelFormatter={(label) => `Mês: ${label}`}
              />
              <Legend />
              <Bar
                dataKey="anterior"
                fill="#f97316"
                name="Ano Anterior"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="atual"
                fill="#2563eb"
                name="Ano Atual"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}