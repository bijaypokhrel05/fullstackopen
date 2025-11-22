// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Blog application', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
  });

  test('user can login and create a new blog', async ({ page }) => {
    // Wait for the login page to load
    await expect(page.getByRole('heading', { name: /log in to application/i })).toBeVisible();

    // Fill in login credentials
    // Note: You'll need to adjust these based on your test user credentials
    const username = 'testuser'; // Change to your test username
    const password = 'testpassword'; // Change to your test password

    await page.getByLabel('username').fill(username);
    await page.getByLabel('password').fill(password);

    // Set up dialog handler before clicking login
    const loginDialogPromise = new Promise((resolve) => {
      page.once('dialog', async dialog => {
        expect(dialog.message()).toContain('loggedin');
        await dialog.accept();
        resolve();
      });
    });

    // Click login button
    await page.getByRole('button', { name: /login/i }).click();

    // Wait for the login dialog
    await loginDialogPromise;

    // Wait for the main page to load after login
    await expect(page.getByRole('heading', { name: /blogs/i })).toBeVisible();

    // Click the "create new blog" button to show the form
    await page.getByRole('button', { name: /create new blog/i }).click();

    // Wait for the form to be visible
    await expect(page.getByRole('heading', { name: /create new/i })).toBeVisible();

    // Fill in the blog form
    const blogTitle = 'End to End Testing with Playwright';
    const blogAuthor = 'Test Author';
    const blogUrl = 'https://playwright.dev';

    // Get all text inputs (title, author, url)
    const inputs = page.locator('input[type="text"]');
    await inputs.nth(0).fill(blogTitle); // title
    await inputs.nth(1).fill(blogAuthor); // author
    await inputs.nth(2).fill(blogUrl); // url

    // Set up dialog handler for the creation success alert
    const createDialogPromise = new Promise((resolve) => {
      page.once('dialog', async dialog => {
        expect(dialog.message()).toContain('saved successfully');
        await dialog.accept();
        resolve();
      });
    });

    // Submit the form
    await page.getByRole('button', { name: /create/i }).click();

    // Wait for the creation dialog
    await createDialogPromise;

    // Wait for the notification to appear
    await expect(page.getByText(/a new blog.*added/i)).toBeVisible();

    // Verify the new blog appears in the list
    // The blog should show title and author
    await expect(page.getByText(blogTitle)).toBeVisible();
    await expect(page.getByText(blogAuthor)).toBeVisible();
  });
});

