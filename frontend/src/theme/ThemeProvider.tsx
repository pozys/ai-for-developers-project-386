import type { ReactNode } from 'react'
import { useEffect, useLayoutEffect, useState } from 'react'

import {
  applyTheme,
  getInitialTheme,
  getSystemTheme,
  resolveTheme,
  themeStorageKey,
  type ThemeMode,
} from '@/theme/theme'
import { ThemeContext } from '@/theme/themeContext'
import type { ResolvedTheme } from '@/theme/theme'

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>(() => getInitialTheme())
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(() => getSystemTheme())

  const resolvedTheme = resolveTheme(mode, systemTheme)

  useLayoutEffect(() => {
    applyTheme(resolvedTheme)
  }, [resolvedTheme])

  useEffect(() => {
    try {
      window.localStorage.setItem(themeStorageKey, mode)
    } catch {
      // Ignore storage errors and keep the in-memory selection.
    }
  }, [mode])

  useEffect(() => {
    if (mode !== 'system' || typeof window.matchMedia !== 'function') {
      return undefined
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const updateSystemTheme = () => {
      setSystemTheme(mediaQuery.matches ? 'dark' : 'light')
    }

    updateSystemTheme()
    mediaQuery.addEventListener('change', updateSystemTheme)

    return () => {
      mediaQuery.removeEventListener('change', updateSystemTheme)
    }
  }, [mode])

  return (
    <ThemeContext.Provider value={{ mode, resolvedTheme, setMode }}>
      {children}
    </ThemeContext.Provider>
  )
}
