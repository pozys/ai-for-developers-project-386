import type { ComponentProps } from 'react'
import { RouterProvider } from 'react-router'

import { appRouter } from '@/router'

interface AppProps {
  router?: ComponentProps<typeof RouterProvider>['router']
}

export default function App({ router = appRouter }: AppProps) {
  return <RouterProvider router={router} />
}
