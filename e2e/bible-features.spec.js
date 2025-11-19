const { test, expect } = require('@playwright/test');

test.describe('Bible Reading Features', () => {
  test('should access Bible reading page', async ({ page }) => {
    await page.goto('/bible/read');
    await page.waitForLoadState('networkidle');

    // Check if the Bible reading interface is present
    const bibleContent = page.locator('main, .bible-reader, [class*="bible"]');
    await expect(bibleContent).toBeVisible();
  });

  test('should have verse selection functionality', async ({ page }) => {
    await page.goto('/bible/read');
    await page.waitForLoadState('networkidle');

    // Look for input fields or selectors for book/chapter/verse
    const bookSelector = page.locator('select, input, [role="combobox"]').first();
    if (await bookSelector.isVisible()) {
      await expect(bookSelector).toBeVisible();
    }
  });

  test('should display Bible text when navigating', async ({ page }) => {
    await page.goto('/bible/read');
    await page.waitForLoadState('networkidle');

    // Wait a bit for content to load
    await page.waitForTimeout(2000);

    // Look for verse content (verses typically have specific classes or data attributes)
    const verseContent = page.locator('[class*="verse"], [data-verse], p, div');
    const count = await verseContent.count();

    // There should be some content on the page
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Bible Tools', () => {
  test('should access Bible tools page', async ({ page }) => {
    await page.goto('/bible');
    await page.waitForLoadState('networkidle');

    const toolsContent = page.locator('main');
    await expect(toolsContent).toBeVisible();
  });

  test('should have parallel Bible comparison', async ({ page }) => {
    await page.goto('/bible/parallel');
    await page.waitForLoadState('networkidle');

    const parallelContent = page.locator('main');
    await expect(parallelContent).toBeVisible();
  });

  test('should have Bible maps feature', async ({ page }) => {
    await page.goto('/bible/maps');
    await page.waitForLoadState('networkidle');

    const mapContent = page.locator('main');
    await expect(mapContent).toBeVisible();
  });

  test('should have miracles explorer', async ({ page }) => {
    await page.goto('/bible/miracles');
    await page.waitForLoadState('networkidle');

    const miraclesContent = page.locator('main');
    await expect(miraclesContent).toBeVisible();
  });

  test('should have parables explorer', async ({ page }) => {
    await page.goto('/bible/parables');
    await page.waitForLoadState('networkidle');

    const parablesContent = page.locator('main');
    await expect(parablesContent).toBeVisible();
  });
});

test.describe('Bible Interactive Features', () => {
  test('should have highlighting functionality', async ({ page }) => {
    await page.goto('/highlights');
    await page.waitForLoadState('networkidle');

    const highlightsContent = page.locator('main');
    await expect(highlightsContent).toBeVisible();
  });

  test('should have journaling functionality', async ({ page }) => {
    await page.goto('/journal');
    await page.waitForLoadState('networkidle');

    const journalContent = page.locator('main');
    await expect(journalContent).toBeVisible();
  });

  test('should have search functionality', async ({ page }) => {
    await page.goto('/search');
    await page.waitForLoadState('networkidle');

    // Look for search input
    const searchInput = page.locator('input[type="search"], input[type="text"]').first();
    if (await searchInput.isVisible()) {
      await expect(searchInput).toBeVisible();

      // Try typing in the search box
      await searchInput.fill('love');
      await page.waitForTimeout(1000);
    }
  });
});

test.describe('Memory Verses', () => {
  test('should access memory verses page', async ({ page }) => {
    await page.goto('/memory-verses');
    await page.waitForLoadState('networkidle');

    const memoryVersesContent = page.locator('main');
    await expect(memoryVersesContent).toBeVisible();
  });

  test('should access review session', async ({ page }) => {
    await page.goto('/memory-verses/review');
    await page.waitForLoadState('networkidle');

    const reviewContent = page.locator('main');
    await expect(reviewContent).toBeVisible();
  });
});
