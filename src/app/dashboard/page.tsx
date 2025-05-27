'use client'

import { useEffect, useMemo, useState } from 'react'
import ChartOverview from '@/components/chart'
import ChartMetas from '@/components/chart/meta'
import ChartCrescimento from '@/components/chart/crescimento'
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
  User,
  TrendingUp
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

interface PrevisaoVendas {
  mes: string
  valor: number
  crescimentoEsperado: number
}

export default function Dashboard() {
  const [salesData, setSalesData] = useState<any[]>([])
  const [branchsData, setBranchsData] = useState<any[]>([])
  const [totalVendas, setTotalVendas] = useState(0)
  const [totalEmpresas, setTotalEmpresas] = useState(0)
  const [vendaDia, setVendaDia] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingChart, setLoadingChart] = useState(false)
  const [error, setError] = useState('')

  const [selectedBranch, setSelectedBranch] = useState<string>('all')
  const [selectedYear, setSelectedYear] = useState<string>('all')
  const [availableYears, setAvailableYears] = useState<string[]>([])
  const [selectedChart, setSelectedChart] = useState<'vendas' | 'metas' | 'crescimento'>('vendas')

  const [consultas, setConsultas] = useState<Consulta[]>([])
  const [currentFilters, setCurrentFilters] = useState({
    branch: 'Todas as filiais',
    year: 'Todos os anos'
  })

  const [previsaoVendas, setPrevisaoVendas] = useState<PrevisaoVendas[]>([])
  const [mesSelecionadoPrevisao, setMesSelecionadoPrevisao] = useState<string>(
    new Date().toLocaleString('pt-BR', { month: 'long' }).toLowerCase()
  )

  const allMonths = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ]

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
  const filteredByBranch = useMemo(() => {
    return selectedBranch === 'all'
      ? salesData
      : salesData.filter(sale => sale.branch_cnpj === selectedBranch)
  }, [salesData, selectedBranch])

  useEffect(() => {
  if (filteredByBranch.length === 0) {
    setVendaDia(0)
    return
  }

  const datas = filteredByBranch.map(sale => sale.date)
  const ultimaData = datas.sort((a, b) => (a > b ? -1 : 1))[0]

  const vendaHoje = filteredByBranch
    .filter(sale => sale.date === ultimaData)
    .reduce((acc, venda) => acc + Number(venda.value), 0)

  setVendaDia(vendaHoje)
}, [filteredByBranch])

  const filteredSales = useMemo(() => {
    return selectedYear === 'all'
      ? filteredByBranch
      : filteredByBranch.filter(sale =>
          new Date(sale.date).getFullYear().toString() === selectedYear
        )
  }, [selectedYear, filteredByBranch])

  const previousSales = useMemo(() => {
    if (selectedYear === 'all') return []
    const previousYear = (parseInt(selectedYear) - 1).toString()
    return filteredByBranch.filter(sale =>
      new Date(sale.date).getFullYear().toString() === previousYear
    )
  }, [selectedYear, filteredByBranch])

  const groupSalesByMonth = (sales: any[]) => {
    const months: Record<string, number> = {}
    sales.forEach((sale) => {
      const [year, month] = sale.date.split('-')
      const monthIndex = parseInt(month) - 1
      const monthName = allMonths[monthIndex]
      months[monthName] = (months[monthName] || 0) + sale.value
    })
    return months
  }

  const chartDataVendas = useMemo(() => {
    const current = groupSalesByMonth(filteredSales)
    const previous = groupSalesByMonth(previousSales)

    return allMonths.map(month => ({
      month: month.charAt(0).toUpperCase() + month.slice(1),
      atual: current[month] || 0,
      anterior: previous[month] || 0
    }))
  }, [filteredSales, previousSales])

  const chartDataMetas = useMemo(() => {
    const current = groupSalesByMonth(filteredSales)
    const previous = groupSalesByMonth(previousSales)

    return allMonths.map(month => ({
      month: month.charAt(0).toUpperCase() + month.slice(1),
      atual: current[month] || 0,
      meta: previous[month] ? previous[month] * 1.05 : 0
    }))
  }, [filteredSales, previousSales])

  const chartDataCrescimento = useMemo(() => {
    const current = groupSalesByMonth(filteredSales)
    const previous = groupSalesByMonth(previousSales)

    return allMonths.map(month => {
      const atual = current[month] || 0
      const anterior = previous[month] || 0
      let crescimento = 0
      if (anterior > 0) {
        crescimento = ((atual - anterior) / anterior) * 100
      }
      return {
        month: month.charAt(0).toUpperCase() + month.slice(1),
        crescimento: parseFloat(crescimento.toFixed(2))
      }
    })
  }, [filteredSales, previousSales])

  useEffect(() => {
    setLoadingChart(true)
    const soma = filteredSales.reduce((acc: number, venda: any) => acc + Number(venda.value), 0)
    setTotalVendas(soma)
    const timer = setTimeout(() => setLoadingChart(false), 150)
    return () => clearTimeout(timer)
  }, [filteredSales, selectedBranch])
  

  if (loading) return <p className="p-4 text-gray-700">Carregando...</p>
  if (error) return <p className="p-4 text-red-600">{error}</p>

  return (
    <main className="sm:ml-14 p-4">
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-center">
              <CardTitle className="text-lg sm:text-xl text-gray-800 select-none">Total de Vendas</CardTitle>
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
              <CardTitle className="text-lg sm:text-xl text-gray-800 select-none">Total de Empresas</CardTitle>
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
              <CardTitle className="text-lg sm:text-xl text-gray-800 select-none">Vendas do Dia</CardTitle>
              <BadgeDollarSign className="ml-auto w-4 h-4" />
            </div>
            <CardDescription>
              {new Date().toLocaleDateString('pt-BR')} • {currentFilters.branch}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-base sm:text-lg font-bold">
              R$ {vendaDia.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-center">
              <CardTitle className="text-lg sm:text-xl text-gray-800 select-none">Previsão de Vendas</CardTitle>
              <TrendingUp className="ml-auto w-4 h-4" />
            </div>
            <CardDescription>
              {mesSelecionadoPrevisao.charAt(0).toUpperCase() + mesSelecionadoPrevisao.slice(1)} • {currentFilters.branch}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <select
              value={mesSelecionadoPrevisao}
              onChange={(e) => setMesSelecionadoPrevisao(e.target.value)}
              className="mb-2 p-1 text-sm border rounded w-full"
            >
              {allMonths.map(month => (
                <option key={month} value={month}>
                  {month.charAt(0).toUpperCase() + month.slice(1)}
                </option>
              ))}
            </select>

            {previsaoVendas.length > 0 && (
              <div className="flex justify-between text-sm mt-2">
                <span>{previsaoVendas[0].mes}:</span>
                <span className="font-medium">
                  R$ {previsaoVendas[0].valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  <span className={`ml-2 text-xs ${previsaoVendas[0].crescimentoEsperado >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    ({previsaoVendas[0].crescimentoEsperado.toFixed(2)}%)
                  </span>
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="mt-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <h2 className="text-xl font-bold">Visualização de Gráficos</h2>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedChart('vendas')}
              className={`px-4 py-2 rounded border text-sm font-medium ${
                selectedChart === 'vendas'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-100'
              }`}
            >
              Gráfico de Vendas
            </button>
            <button
              onClick={() => setSelectedChart('metas')}
              className={`px-4 py-2 rounded border text-sm font-medium ${
                selectedChart === 'metas'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-100'
              }`}
            >
              Gráfico de Metas
            </button>
            <button
              onClick={() => setSelectedChart('crescimento')}
              className={`px-4 py-2 rounded border text-sm font-medium ${
                selectedChart === 'crescimento'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-100'
              }`}
            >
              Gráfico de Crescimento
            </button>
          </div>
        </div>

        <div className="flex gap-4 mb-4">
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

        <div className="bg-white p-4 rounded-lg shadow min-h-[380px]">
          {loadingChart ? (
            <p className="text-center text-sm text-gray-500 mt-24">Carregando gráfico...</p>
          ) : selectedChart === 'vendas' ? (
            <ChartOverview data={chartDataVendas} />
          ) : selectedChart === 'metas' ? (
            <ChartMetas data={chartDataMetas} year={selectedYear} />
          ) : (
            <ChartCrescimento data={chartDataCrescimento} />
          )}
        </div>
      </section>
    </main>
  )
}
