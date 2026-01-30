import { test, expect } from '@playwright/test';

test('System Integrity Audit', async ({ page }) => {
  const errors: string[] = [];
  const brokenButtons: string[] = [];

  // Capture console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(`Console Error: ${msg.text()}`);
    }
  });

  // Capture page crashes
  page.on('pageerror', error => {
    errors.push(`Page Crash: ${error.message}`);
  });

  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Handle Auth Bypass if present
  const bypassButton = page.getByRole('button', { name: /Bypass Authentication/i });
  if (await bypassButton.isVisible()) {
    console.log('Detected Auth Bypass screen. Neutralizing...');
    await bypassButton.click();
    await page.waitForURL('**/');
    await page.waitForSelector('aside, .page-container', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
  }

  await page.screenshot({ path: 'audit-debug.png', fullPage: true });
  
  console.log(`Auditing Page: "${await page.title()}"`);
  console.log(`URL: ${page.url()}`);

  // 1. Audit Navigation & Controls
  // Find all clickable items in the view
  const clickableItems = await page.locator('button, [role="button"], a').all();
  console.log(`Auditing ${clickableItems.length} interactive elements...`);

  for (const button of clickableItems.slice(0, 50)) { // Limit to first 50 for safety
    const label = (await button.innerText() || await button.getAttribute('aria-label') || 'unlabeled').trim().split('\n')[0];
    const isVisible = await button.isVisible();
    if (!isVisible || label === '') continue;

    console.log(`   - Testing component: [${label}]`);
    try {
      await button.click({ timeout: 1500 });
      await page.waitForTimeout(400); // Wait for transition
      
      // Check if page crashed after click
      const bodyText = await page.innerText('body');
      if (bodyText.includes('System Variance Detected') || bodyText.includes('error')) {
        errors.push(`Logic Error: Navigating to [${label}] triggered an error boundary/message.`);
      }
    } catch (e) {
      brokenButtons.push(`Element [${label.substring(0, 15)}] failed to respond`);
    }
  }

  // 2. Audit Main Content Buttons
  const mainButtons = await page.locator('main button, .page-container button').all();
  console.log(`Auditing ${mainButtons.length} functional buttons...`);

  for (const button of mainButtons.slice(0, 20)) { // Sample first 20 to avoid infinite loops
    const text = await button.innerText() || 'icon-button';
    try {
      await button.click({ timeout: 1000 });
      await page.waitForTimeout(300);
    } catch (e) {
      // Buttons might be disabled or hidden, which is fine
    }
  }

  console.log('\n--- FUNCTIONAL INTEGRITY RESULTS ---');
  if (errors.length === 0 && brokenButtons.length === 0) {
    console.log('✅ No immediate crashes or console errors detected during crawl.');
  } else {
    errors.forEach(err => console.log(`❌ ${err}`));
    brokenButtons.forEach(btn => console.log(`⚠️ ${btn}`));
  }
});
