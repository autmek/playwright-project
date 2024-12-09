const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './StoreFrog_App',
  timeout: 5 * 60 * 1000,
  expect: { timeout: 15 * 1000 },

  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 1,
  workers: 1,
  reporter: [
    ['list'],
    ['html'],
    // ['allure-playwright']
  ],

  projects: [
    {
      name: 'chromium', // Name of the project
      use: {
        browserName: 'chromium',
        headless: false, 
        args: ['--start-minimized'], // Optional args for Chromium
        trace: 'on',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        viewport: { width: 1280, height: 720 },
      },
    },
  ],
});
