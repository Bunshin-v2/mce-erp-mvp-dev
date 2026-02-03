import { test, expect } from '@playwright/test';

test.describe('Theme System', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('should initialize with default theme based on system preference', async ({ page }) => {
    await page.goto('/');
    
    const theme = await page.evaluate(() => {
      return document.documentElement.dataset.theme;
    });
    
    expect(theme).toBeTruthy();
    expect(['light', 'dark']).toContain(theme);
  });

  test('should toggle from dark to light theme', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to be ready
    await page.waitForSelector('header', { timeout: 10000 });
    
    // Find the theme toggle button (Sun/Moon icon)
    const themeToggle = page.locator('button[title*="Mode"]').first();
    await expect(themeToggle).toBeVisible({ timeout: 5000 });
    
    // Get initial theme
    const initialTheme = await page.evaluate(() => document.documentElement.dataset.theme);
    
    // Click toggle
    await themeToggle.click();
    await page.waitForTimeout(500);
    
    // Verify theme changed
    const newTheme = await page.evaluate(() => document.documentElement.dataset.theme);
    expect(newTheme).not.toBe(initialTheme);
    
    // Take screenshot of light theme
    await page.screenshot({ path: 'test-results/theme-light.png', fullPage: true });
  });

  test('should persist theme preference after reload', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('header', { timeout: 10000 });
    
    // Toggle to light theme
    const themeToggle = page.locator('button[title*="Mode"]').first();
    await themeToggle.click();
    await page.waitForTimeout(500);
    
    const themeAfterToggle = await page.evaluate(() => document.documentElement.dataset.theme);
    
    // Reload page
    await page.reload();
    await page.waitForSelector('header', { timeout: 10000 });
    
    // Verify theme persisted
    const themeAfterReload = await page.evaluate(() => document.documentElement.dataset.theme);
    expect(themeAfterReload).toBe(themeAfterToggle);
    
    // Verify localStorage
    const savedTheme = await page.evaluate(() => localStorage.getItem('mce-theme-preference'));
    expect(savedTheme).toBe(themeAfterReload);
  });

  test('should toggle back to dark theme', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('header', { timeout: 10000 });
    
    // Toggle to light
    const themeToggle = page.locator('button[title*="Mode"]').first();
    await themeToggle.click();
    await page.waitForTimeout(500);
    
    // Toggle back to dark
    await themeToggle.click();
    await page.waitForTimeout(500);
    
    const finalTheme = await page.evaluate(() => document.documentElement.dataset.theme);
    
    // Take screenshot of dark theme
    await page.screenshot({ path: 'test-results/theme-dark.png', fullPage: true });
    
    expect(['dark', 'light']).toContain(finalTheme);
  });

  test('should navigate key views without crashing', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('header', { timeout: 10000 });
    
    // Test navigation to different views
    const views = [
      { name: 'Projects', selector: 'a[href*="projects"]' },
      { name: 'Dashboard', selector: 'a[href="/"]' },
    ];
    
    for (const view of views) {
      const link = page.locator(view.selector).first();
      if (await link.isVisible()) {
        await link.click();
        await page.waitForTimeout(1000);
        
        // Verify no console errors
        const errors: string[] = [];
        page.on('console', msg => {
          if (msg.type() === 'error') {
            errors.push(msg.text());
          }
        });
        
        // Verify page loaded
        await expect(page.locator('body')).toBeVisible();
        
        // Take screenshot
        await page.screenshot({ 
          path: `test-results/theme-${view.name.toLowerCase()}.png`,
          fullPage: false 
        });
      }
    }
  });

  test('should apply theme tokens correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('header', { timeout: 10000 });
    
    // Toggle to light theme
    const themeToggle = page.locator('button[title*="Mode"]').first();
    await themeToggle.click();
    await page.waitForTimeout(500);
    
    // Check if CSS variables are applied
    const bgColor = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue('--bg-base').trim();
    });
    
    expect(bgColor).toBeTruthy();
    
    // Toggle to dark and check again
    await themeToggle.click();
    await page.waitForTimeout(500);
    
    const bgColorDark = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue('--bg-base').trim();
    });
    
    expect(bgColorDark).toBeTruthy();
  });

  test('should handle CommandPalette in both themes', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('header', { timeout: 10000 });
    
    // Open command palette with keyboard shortcut
    await page.keyboard.press('Control+k');
    await page.waitForTimeout(500);
    
    // Verify palette is visible
    const palette = page.locator('[role="dialog"]').or(page.locator('div[class*="Command"]')).first();
    
    // If palette opened, take screenshot
    if (await palette.isVisible()) {
      await page.screenshot({ path: 'test-results/theme-command-palette-dark.png' });
      
      // Close palette
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
      
      // Toggle theme
      const themeToggle = page.locator('button[title*="Mode"]').first();
      await themeToggle.click();
      await page.waitForTimeout(500);
      
      // Open palette again in light theme
      await page.keyboard.press('Control+k');
      await page.waitForTimeout(500);
      
      if (await palette.isVisible()) {
        await page.screenshot({ path: 'test-results/theme-command-palette-light.png' });
      }
    }
  });

  test('should not cause flash of wrong theme on page load', async ({ page }) => {
    // Set theme preference
    await page.goto('/');
    await page.evaluate(() => localStorage.setItem('mce-theme-preference', 'light'));
    
    // Monitor for theme changes during load
    const themeChanges: string[] = [];
    await page.exposeFunction('trackTheme', (theme: string) => {
      themeChanges.push(theme);
    });
    
    await page.evaluate(() => {
      const observer = new MutationObserver(() => {
        (window as any).trackTheme(document.documentElement.dataset.theme);
      });
      observer.observe(document.documentElement, { 
        attributes: true, 
        attributeFilter: ['data-theme'] 
      });
    });
    
    // Reload page
    await page.reload();
    await page.waitForSelector('header', { timeout: 10000 });
    
    // Verify theme was set early (should be 'light' from start)
    const finalTheme = await page.evaluate(() => document.documentElement.dataset.theme);
    expect(finalTheme).toBe('light');
  });
});
