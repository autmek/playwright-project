const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './StoreFrog_App',
  timeout: 5 * 60 * 1000,
  expect: { timeout: 15 * 1000 },

  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 1,
  workers: 4,
  reporter: [
    ['list'],
    ['html'],
    //['allure-playwright'],
  ],

  projects: [
    {
      name: 'chromium', // Name of the project
      use: {
        browserName: 'chromium',
        headless: true, 
        userAgent: 'Chrome/131.0.6778.109',
        trace: 'on',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        viewport: { width: 1280, height: 720 },
      },
    },
  ],
});
