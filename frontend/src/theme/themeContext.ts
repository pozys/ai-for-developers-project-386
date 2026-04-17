import { createContext, useContext } from 'react'

import type { ResolvedTheme, ThemeMode } from '@/theme/theme'

export interface ThemeContextValue {
  mode: ThemeMode
  resolvedTheme: ResolvedTheme
  setMode: (mode: ThemeMode) => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

export function useTheme() {
  const context = useContext(ThemeContext)

  if (context === null) {
    throw new Error('useTheme must be used within ThemeProvider')
  }

  return context
}
