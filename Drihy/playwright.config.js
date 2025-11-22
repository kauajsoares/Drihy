const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  timeout: 30000,
  testDir: 'tests/e2e',
  use: {
    headless: true,
    actionTimeout: 10000,
    navigationTimeout: 20000,
  },
  webServer: {
    command: 'npx http-server ./ -p 3000 -c-1',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: true,
    timeout: 120 * 1000,
  },
});
