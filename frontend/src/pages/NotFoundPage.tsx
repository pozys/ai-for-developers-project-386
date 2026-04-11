import { useNavigate } from 'react-router'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from '@/components/ui/card'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <section className="space-y-4">
        <Badge variant="secondary" className="w-fit bg-primary/10 text-primary">
          Ошибка маршрута
        </Badge>
        <h1 className="text-4xl font-semibold tracking-tight">Страница не найдена</h1>
        <p className="text-muted-foreground">
          Проверьте адрес страницы или вернитесь к доступным сценариям бронирования и админки.
        </p>
      </section>

      <Card className="border-border/70 bg-card/90">
        <CardHeader>
          <CardDescription>
            Запрошенный маршрут не существует или больше недоступен в текущей версии приложения.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Вы можете открыть список типов событий или перейти к управлению ими в админке.
        </CardContent>
        <CardFooter className="flex flex-col gap-3 sm:flex-row">
          <Button type="button" className="h-11 w-full sm:flex-1" onClick={() => navigate('/')}>
            К списку событий
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full sm:flex-1"
            onClick={() => navigate('/admin/event-types')}
          >
            В админку
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
