'use client'

import { Fuel, LogOut, Settings } from 'lucide-react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function Header() {
  const { data: session } = useSession()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-gradient-to-r from-[#0D3640] via-[#1B4D5C] to-[#2A7A8A] shadow-lg">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex items-center h-16 gap-3">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="flex items-center justify-center w-10 h-10 rounded-lg overflow-hidden bg-white/10 backdrop-blur-sm"
        >
          <div className="relative w-9 h-9">
            <Image
              src="/logo-cimag.png"
              alt="Logo CIMAG - Consórcio Intermunicipal"
              fill
              className="object-contain"
              priority
            />
          </div>
        </motion.div>
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-lg sm:text-xl font-bold tracking-tight truncate text-white">
            CIMAG - Controle de KM e Combustível
          </h1>
          <p className="text-xs text-white/70 hidden sm:block">
            Consórcio Público Intermunicipal Multifinalitário da AMAG
          </p>
        </div>
        <div className="flex items-center gap-2">
          {session?.user?.role === 'admin' && (
            <Link href="/admin/users">
              <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10">
                <Settings className="w-4 h-4 mr-1.5" />
                <span className="hidden sm:inline">Usuários</span>
              </Button>
            </Link>
          )}
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-white/80 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <Fuel className="w-3.5 h-3.5" />
            <span>{session?.user?.name || 'Combustível'}</span>
          </div>
          {session && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="text-white/70 hover:text-white hover:bg-white/10"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
