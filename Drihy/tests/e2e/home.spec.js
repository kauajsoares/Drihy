const { test, expect } = require('@playwright/test');

// Ensure a static server is running on port 3000 (see tests/e2e/README.md)

test('homepage loads and has expected title and header', async ({ page }) => {
  await page.goto('http://localhost:3000/index.html');
  await expect(page).toHaveTitle('shop');
  const logo = page.locator('header .logo img');
  await expect(logo).toHaveCount(1);
});
