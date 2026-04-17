import { expect, test } from '@playwright/test'

import { makeUniqueValue } from './helpers'

test.describe('Админка типов событий', () => {
  test('создает новый тип события', async ({ page }) => {
    const name = makeUniqueValue('Я e2e тип')
    const description = makeUniqueValue('Описание e2e типа')

    await page.goto('/admin/event-types/new')
    await page.getByLabel('Название').fill(name)
    await page.getByLabel('Описание').fill(description)
    await page.getByLabel('Длительность, минут').fill('45')
    await page.getByRole('button', { name: 'Создать тип события' }).click()

    await expect(page).toHaveURL(/\/admin\/event-types$/)
    await expect(page.getByText(name)).toBeVisible()
    await expect(page.getByText(description)).toBeVisible()
  })

  test('редактирует существующий тип события', async ({ page }) => {
    const nextName = makeUniqueValue('Я обновленный тип')
    const nextDescription = makeUniqueValue('Новое описание')

    await page.goto('/admin/event-types')
    await page.getByRole('button', { name: 'Редактировать' }).first().click()

    await expect(page).toHaveURL(/\/admin\/event-types\/.+\/edit/)
    await page.getByLabel('Название').fill(nextName)
    await page.getByLabel('Описание').fill(nextDescription)
    await page.getByRole('button', { name: 'Сохранить изменения' }).click()

    await expect(page).toHaveURL(/\/admin\/event-types$/)
    await expect(page.getByText(nextName)).toBeVisible()
    await expect(page.getByText(nextDescription)).toBeVisible()
  })

  test('показывает ошибки валидации формы', async ({ page }) => {
    await page.goto('/admin/event-types/new')
    await page.getByLabel('Длительность, минут').clear()
    await page.getByRole('button', { name: 'Создать тип события' }).click()

    await expect(page.getByText('Укажите название типа события')).toBeVisible()
    await expect(page.getByText('Укажите описание типа события')).toBeVisible()
    await expect(page.getByText('Укажите длительность встречи')).toBeVisible()
    await expect(page.getByText('Проверьте форму и исправьте ошибки')).toBeVisible()
  })
})
