
const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  
  testDir: './StoreFrog_App',
  // maximum time a test can run for
  timeout : 400000,
  expect: { timeout: 30 *1000}, 

  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 1,
  workers: 1,
  reporter:[
  ['list'],
  ['html'],
  //['allure-playwright'] 
],
  
  use: 
  {
    trace: 'on',
    screenshot: 'only-on-failure',
    headless: false, // to open browser
    browserName : 'chromium',
    video: 'retain-on-failure',
    viewport: { width: 1280, height: 720 },
    },  
});

