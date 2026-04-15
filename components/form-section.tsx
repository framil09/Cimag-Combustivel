'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PlusCircle, Loader2, CheckCircle2, Car, User, MapPin, Building2, Fuel, FileText, Gauge } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

const VEICULOS = ['FIAT FASTBACK', 'POLO TRACK', 'MONTANA']
const PLACAS = ['TYW5H46', 'TYW5I45']
const COMBUSTIVEIS = ['Gasolina', 'Gasolina Aditivada', 'Etanol', 'Diesel', 'Diesel S-10', 'GNV']

interface FormData {
  data: string
  placa: string
  veiculo: string
  motorista: string
  departamento: string
  destino: string
  finalidade: string
  kmInicial: string
  kmFinal: string
  combustivel: string
  litros: string
  valorLitro: string
  posto: string
  observacoes: string
}

const emptyForm: FormData = {
  data: '',
  placa: '',
  veiculo: '',
  motorista: '',
  departamento: '',
  destino: '',
  finalidade: '',
  kmInicial: '',
  kmFinal: '',
  combustivel: '',
  litros: '',
  valorLitro: '',
  posto: '',
  observacoes: '',
}

export function FormSection() {
  const [form, setForm] = useState<FormData>({ ...emptyForm })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [isOpen, setIsOpen] = useState(true)

  const update = useCallback((field: keyof FormData, value: string) => {
    setForm(prev => ({ ...(prev ?? {}), [field]: value }))
  }, [])

  const kmPercorrido = (() => {
    const ini = parseFloat(form?.kmInicial ?? '0') || 0
    const fin = parseFloat(form?.kmFinal ?? '0') || 0
    return fin > ini ? fin - ini : 0
  })()

  const valorTotal = (() => {
    const l = parseFloat(form?.litros ?? '0') || 0
    const v = parseFloat(form?.valorLitro ?? '0') || 0
    return l * v
  })()

  const kmLitro = (() => {
    const l = parseFloat(form?.litros ?? '0') || 0
    return l > 0 ? kmPercorrido / l : 0
  })()

  const handleSubmit = async (e: React.FormEvent) => {
    e?.preventDefault?.()
    if (!form?.data || !form?.placa || !form?.veiculo || !form?.motorista || !form?.departamento || !form?.destino || !form?.finalidade || !form?.kmInicial || !form?.kmFinal || !form?.combustivel) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/registros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form ?? {}),
      })
      const data = await res?.json?.()
      if (!res?.ok) {
        toast.error(data?.error ?? 'Erro ao salvar registro')
        return
      }
      toast.success('Registro adicionado com sucesso!')
      setForm({ ...emptyForm })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      window?.dispatchEvent?.(new CustomEvent('registro-added'))
    } catch (err: any) {
      console.error(err)
      toast.error('Erro de conexão. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
      <Card>
        <CardHeader
          className="cursor-pointer select-none"
          onClick={() => setIsOpen(prev => !prev)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-primary" />
              <CardTitle className="font-display text-xl">Novo Registro</CardTitle>
            </div>
            <span className="text-xs text-muted-foreground">{isOpen ? 'Recolher' : 'Expandir'}</span>
          </div>
        </CardHeader>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: 'hidden' }}
            >
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Row 1: Data, Placa, Veículo */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="data" className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" /> Data *
                      </Label>
                      <Input
                        id="data"
                        type="date"
                        value={form?.data ?? ''}
                        onChange={(e: any) => update('data', e?.target?.value ?? '')}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="placa" className="flex items-center gap-1.5">
                        <Car className="w-3.5 h-3.5" /> Placa *
                      </Label>
                      <select
                        id="placa"
                        value={form?.placa ?? ''}
                        onChange={(e: any) => update('placa', e?.target?.value ?? '')}
                        required
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <option value="">Selecione a placa</option>
                        {PLACAS.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="veiculo" className="flex items-center gap-1.5">
                        <Car className="w-3.5 h-3.5" /> Veículo *
                      </Label>
                      <select
                        id="veiculo"
                        value={form?.veiculo ?? ''}
                        onChange={(e: any) => update('veiculo', e?.target?.value ?? '')}
                        required
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <option value="">Selecione o veículo</option>
                        {VEICULOS.map((v) => (
                          <option key={v} value={v}>{v}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Row 2: Motorista, Departamento */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="motorista" className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" /> Motorista *
                      </Label>
                      <Input
                        id="motorista"
                        placeholder="Nome do motorista"
                        value={form?.motorista ?? ''}
                        onChange={(e: any) => update('motorista', e?.target?.value ?? '')}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="departamento" className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5" /> Departamento *
                      </Label>
                      <Input
                        id="departamento"
                        placeholder="Ex: Administrativo"
                        value={form?.departamento ?? ''}
                        onChange={(e: any) => update('departamento', e?.target?.value ?? '')}
                        required
                      />
                    </div>
                  </div>

                  {/* Row 3: Destino, Finalidade */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="destino" className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" /> Destino *
                      </Label>
                      <Input
                        id="destino"
                        placeholder="Cidade / Local"
                        value={form?.destino ?? ''}
                        onChange={(e: any) => update('destino', e?.target?.value ?? '')}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="finalidade" className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" /> Finalidade *
                      </Label>
                      <Input
                        id="finalidade"
                        placeholder="Motivo da viagem"
                        value={form?.finalidade ?? ''}
                        onChange={(e: any) => update('finalidade', e?.target?.value ?? '')}
                        required
                      />
                    </div>
                  </div>

                  {/* Row 4: KM Inicial, KM Final, KM Percorrido */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="kmInicial" className="flex items-center gap-1.5">
                        <Gauge className="w-3.5 h-3.5" /> KM Inicial *
                      </Label>
                      <Input
                        id="kmInicial"
                        type="number"
                        step="0.1"
                        placeholder="0"
                        value={form?.kmInicial ?? ''}
                        onChange={(e: any) => update('kmInicial', e?.target?.value ?? '')}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="kmFinal" className="flex items-center gap-1.5">
                        <Gauge className="w-3.5 h-3.5" /> KM Final *
                      </Label>
                      <Input
                        id="kmFinal"
                        type="number"
                        step="0.1"
                        placeholder="0"
                        value={form?.kmFinal ?? ''}
                        onChange={(e: any) => update('kmFinal', e?.target?.value ?? '')}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1.5">
                        <Gauge className="w-3.5 h-3.5 text-primary" /> KM Percorrido
                      </Label>
                      <div className="h-10 px-3 flex items-center rounded-md border bg-muted/50 font-mono text-sm">
                        {kmPercorrido?.toFixed?.(1) ?? '0.0'} km
                      </div>
                    </div>
                  </div>

                  {/* Row 5: Combustível, Litros, Valor/Litro */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="combustivel" className="flex items-center gap-1.5">
                        <Fuel className="w-3.5 h-3.5" /> Combustível *
                      </Label>
                      <select
                        id="combustivel"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={form?.combustivel ?? ''}
                        onChange={(e: any) => update('combustivel', e?.target?.value ?? '')}
                        required
                      >
                        <option value="">Selecione...</option>
                        {COMBUSTIVEIS?.map?.((c: string) => (
                          <option key={c} value={c}>{c}</option>
                        )) ?? []}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="litros" className="flex items-center gap-1.5">
                        <Fuel className="w-3.5 h-3.5" /> Litros
                      </Label>
                      <Input
                        id="litros"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={form?.litros ?? ''}
                        onChange={(e: any) => update('litros', e?.target?.value ?? '')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="valorLitro" className="flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5" /> Valor/Litro (R$)
                      </Label>
                      <Input
                        id="valorLitro"
                        type="number"
                        step="0.001"
                        placeholder="0.000"
                        value={form?.valorLitro ?? ''}
                        onChange={(e: any) => update('valorLitro', e?.target?.value ?? '')}
                      />
                    </div>
                  </div>

                  {/* Row 6: Valor Total, KM/Litro, Posto */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-primary" /> Valor Total
                      </Label>
                      <div className="h-10 px-3 flex items-center rounded-md border bg-muted/50 font-mono text-sm">
                        R$ {valorTotal?.toFixed?.(2) ?? '0.00'}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1.5">
                        <Gauge className="w-3.5 h-3.5 text-primary" /> KM/Litro
                      </Label>
                      <div className="h-10 px-3 flex items-center rounded-md border bg-muted/50 font-mono text-sm">
                        {kmLitro?.toFixed?.(1) ?? '0.0'} km/L
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="posto" className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" /> Posto
                      </Label>
                      <Input
                        id="posto"
                        placeholder="Nome do posto"
                        value={form?.posto ?? ''}
                        onChange={(e: any) => update('posto', e?.target?.value ?? '')}
                      />
                    </div>
                  </div>

                  {/* Row 7: Observações */}
                  <div className="space-y-2">
                    <Label htmlFor="observacoes" className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" /> Observações
                    </Label>
                    <textarea
                      id="observacoes"
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
                      placeholder="Informações adicionais..."
                      value={form?.observacoes ?? ''}
                      onChange={(e: any) => update('observacoes', e?.target?.value ?? '')}
                    />
                  </div>

                  {/* Submit */}
                  <div className="flex items-center gap-3">
                    <Button type="submit" disabled={submitting} className="gap-2">
                      {submitting ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</>
                      ) : success ? (
                        <><CheckCircle2 className="w-4 h-4" /> Salvo!</>
                      ) : (
                        <><PlusCircle className="w-4 h-4" /> Adicionar Registro</>
                      )}
                    </Button>
                    <span className="text-xs text-muted-foreground">* Campos obrigatórios</span>
                  </div>
                </form>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  )
}

function DollarSign({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="12" y1="1" x2="12" y2="23"></line>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
    </svg>
  )
}
