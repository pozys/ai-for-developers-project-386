import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

function getRouteErrorMessage(error: unknown) {
  if (isRouteErrorResponse(error)) {
    if (typeof error.data === 'string' && error.data.trim()) {
      return error.data
    }

    if (
      typeof error.data === 'object'
      && error.data !== null
      && 'message' in error.data
      && typeof error.data.message === 'string'
    ) {
      return error.data.message
    }

    return error.statusText || `Ошибка маршрута (${error.status})`
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return 'Во время открытия страницы произошла непредвиденная ошибка.'
}

export default function RouteErrorPage() {
  const navigate = useNavigate()
  const error = useRouteError()
  const errorMessage = getRouteErrorMessage(error)

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <section className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">Что-то пошло не так</h1>
        <p className="text-muted-foreground">
          Приложение не смогло отрисовать текущий экран. Вернитесь назад или откройте устойчивый
          маршрут.
        </p>
      </section>

      <Alert variant="destructive">
        <AlertTitle>Ошибка маршрута</AlertTitle>
        <AlertDescription>{errorMessage}</AlertDescription>
      </Alert>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="button" variant="outline" className="sm:flex-1" onClick={() => navigate(-1)}>
          Назад
        </Button>
        <Button type="button" className="sm:flex-1" onClick={() => navigate('/')}>
          На главную
        </Button>
      </div>
    </div>
  )
}
