'use client'

import { useEffect, useState } from 'react'
import { DollarSign } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts'

interface Sale {
  id: number
  date: string
  value: number
  cnpj: string
  branche_name: string
  goal: number
}

interface ChartOverviewProps {
  sales: Sale[]
}

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril',
  'Maio', 'Junho', 'Julho', 'Agosto',
  'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

export default function ChartOverview({ sales }: ChartOverviewProps) {
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    const monthlyData = MONTHS.map(month => ({
      month,
      total: 0
    }))

    sales.forEach((venda) => {
      const monthIndex = new Date(venda.date).getMonth()
      if (monthIndex >= 0 && monthIndex < MONTHS.length) {
        monthlyData[monthIndex].total += Number(venda.value)
      }
    })

    setChartData(monthlyData)
  }, [sales])

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-center">
          <CardTitle className="text-lg sm:text-xl text-gray-800">
            Overview Histórico
          </CardTitle>
          <DollarSign className="ml-auto w-4 h-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
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
                formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR')}`, 'Total']}
                labelFormatter={(label) => `Mês: ${label}`}
              />
              <Bar 
                dataKey="total" 
                fill="#2563eb" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}