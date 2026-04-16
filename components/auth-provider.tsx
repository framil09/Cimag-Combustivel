'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'

interface SessionUser {
  id: string
  name: string
  email: string
  role: string
}

interface SessionContextType {
  user: SessionUser | null
  status: 'loading' | 'authenticated' | 'unauthenticated'
  refresh: () => Promise<void>
}

const SessionContext = createContext<SessionContextType>({
  user: null,
  status: 'loading',
  refresh: async () => {},
})

export function useSession() {
  return useContext(SessionContext)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading')

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/session')
      const data = await res.json()
      if (data.user) {
        setUser(data.user)
        setStatus('authenticated')
      } else {
        setUser(null)
        setStatus('unauthenticated')
      }
    } catch {
      setUser(null)
      setStatus('unauthenticated')
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return (
    <SessionContext.Provider value={{ user, status, refresh }}>
      {children}
    </SessionContext.Provider>
  )
}
