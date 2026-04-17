import { expect, test } from '@playwright/test'

test.describe('Ошибочные сценарии', () => {
  test('показывает 404 для неизвестного маршрута', async ({ page }) => {
    await page.goto('/missing-route')

    await expect(page.getByRole('heading', { name: 'Страница не найдена' })).toBeVisible()
    await expect(page.getByText('Запрошенный маршрут не существует')).toBeVisible()
  })

  test('показывает ошибку, если тип события не найден в админском редактировании', async ({ page }) => {
    await page.goto('/admin/event-types/00000000-0000-0000-0000-000000000000/edit')

    await expect(page.getByText('Не удалось открыть тип события')).toBeVisible()
    await expect(page.getByText('Тип события не найден')).toBeVisible()
  })
})
