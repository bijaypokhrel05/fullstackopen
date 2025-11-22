// tests/blog_app.spec.js
const { test, expect, describe, beforeEach } = require('@playwright/test');

describe('Blog app', () => {
  beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Login form is shown', async ({ page }) => {
    // Check if the login heading is present
    const heading = await page.locator('h1');
    await expect(heading).toHaveText('log in to application');

    // Check if the login form is present
    const loginForm = await page.locator('form');
    await expect(loginForm).toBeVisible();

    // Check for specific input fields
    const usernameInput = await page.locator('input[type="text"]');
    const passwordInput = await page.locator('input[type="password"]');
    await expect(usernameInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    // Check for the login button
    const loginButton = await page.locator('button[type="submit"]');
    await expect(loginButton).toBeVisible();
    await expect(loginButton).toHaveText('login');
  });
});

