import type { Page } from '@playwright/test'

const MOSCOW_TIME_ZONE = 'Europe/Moscow'

function getDateKeyParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)

  return {
    year: parts.find(({ type }) => type === 'year')?.value ?? '1970',
    month: parts.find(({ type }) => type === 'month')?.value ?? '01',
    day: parts.find(({ type }) => type === 'day')?.value ?? '01',
  }
}

function formatDateKey(date: Date) {
  return new Date(date).toISOString().slice(0, 10)
}

function getUtcDateFromDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number)

  return new Date(Date.UTC(year, month - 1, day))
}

function addDays(date: Date, days: number) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + days))
}

function isWeekdayDateKey(dateKey: string) {
  const dayOfWeek = getUtcDateFromDateKey(dateKey).getUTCDay()

  return dayOfWeek >= 1 && dayOfWeek <= 5
}

export function getMoscowDateKey(now = new Date()) {
  const { year, month, day } = getDateKeyParts(now, MOSCOW_TIME_ZONE)

  return `${year}-${month}-${day}`
}

export function getSelectableDateKey(offsetWeekdays = 0, now = new Date()) {
  let currentDate = getUtcDateFromDateKey(getMoscowDateKey(now))

  while (!isWeekdayDateKey(formatDateKey(currentDate))) {
    currentDate = addDays(currentDate, 1)
  }

  let remainingWeekdays = offsetWeekdays

  while (remainingWeekdays > 0) {
    currentDate = addDays(currentDate, 1)

    if (isWeekdayDateKey(formatDateKey(currentDate))) {
      remainingWeekdays -= 1
    }
  }

  return formatDateKey(currentDate)
}

export function formatCalendarDayLabel(dateKey: string) {
  return new Intl.DateTimeFormat('ru-RU', {
    timeZone: 'UTC',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(getUtcDateFromDateKey(dateKey))
}

export function makeUniqueValue(prefix: string) {
  return `${prefix} ${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export async function selectBookingDate(page: Page, offsetWeekdays: number) {
  const dateKey = getSelectableDateKey(offsetWeekdays)
  await page.getByRole('button', { name: formatCalendarDayLabel(dateKey) }).click()

  return dateKey
}

export async function selectFirstAvailableSlot(page: Page) {
  const slotButton = page.getByRole('button', { name: /^Выбрать слот / }).first()

  await slotButton.click()

  return slotButton
}

export async function fillBookingForm(
  page: Page,
  values: {
    guestName: string
    guestEmail: string
    comment?: string
  },
) {
  await page.getByLabel('Имя').fill(values.guestName)
  await page.getByLabel('Email').fill(values.guestEmail)

  if (values.comment !== undefined) {
    await page.getByLabel('Комментарий').fill(values.comment)
  }
}

export async function createEventTypeAndGetId(
  page: Page,
  values: {
    name: string
    description: string
    durationMinutes: number
  },
) {
  const responsePromise = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' && response.url().endsWith('/api/admin/event-types'),
  )

  await page.goto('/admin/event-types/new')
  await page.getByLabel('Название').fill(values.name)
  await page.getByLabel('Описание').fill(values.description)
  await page.getByLabel('Длительность, минут').fill(values.durationMinutes.toString())
  await page.getByRole('button', { name: 'Создать тип события' }).click()

  const response = await responsePromise
  const createdEventType = (await response.json()) as { id: string }

  return createdEventType.id
}
