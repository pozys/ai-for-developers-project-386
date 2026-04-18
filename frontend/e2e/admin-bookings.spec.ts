import { expect, test } from '@playwright/test'

import {
  createEventTypeAndGetId,
  fillBookingForm,
  getE2ENow,
  makeUniqueValue,
  selectBookingDate,
  selectFirstAvailableSlot,
} from './helpers'

test.describe('Админка бронирований', () => {
  const e2eNow = getE2ENow()

  test('показывает созданную запись в списке', async ({ page }) => {
    const guestName = makeUniqueValue('Guest list')
    const guestEmail = `guest-list-${Date.now().toString(36)}@example.com`
    const comment = makeUniqueValue('Комментарий списка')
    const eventTypeId = await createEventTypeAndGetId(page, {
      name: makeUniqueValue('E2E bookings list'),
      description: makeUniqueValue('Booking event type'),
      durationMinutes: 30,
    })

    await page.goto(`/event-types/${eventTypeId}/book`)
    await selectBookingDate(page, 3, e2eNow)
    await selectFirstAvailableSlot(page)
    await fillBookingForm(page, {
      guestName,
      guestEmail,
      comment,
    })
    await page.getByRole('button', { name: 'Подтвердить запись' }).click()

    await expect(page.getByRole('heading', { name: 'Запись подтверждена' })).toBeVisible()

    await page.goto('/admin/bookings')

    await expect(page.getByText(guestName)).toBeVisible()
    await expect(page.getByText(guestEmail)).toBeVisible()
    await expect(page.getByText(comment)).toBeVisible()
  })
})
