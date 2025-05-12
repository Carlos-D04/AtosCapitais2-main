'use client'

import { useEffect, useState } from 'react'
import ChartOverview from '@/components/chart'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  BadgeDollarSign,
  DollarSign,
  Percent,
  User
} from 'lucide-react'
import { fetchDailySalesData } from '@/services/dateService'

interface Consulta {
  id: string
  tipo: 'filial' | 'ano'
  valor: string
  nome: string
  timestamp: Date
  filtro: string
}

export default function Dashboard() {
  const [salesData, setSalesData] = useState<any[]>([])
  const [branchsData, setBranchsData] = useState<any[]>([])
  const [totalVendas, setTotalVendas] = useState(0)
  const [totalEmpresas, setTotalEmpresas] = useState(0)
  const [totalPedidos, setTotalPedidos] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const [selectedBranch, setSelectedBranch] = useState<string>('all')
  const [selectedYear, setSelectedYear] = useState<string>('all')
  const [availableYears, setAvailableYears] = useState<string[]>([])

  const [consultas, setConsultas] = useState<Consulta[]>([])
  const [currentFilters, setCurrentFilters] = useState({
    branch: 'Todas as filiais',
    year: 'Todos os anos'
  })

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          setError('Token de autenticação não encontrado.')
          return
        }

        const { branchs, sales } = await fetchDailySalesData(token)

        const salesWithBranchCnpj = sales.map((sale: any) => ({
          ...sale,
          branch_cnpj: branchs.find((b: any) => b.name === sale.branche_name)?.cnpj || ''
        }))

        const years = [...new Set(sales.map((sale: any) => 
          new Date(sale.date).getFullYear().toString()
        ))].sort((a, b) => parseInt(b) - parseInt(a))

        const somaInicial = salesWithBranchCnpj.reduce((acc, venda) => acc + Number(venda.value), 0)

        setSalesData(salesWithBranchCnpj)
        setBranchsData(branchs)
        setTotalVendas(somaInicial)
        setTotalEmpresas(branchs.length)
        setTotalPedidos(salesWithBranchCnpj.length)
        setAvailableYears(years)
      } catch (err: any) {
        console.error('Erro ao buscar dados:', err)
        setError('Erro ao carregar dados. Verifique o token.')
      } finally {
        setLoading(false)
      }
    }

    carregarDados()
  }, [])

  useEffect(() => {
    const newConsultas: Consulta[] = []
    const now = new Date()

    if (selectedBranch !== 'all') {
      newConsultas.push({
        id: now.getTime() + '-branch',
        tipo: 'filial',
        valor: selectedBranch,
        nome: branchsData.find(b => b.cnpj === selectedBranch)?.name || selectedBranch,
        timestamp: now,
        filtro: 'Filial'
      })
      setCurrentFilters(prev => ({
        ...prev,
        branch: branchsData.find(b => b.cnpj === selectedBranch)?.name || 'Todas as filiais'
      }))
    } else {
      setCurrentFilters(prev => ({ ...prev, branch: 'Todas as filiais' }))
    }

    if (selectedYear !== 'all') {
      newConsultas.push({
        id: now.getTime() + '-year',
        tipo: 'ano',
        valor: selectedYear,
        nome: `Ano ${selectedYear}`,
        timestamp: now,
        filtro: 'Ano'
      })
      setCurrentFilters(prev => ({ ...prev, year: selectedYear }))
    } else {
      setCurrentFilters(prev => ({ ...prev, year: 'Todos os anos' }))
    }

    if (newConsultas.length > 0) {
      setConsultas(prev => [...newConsultas, ...prev].slice(0, 50))
    }
  }, [selectedBranch, selectedYear, branchsData])

  const filteredByBranch = selectedBranch === 'all'
    ? salesData
    : salesData.filter(sale => sale.branch_cnpj === selectedBranch)

  const filteredSales = selectedYear === 'all'
    ? filteredByBranch
    : filteredByBranch.filter(sale =>
        new Date(sale.date).getFullYear().toString() === selectedYear
      )

  const previousYear = selectedYear !== 'all'
    ? (parseInt(selectedYear) - 1).toString()
    : null

  const previousSales = previousYear
    ? filteredByBranch.filter(sale =>
        new Date(sale.date).getFullYear().toString() === previousYear
      )
    : []

  const groupSalesByMonth = (sales: any[]) => {
    const months: Record<string, number> = {}
    sales.forEach((sale) => {
      const month = new Date(sale.date).toLocaleString('pt-BR', { month: 'long' }).toLowerCase()
      months[month] = (months[month] || 0) + sale.value
    })
    return months
  }

  const currentSalesByMonth = groupSalesByMonth(filteredSales)
  const previousSalesByMonth = groupSalesByMonth(previousSales)

  const allMonths = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ]

  const chartData = allMonths.map((month) => ({
    month: month.charAt(0).toUpperCase() + month.slice(1),
    atual: currentSalesByMonth[month] || 0,
    anterior: previousSalesByMonth[month] || 0
  }))

  useEffect(() => {
    const soma = filteredSales.reduce((acc: number, venda: any) => acc + Number(venda.value), 0)
    const pedidos = filteredSales.length
    setTotalVendas(soma)
    setTotalPedidos(pedidos)
  }, [filteredSales])

  if (loading) return <p className="p-4 text-gray-700">Carregando...</p>
  if (error) return <p className="p-4 text-red-600">{error}</p>

  return (
    <main className="sm:ml-14 p-4">
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-center">
              <CardTitle className="text-lg sm:text-xl text-gray-800 select-none">
                Total vendas
              </CardTitle>
              <DollarSign className="ml-auto w-4 h-4" />
            </div>
            <CardDescription>
              {currentFilters.year} • {currentFilters.branch}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-base sm:text-lg font-bold">
              R$ {totalVendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-center">
              <CardTitle className="text-lg sm:text-xl text-gray-800 select-none">
                Novas Empresas
              </CardTitle>
              <User className="ml-auto w-4 h-4" />
            </div>
            <CardDescription>Total cadastrado</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-base sm:text-lg font-bold">{totalEmpresas}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-center">
              <CardTitle className="text-lg sm:text-xl text-gray-800 select-none">
                Relatórios
              </CardTitle>
              <Percent className="ml-auto w-4 h-4" />
            </div>
            <CardDescription>Total gerados</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-base sm:text-lg font-bold">33</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-center">
              <CardTitle className="text-lg sm:text-xl text-gray-800 select-none">
                Total de Vendas
              </CardTitle>
              <BadgeDollarSign className="ml-auto w-4 h-4" />
            </div>
            <CardDescription>
              {currentFilters.year} • {currentFilters.branch}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-base sm:text-lg font-bold">{totalPedidos}</p>
          </CardContent>
        </Card>
      </section>

      <section className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Overview Histórico</h2>
          <div className="flex gap-2">
            <select 
              onChange={(e) => setSelectedYear(e.target.value)}
              value={selectedYear}
              className="p-2 text-sm border rounded-md bg-white dark:bg-gray-800 min-w-[120px]"
            >
              <option value="all">Todos os anos</option>
              {availableYears.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            <select 
              onChange={(e) => setSelectedBranch(e.target.value)}
              value={selectedBranch}
              className="p-2 text-sm border rounded-md bg-white dark:bg-gray-800 min-w-[150px]"
            >
              <option value="all">Todas as filiais</option>
              {branchsData.map((branch) => (
                <option key={branch.cnpj} value={branch.cnpj}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <ChartOverview data={chartData} />
        </div>
      </section>
    </main>
  )
}