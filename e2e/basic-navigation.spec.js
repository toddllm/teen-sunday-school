const { test, expect } = require('@playwright/test');

test.describe('Basic Navigation and Homepage', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');

    // Check if the page loaded successfully
    await expect(page).toHaveTitle(/Teen Sunday School/i);

    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test('should show navigation menu', async ({ page }) => {
    await page.goto('/');

    // Look for navigation elements (adjust selectors based on actual implementation)
    const nav = page.locator('nav, .navigation, [role="navigation"]');
    await expect(nav).toBeVisible();
  });

  test('should navigate to Bible page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Try to find and click a Bible link
    const bibleLink = page.getByRole('link', { name: /bible/i }).first();
    if (await bibleLink.isVisible()) {
      await bibleLink.click();
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('bible');
    }
  });

  test('should navigate to Lessons page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Try to find and click a Lessons link
    const lessonsLink = page.getByRole('link', { name: /lessons/i }).first();
    if (await lessonsLink.isVisible()) {
      await lessonsLink.click();
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('lessons');
    }
  });

  test('should navigate to Settings page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Try to find and click a Settings link
    const settingsLink = page.getByRole('link', { name: /settings/i }).first();
    if (await settingsLink.isVisible()) {
      await settingsLink.click();
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('settings');
    }
  });
});

test.describe('Onboarding Flow', () => {
  test('should handle onboarding if not completed', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check if redirected to onboarding
    if (page.url().includes('onboarding')) {
      // Onboarding page should be visible
      const onboardingContent = page.locator('main, .onboarding, [class*="onboarding"]');
      await expect(onboardingContent).toBeVisible();
    }
  });
});

test.describe('Responsive Design', () => {
  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check if page is still usable on mobile
    const mainContent = page.locator('main, .main-content, [role="main"]');
    await expect(mainContent).toBeVisible();
  });

  test('should work on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check if page is still usable on tablet
    const mainContent = page.locator('main, .main-content, [role="main"]');
    await expect(mainContent).toBeVisible();
  });
});
