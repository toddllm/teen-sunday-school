const { test, expect } = require('@playwright/test');

test.describe('Lessons Features', () => {
  test('should access lessons page', async ({ page }) => {
    await page.goto('/lessons');
    await page.waitForLoadState('networkidle');

    const lessonsContent = page.locator('main');
    await expect(lessonsContent).toBeVisible();
  });

  test('should display lesson list or empty state', async ({ page }) => {
    await page.goto('/lessons');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Either lessons are displayed or there's an empty state message
    const hasLessons = await page.locator('[class*="lesson"], .lesson-card, .lesson-item').count() > 0;
    const hasEmptyState = await page.locator('text=/no lessons/i, text=/empty/i, text=/create/i').isVisible();

    expect(hasLessons || hasEmptyState).toBeTruthy();
  });

  test('should have devotionals page', async ({ page }) => {
    await page.goto('/devotionals');
    await page.waitForLoadState('networkidle');

    const devotionalsContent = page.locator('main');
    await expect(devotionalsContent).toBeVisible();
  });
});

test.describe('Today Page', () => {
  test('should access today page', async ({ page }) => {
    await page.goto('/today');
    await page.waitForLoadState('networkidle');

    const todayContent = page.locator('main');
    await expect(todayContent).toBeVisible();
  });
});

test.describe('Series and Topics', () => {
  test('should access series browse page', async ({ page }) => {
    await page.goto('/series');
    await page.waitForLoadState('networkidle');

    const seriesContent = page.locator('main');
    await expect(seriesContent).toBeVisible();
  });

  test('should access topics page', async ({ page }) => {
    await page.goto('/topics');
    await page.waitForLoadState('networkidle');

    const topicsContent = page.locator('main');
    await expect(topicsContent).toBeVisible();
  });

  test('should access events page', async ({ page }) => {
    await page.goto('/events');
    await page.waitForLoadState('networkidle');

    const eventsContent = page.locator('main');
    await expect(eventsContent).toBeVisible();
  });
});

test.describe('Progress Tracking', () => {
  test('should access progress page', async ({ page }) => {
    await page.goto('/progress');
    await page.waitForLoadState('networkidle');

    const progressContent = page.locator('main');
    await expect(progressContent).toBeVisible();
  });

  test('should access goals page', async ({ page }) => {
    await page.goto('/goals');
    await page.waitForLoadState('networkidle');

    const goalsContent = page.locator('main');
    await expect(goalsContent).toBeVisible();
  });

  test('should access badges page', async ({ page }) => {
    await page.goto('/badges');
    await page.waitForLoadState('networkidle');

    const badgesContent = page.locator('main');
    await expect(badgesContent).toBeVisible();
  });
});
