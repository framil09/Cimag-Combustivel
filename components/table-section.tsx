'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, Search, ChevronLeft, ChevronRight, Download, RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'

interface Registro {
  id: number
  numero: number | null
  data: string
  placa: string
  veiculo: string
  motorista: string
  departamento: string
  destino: string
  finalidade: string
  kmInicial: number
  kmFinal: number
  kmPercorrido: number
  combustivel: string
  litros: number | null
  valorLitro: number | null
  valorTotal: number | null
  kmLitro: number | null
  posto: string | null
  observacoes: string | null
  createdAt: string
}

export function TableSection() {
  const [registros, setRegistros] = useState<Registro[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchInput, setSearchInput] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page ?? 1),
        limit: '50',
        search: search ?? '',
      })
      const res = await fetch(`/api/registros?${params}`)
      const data = await res?.json?.()
      setRegistros(data?.registros ?? [])
      setTotal(data?.total ?? 0)
      setTotalPages(data?.totalPages ?? 1)
    } catch (err: any) {
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    const handler = () => {
      fetchData()
    }
    window?.addEventListener?.('registro-added', handler)
    return () => window?.removeEventListener?.('registro-added', handler)
  }, [fetchData])

  const handleSearch = () => {
    setPage(1)
    setSearch(searchInput ?? '')
  }

  const formatDate = (dateStr: string) => {
    try {
      if (!dateStr) return '-'
      const d = new Date(dateStr)
      return d?.toLocaleDateString?.('pt-BR') ?? '-'
    } catch {
      return '-'
    }
  }

  const formatCurrency = (val: number | null) => {
    if (val == null) return '-'
    return `R$ ${val?.toFixed?.(2) ?? '0.00'}`
  }

  const formatNumber = (val: number | null, decimals: number = 1) => {
    if (val == null) return '-'
    return val?.toFixed?.(decimals) ?? '0'
  }

  const exportExcel = () => {
    try {
      const headers = ['Nº', 'Data', 'Placa', 'Veículo', 'Motorista', 'Departamento', 'Destino', 'Finalidade', 'KM Inicial', 'KM Final', 'KM Percorrido', 'Combustível', 'Litros', 'Valor/Litro', 'Valor Total', 'KM/Litro', 'Posto', 'Observações']
      const rows = (registros ?? [])?.map?.((r: Registro) => [
        r?.numero ?? '',
        formatDate(r?.data ?? ''),
        r?.placa ?? '',
        r?.veiculo ?? '',
        r?.motorista ?? '',
        r?.departamento ?? '',
        r?.destino ?? '',
        r?.finalidade ?? '',
        r?.kmInicial ?? 0,
        r?.kmFinal ?? 0,
        r?.kmPercorrido ?? 0,
        r?.combustivel ?? '',
        r?.litros ?? 0,
        r?.valorLitro ?? 0,
        r?.valorTotal ?? 0,
        r?.kmLitro ?? 0,
        r?.posto ?? '',
        r?.observacoes ?? '',
      ]) ?? []

      const escapeCsv = (val: unknown) => {
        const s = String(val ?? '')
        if (s.includes(';') || s.includes('"') || s.includes('\n')) {
          return `"${s.replace(/"/g, '""')}"`
        }
        return s
      }

      const bom = '\uFEFF'
      const csv = bom + [headers, ...rows].map(row =>
        (Array.isArray(row) ? row : Object.values(row)).map(escapeCsv).join(';')
      ).join('\r\n')

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL?.createObjectURL?.(blob)
      const a = document?.createElement?.('a')
      if (a) {
        a.href = url ?? ''
        a.download = `CIMAG_Controle_KM_Combustivel_${new Date()?.toISOString?.()?.split?.('T')?.[0] ?? 'export'}.csv`
        a?.click?.()
        URL?.revokeObjectURL?.(url)
      }
    } catch (err: any) {
      console.error('Export error:', err)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Table className="w-5 h-5 text-primary" />
              <CardTitle className="font-display text-xl">Registros</CardTitle>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-mono">
                {total ?? 0}
              </span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar placa, motorista..."
                  className="pl-9 w-full sm:w-64"
                  value={searchInput ?? ''}
                  onChange={(e: any) => setSearchInput(e?.target?.value ?? '')}
                  onKeyDown={(e: any) => { if (e?.key === 'Enter') handleSearch() }}
                />
              </div>
              <Button variant="outline" size="icon" onClick={handleSearch} title="Buscar">
                <Search className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={fetchData} title="Atualizar">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <Button variant="outline" size="icon" onClick={exportExcel} title="Exportar Planilha Excel">
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">Nº</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">Data</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">Placa</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">Veículo</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">Motorista</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">Depto.</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">Destino</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">Finalidade</th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground whitespace-nowrap">KM Ini.</th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground whitespace-nowrap">KM Fin.</th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground whitespace-nowrap">KM Perc.</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">Combust.</th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground whitespace-nowrap">Litros</th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground whitespace-nowrap">R$/L</th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground whitespace-nowrap">Total</th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground whitespace-nowrap">KM/L</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">Posto</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">Obs.</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={18} className="px-3 py-8 text-center text-muted-foreground">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
                      Carregando...
                    </td>
                  </tr>
                ) : (registros?.length ?? 0) === 0 ? (
                  <tr>
                    <td colSpan={18} className="px-3 py-8 text-center text-muted-foreground">
                      Nenhum registro encontrado
                    </td>
                  </tr>
                ) : (
                  (registros ?? [])?.map?.((r: Registro, idx: number) => (
                    <tr key={r?.id ?? idx} className="border-t hover:bg-muted/30 transition-colors">
                      <td className="px-3 py-2 font-mono text-xs">{r?.numero ?? '-'}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{formatDate(r?.data ?? '')}</td>
                      <td className="px-3 py-2 font-mono font-semibold whitespace-nowrap">{r?.placa ?? '-'}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{r?.veiculo ?? '-'}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{r?.motorista ?? '-'}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{r?.departamento ?? '-'}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{r?.destino ?? '-'}</td>
                      <td className="px-3 py-2 max-w-[150px] truncate">{r?.finalidade ?? '-'}</td>
                      <td className="px-3 py-2 text-right font-mono">{formatNumber(r?.kmInicial, 0)}</td>
                      <td className="px-3 py-2 text-right font-mono">{formatNumber(r?.kmFinal, 0)}</td>
                      <td className="px-3 py-2 text-right font-mono font-semibold text-primary">{formatNumber(r?.kmPercorrido, 0)}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{r?.combustivel ?? '-'}</td>
                      <td className="px-3 py-2 text-right font-mono">{formatNumber(r?.litros, 1)}</td>
                      <td className="px-3 py-2 text-right font-mono">{formatCurrency(r?.valorLitro)}</td>
                      <td className="px-3 py-2 text-right font-mono font-semibold">{formatCurrency(r?.valorTotal)}</td>
                      <td className="px-3 py-2 text-right font-mono">{formatNumber(r?.kmLitro, 1)}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{r?.posto ?? '-'}</td>
                      <td className="px-3 py-2 max-w-[120px] truncate text-xs text-muted-foreground" title={r?.observacoes ?? ''}>{r?.observacoes ?? '-'}</td>
                    </tr>
                  )) ?? []
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {(totalPages ?? 1) > 1 && (
            <div className="flex items-center justify-between mt-4">
              <span className="text-xs text-muted-foreground">
                Página {page ?? 1} de {totalPages ?? 1} ({total ?? 0} registros)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={(page ?? 1) <= 1}
                  onClick={() => setPage(prev => Math.max(1, (prev ?? 1) - 1))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={(page ?? 1) >= (totalPages ?? 1)}
                  onClick={() => setPage(prev => Math.min(totalPages ?? 1, (prev ?? 1) + 1))}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
