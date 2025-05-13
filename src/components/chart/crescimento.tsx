'use client'

import { TrendingUp } from 'lucide-react'
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
  ResponsiveContainer
} from 'recharts'

interface CrescimentoData {
  month: string
  crescimento: number
}

interface ChartCrescimentoProps {
  data: CrescimentoData[]
}

export default function ChartCrescimento({ data }: ChartCrescimentoProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-center">
          <CardTitle className="text-lg sm:text-xl text-gray-800">
            Crescimento Mensal (%)
          </CardTitle>
          <TrendingUp className="ml-auto w-4 h-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} interval={0} />
              <YAxis axisLine={false} tickLine={false} unit="%" />
              <Tooltip
                formatter={(value: any) => [`${value.toFixed(2)}%`, 'Crescimento']}
                labelFormatter={(label) => `Mês: ${label}`}
              />
              <Bar
                dataKey="crescimento"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}