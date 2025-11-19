const { test, expect } = require('@playwright/test');

test.describe('Games and Interactive Features', () => {
  test('should access challenges page', async ({ page }) => {
    await page.goto('/challenges');
    await page.waitForLoadState('networkidle');

    const challengesContent = page.locator('main');
    await expect(challengesContent).toBeVisible();
  });

  test('should access scavenger hunt', async ({ page }) => {
    await page.goto('/scavenger-hunt');
    await page.waitForLoadState('networkidle');

    const huntContent = page.locator('main');
    await expect(huntContent).toBeVisible();
  });

  test('should access find the reference game', async ({ page }) => {
    await page.goto('/bible/find-reference');
    await page.waitForLoadState('networkidle');

    const gameContent = page.locator('main');
    await expect(gameContent).toBeVisible();
  });

  test('should access question box', async ({ page }) => {
    await page.goto('/questions');
    await page.waitForLoadState('networkidle');

    const questionContent = page.locator('main');
    await expect(questionContent).toBeVisible();
  });
});

test.describe('Creative Tools', () => {
  test('should access meme generator', async ({ page }) => {
    await page.goto('/bible/meme-generator');
    await page.waitForLoadState('networkidle');

    const memeContent = page.locator('main');
    await expect(memeContent).toBeVisible();
  });

  test('should access quote image generator', async ({ page }) => {
    await page.goto('/bible/quote-generator');
    await page.waitForLoadState('networkidle');

    const quoteContent = page.locator('main');
    await expect(quoteContent).toBeVisible();
  });

  test('should access comic generator', async ({ page }) => {
    await page.goto('/bible/comic-generator');
    await page.waitForLoadState('networkidle');

    const comicContent = page.locator('main');
    await expect(comicContent).toBeVisible();
  });
});

test.describe('Prayer and Reflection', () => {
  test('should access prayer list', async ({ page }) => {
    await page.goto('/prayer');
    await page.waitForLoadState('networkidle');

    const prayerContent = page.locator('main');
    await expect(prayerContent).toBeVisible();
  });

  test('should access reflections page', async ({ page }) => {
    await page.goto('/reflections');
    await page.waitForLoadState('networkidle');

    const reflectionsContent = page.locator('main');
    await expect(reflectionsContent).toBeVisible();
  });

  test('should access gratitude log', async ({ page }) => {
    await page.goto('/gratitude');
    await page.waitForLoadState('networkidle');

    const gratitudeContent = page.locator('main');
    await expect(gratitudeContent).toBeVisible();
  });
});

test.describe('Settings and Preferences', () => {
  test('should access main settings page', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    const settingsContent = page.locator('main');
    await expect(settingsContent).toBeVisible();
  });

  test('should access accessibility settings', async ({ page }) => {
    await page.goto('/settings/accessibility');
    await page.waitForLoadState('networkidle');

    const accessibilityContent = page.locator('main');
    await expect(accessibilityContent).toBeVisible();
  });

  test('should access translation settings', async ({ page }) => {
    await page.goto('/settings/translations');
    await page.waitForLoadState('networkidle');

    const translationContent = page.locator('main');
    await expect(translationContent).toBeVisible();
  });

  test('should access profile settings', async ({ page }) => {
    await page.goto('/settings/profile');
    await page.waitForLoadState('networkidle');

    const profileContent = page.locator('main');
    await expect(profileContent).toBeVisible();
  });

  test('should access reading preferences', async ({ page }) => {
    await page.goto('/settings/reading');
    await page.waitForLoadState('networkidle');

    const readingContent = page.locator('main');
    await expect(readingContent).toBeVisible();
  });
});

test.describe('Kids Mode', () => {
  test('should access kids home page', async ({ page }) => {
    await page.goto('/kids');
    await page.waitForLoadState('networkidle');

    const kidsContent = page.locator('main');
    await expect(kidsContent).toBeVisible();
  });

  test('should access kids all stories', async ({ page }) => {
    await page.goto('/kids/all-stories');
    await page.waitForLoadState('networkidle');

    const storiesContent = page.locator('main');
    await expect(storiesContent).toBeVisible();
  });

  test('should access kids songs', async ({ page }) => {
    await page.goto('/kids/songs');
    await page.waitForLoadState('networkidle');

    const songsContent = page.locator('main');
    await expect(songsContent).toBeVisible();
  });

  test('should access kids progress', async ({ page }) => {
    await page.goto('/kids/progress');
    await page.waitForLoadState('networkidle');

    const progressContent = page.locator('main');
    await expect(progressContent).toBeVisible();
  });
});
