import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL: "http://127.0.0.1:5173",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    ...(process.env.CI
      ? []
      : [
          {
            command:
              "cd ../backend && APP_ENV=dev composer db:migrate && APP_ENV=dev composer db:fixtures && APP_ENV=dev composer serve",
            url: "http://127.0.0.1:8000/api/event-types",
            timeout: 60000,
          },
        ]),
    {
      command: "npm run dev",
      url: "http://127.0.0.1:5173",
    },
  ],
});
