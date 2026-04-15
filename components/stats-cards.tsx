'use client'

import { useEffect, useState, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Route, Fuel, DollarSign, Gauge, FileText } from 'lucide-react'
import { motion, useInView } from 'framer-motion'

interface Stats {
  totalRegistros: number
  totalKm: number
  totalLitros: number
  totalGasto: number
  mediaKmLitro: number
}

function AnimatedNumber({ value, prefix = '', suffix = '', decimals = 0 }: { value: number; prefix?: string; suffix?: string; decimals?: number }) {
  const [displayed, setDisplayed] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return
    const safeValue = value ?? 0
    const duration = 1000
    const steps = 40
    const increment = safeValue / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= safeValue) {
        current = safeValue
        clearInterval(timer)
      }
      setDisplayed(current)
    }, duration / steps)
    return () => clearInterval(timer)
  }, [value, isInView])

  return (
    <span ref={ref} className="font-mono text-2xl font-bold tracking-tight">
      {prefix}{displayed?.toFixed?.(decimals) ?? '0'}{suffix}
    </span>
  )
}

export function StatsCards() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    fetch('/api/registros/stats')
      .then(r => r?.json?.())
      .then(d => setStats(d ?? null))
      .catch(() => {})
  }, [])

  const items = [
    { label: 'Registros', value: stats?.totalRegistros ?? 0, icon: FileText, prefix: '', suffix: '', decimals: 0 },
    { label: 'KM Total', value: stats?.totalKm ?? 0, icon: Route, prefix: '', suffix: ' km', decimals: 0 },
    { label: 'Litros', value: stats?.totalLitros ?? 0, icon: Fuel, prefix: '', suffix: ' L', decimals: 1 },
    { label: 'Gasto Total', value: stats?.totalGasto ?? 0, icon: DollarSign, prefix: 'R$ ', suffix: '', decimals: 2 },
    { label: 'Média KM/L', value: stats?.mediaKmLitro ?? 0, icon: Gauge, prefix: '', suffix: ' km/L', decimals: 1 },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {items?.map?.((item: any, i: number) => (
        <motion.div
          key={item?.label ?? i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                {item?.icon && <item.icon className="w-4 h-4 text-primary" />}
                <span className="text-xs text-muted-foreground">{item?.label ?? ''}</span>
              </div>
              <AnimatedNumber
                value={item?.value ?? 0}
                prefix={item?.prefix ?? ''}
                suffix={item?.suffix ?? ''}
                decimals={item?.decimals ?? 0}
              />
            </CardContent>
          </Card>
        </motion.div>
      )) ?? []}
    </div>
  )
}
