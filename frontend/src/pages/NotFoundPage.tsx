import { useNavigate } from 'react-router'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from '@/components/ui/card'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <section className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">Страница не найдена</h1>
        <p className="text-muted-foreground">
          Проверьте адрес страницы или вернитесь к доступным сценариям бронирования и админки.
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardDescription>
            Запрошенный маршрут не существует или больше недоступен в текущей версии приложения.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Вы можете открыть список типов событий или перейти к управлению ими в админке.
        </CardContent>
        <CardFooter className="flex flex-col gap-3 sm:flex-row">
          <Button type="button" className="w-full sm:flex-1" onClick={() => navigate('/')}>
            К списку событий
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full sm:flex-1"
            onClick={() => navigate('/admin/event-types')}
          >
            В admin: типы событий
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
