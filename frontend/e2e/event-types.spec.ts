import { test, expect } from "@playwright/test";

/**
 * Story 2: Просмотр страницы с типами событий (гость)
 *
 * Гость выбирает тип события и переходит к бронированию.
 */
test.describe("Публичная страница типов событий", () => {
  test('клик "Выбрать время" переходит на страницу бронирования', async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Выбрать время" }).first().click();
    await expect(page).toHaveURL(/\/event-types\/.+\/book/);
  });
});
