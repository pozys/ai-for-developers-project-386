import { expect, test } from '@playwright/test'

import {
  createEventTypeAndGetId,
  fillBookingForm,
  makeUniqueValue,
  selectBookingDate,
  selectFirstAvailableSlot,
} from './helpers'

test.describe('Публичное бронирование', () => {
  test('проходит полный happy-path бронирования', async ({ page }) => {
    const guestName = makeUniqueValue('Guest')
    const guestEmail = `guest-${Date.now().toString(36)}@example.com`
    const comment = makeUniqueValue('Комментарий')
    const eventTypeId = await createEventTypeAndGetId(page, {
      name: makeUniqueValue('E2E public booking'),
      description: makeUniqueValue('Booking event type'),
      durationMinutes: 30,
    })

    await page.goto(`/event-types/${eventTypeId}/book`)
    await expect(page).toHaveURL(new RegExp(`/event-types/${eventTypeId}/book`))

    await selectBookingDate(page, 0)
    await selectFirstAvailableSlot(page)
    await fillBookingForm(page, {
      guestName,
      guestEmail,
      comment,
    })

    await page.getByRole('button', { name: 'Подтвердить запись' }).click()

    await expect(page.getByRole('heading', { name: 'Запись подтверждена' })).toBeVisible()
    await expect(page.getByText(guestName)).toBeVisible()
    await expect(page.getByText(guestEmail)).toBeVisible()
    await expect(page.getByText(comment)).toBeVisible()
  })

  test('не дает подтвердить уже занятый слот', async ({ browser }) => {
    const context = await browser.newContext()
    const firstPage = await context.newPage()
    const secondPage = await context.newPage()

    const firstGuestName = makeUniqueValue('Guest 1')
    const secondGuestName = makeUniqueValue('Guest 2')
    const firstGuestEmail = `guest-1-${Date.now().toString(36)}@example.com`
    const secondGuestEmail = `guest-2-${Date.now().toString(36)}@example.com`
    const eventTypeId = await createEventTypeAndGetId(firstPage, {
      name: makeUniqueValue('E2E duplicate booking'),
      description: makeUniqueValue('Booking event type'),
      durationMinutes: 30,
    })

    await firstPage.goto(`/event-types/${eventTypeId}/book`)
    await expect(firstPage).toHaveURL(new RegExp(`/event-types/${eventTypeId}/book`))

    await secondPage.goto(`/event-types/${eventTypeId}/book`)

    await selectBookingDate(firstPage, 1)
    await selectBookingDate(secondPage, 1)
    await selectFirstAvailableSlot(firstPage)
    await selectFirstAvailableSlot(secondPage)

    await fillBookingForm(firstPage, {
      guestName: firstGuestName,
      guestEmail: firstGuestEmail,
    })
    await fillBookingForm(secondPage, {
      guestName: secondGuestName,
      guestEmail: secondGuestEmail,
    })

    await firstPage.getByRole('button', { name: 'Подтвердить запись' }).click()
    await expect(firstPage.getByRole('heading', { name: 'Запись подтверждена' })).toBeVisible()

    await secondPage.getByRole('button', { name: 'Подтвердить запись' }).click()

    await expect(secondPage.getByText('Это время уже забронировано')).toBeVisible()

    await context.close()
  })

  test('показывает клиентскую валидацию формы бронирования', async ({ page }) => {
    const eventTypeId = await createEventTypeAndGetId(page, {
      name: makeUniqueValue('E2E validation booking'),
      description: makeUniqueValue('Booking event type'),
      durationMinutes: 30,
    })

    await page.goto(`/event-types/${eventTypeId}/book`)
    await expect(page).toHaveURL(new RegExp(`/event-types/${eventTypeId}/book`))

    await selectBookingDate(page, 2)
    await selectFirstAvailableSlot(page)
    await page.getByRole('button', { name: 'Подтвердить запись' }).click()

    await expect(page.getByText('Введите имя')).toBeVisible()
    await expect(page.getByText('Введите корректный email')).toBeVisible()
  })
})
