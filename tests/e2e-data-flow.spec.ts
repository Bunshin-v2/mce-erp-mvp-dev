import { test, expect } from '@playwright/test';

test.describe('MCE System E2E Data Flow', () => {
  
  test.beforeEach(async ({ page }) => {
    // 1. Initial Load & Auth Bypass
    await page.goto('/');
    const bypassButton = page.getByRole('button', { name: /Bypass Authentication/i });
    if (await bypassButton.isVisible()) {
      await bypassButton.click();
    }
    await page.waitForLoadState('networkidle');
  });

  test('Project Creation & Dashboard Sync', async ({ page }) => {
    // Navigate to Projects
    await page.getByRole('button', { name: /PROJECTS/i }).click();
    await page.waitForTimeout(1000);

    // Open Project Form
    await page.getByRole('button', { name: /INITIALIZE_NODE/i }).click();
    await page.waitForTimeout(1000); // Wait for modal animation
    
    // Fill Form - Wait for selector explicitly
    await page.waitForSelector('input[name="project_name"]', { timeout: 5000 });
    const uniqueId = `E2E-${Date.now()}`;
    await page.fill('input[name="project_name"]', `Project ${uniqueId}`);
    await page.fill('input[name="project_code"]', uniqueId);
    await page.fill('input[name="client_name"]', 'E2E Corp');
    await page.fill('input[name="contract_value_excl_vat"]', '5000000');
    
    // Submit
    await page.getByRole('button', { name: /CREATE PROJECT/i }).click();
    
    // Validation: Check if it appears in the list
    await expect(page.getByText(`Project ${uniqueId}`)).toBeVisible({ timeout: 10000 });
  });

  test('Task Creation in TodoTracker', async ({ page }) => {
    // Navigate to Tasks
    await page.getByRole('button', { name: /TASKS/i }).click();
    await page.waitForTimeout(1000);

    // Use Quick Add on Dashboard
    const taskTitle = `Critical Task ${Date.now()}`;
    await page.fill('input[placeholder="What needs to be done?"]', taskTitle);
    
    // Click the specific "Add" button (exact match to avoid "Add New Task")
    await page.getByRole('button', { name: 'Add', exact: true }).click();

    // Validation: Check if it appears in the Recent Tasks list
    await expect(page.getByText(taskTitle)).toBeVisible();
  });

});
