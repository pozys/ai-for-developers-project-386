import type { ComponentProps } from 'react'
import { RouterProvider } from 'react-router'

import { appRouter } from '@/router'
import { ThemeProvider } from '@/theme/ThemeProvider'

interface AppProps {
  router?: ComponentProps<typeof RouterProvider>['router']
}

export default function App({ router = appRouter }: AppProps) {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  )
}
