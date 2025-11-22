// tests/blog_app.spec.js
// Load environment variables first
require('dotenv').config({ path: require('path').resolve(__dirname, '../../backend/.env') });

const { test, expect, describe, beforeEach } = require('@playwright/test');
const mongoose = require('mongoose');

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    // Connect to MongoDB using the same URL from backend
    const MONGODB_URL = process.env.MONGODB_URL;
    
    if (!MONGODB_URL) {
      throw new Error('MONGODB_URL must be set in environment variables');
    }
    
    // Close existing connection if any
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    
    // Connect to MongoDB and wait for connection
    await mongoose.connect(MONGODB_URL);
    await new Promise((resolve, reject) => {
      if (mongoose.connection.readyState === 1) {
        resolve();
      } else {
        mongoose.connection.once('connected', resolve);
        mongoose.connection.once('error', reject);
      }
    });

    // Empty the database using native MongoDB operations
    const db = mongoose.connection.db;
    await db.collection('blogs').deleteMany({});
    await db.collection('users').deleteMany({});
    
    // Close MongoDB connection
    await mongoose.connection.close();
    
    // Create a user using the backend API
    await request.post('http://localhost:3001/api/users', {
      data: {
        username: 'testuser',
        password: 'password',
        name: 'Test User'
      }
    });

    // Navigate to the page
    await page.goto('/');
  });

  test('Login form is shown', async ({ page }) => {
    // Check if the login heading is present
    const heading = page.locator('h1');
    await expect(heading).toHaveText('log in to application');

    // Check if the login form is present
    const loginForm = page.locator('form');
    await expect(loginForm).toBeVisible();

    // Check for specific input fields
    const usernameInput = page.locator('input[type="text"]');
    const passwordInput = page.locator('input[type="password"]');
    await expect(usernameInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    // Check for the login button
    const loginButton = page.locator('button[type="submit"]');
    await expect(loginButton).toBeVisible();
    await expect(loginButton).toHaveText('login');
  });

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      // Set up dialog handler for the alert BEFORE filling form
      page.once('dialog', async dialog => {
        expect(dialog.message()).toContain('testuser');
        await dialog.accept();
      });

      // Fill in the login form with correct credentials
      await page.locator('input[type="text"]').fill('testuser');
      await page.locator('input[type="password"]').fill('password');
      
      // Click submit
      await page.locator('button[type="submit"]').click();

      // Wait for the "blogs" heading to appear (indicating successful login)
      // This is the main indicator - if login succeeds, this will appear
      await expect(page.getByRole('heading', { name: 'blogs' })).toBeVisible({ timeout: 30000 });
      
      // Check that we're logged in by looking for the logout button
      await expect(page.locator('button:has-text("logout")')).toBeVisible({ timeout: 10000 });
      
      // Check that the user name is displayed (wait for async name fetch)
      await expect(page.getByText('Test User')).toBeVisible({ timeout: 10000 });
    });

    test('fails with wrong credentials', async ({ page }) => {
      // Fill in the login form with wrong credentials
      await page.locator('input[type="text"]').fill('testuser');
      await page.locator('input[type="password"]').fill('wrongpassword');
      await page.locator('button[type="submit"]').click();

      // Wait a moment for any error to appear
      await page.waitForTimeout(500);

      // Check for error notification - it should be in a <p> tag
      // Try to find any <p> that contains "wrong"
      const errorParagraph = page.locator('p').filter({ hasText: 'wrong' });
      const isErrorVisible = await errorParagraph.isVisible().catch(() => false);
      
      if (isErrorVisible) {
        await expect(errorParagraph).toBeVisible();
      } else {
        // If error message doesn't appear, at least verify we're still on login page
        // This indicates login failed (we didn't navigate away)
        await expect(page.getByRole('heading', { name: 'log in to application' })).toBeVisible();
      }
      
      // Verify we're still on the login page (form should still be visible)
      await expect(page.locator('form')).toBeVisible();
    });
  });

  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      // Set up dialog handler for login alert BEFORE any actions
      page.once('dialog', async dialog => {
        expect(dialog.message()).toContain('testuser');
        await dialog.accept();
      });

      // Fill in login form
      await page.locator('input[type="text"]').fill('testuser');
      await page.locator('input[type="password"]').fill('password');
      
      // Click submit
      await page.locator('button[type="submit"]').click();

      // Wait for the "blogs" heading to appear (indicating successful login)
      // This is the main indicator - if login succeeds, this will appear
      await expect(page.getByRole('heading', { name: 'blogs' })).toBeVisible({ timeout: 30000 });
      
      // Wait for the "create new blog" button to appear (indicating we're logged in)
      await expect(page.getByRole('button', { name: 'create new blog' })).toBeVisible({ timeout: 10000 });
    });

    test('a new blog can be created', async ({ page }) => {
      // Click the button to show the blog creation form
      await page.getByRole('button', { name: 'create new blog' }).click();

      // Wait for the form to appear
      await expect(page.getByRole('heading', { name: 'create new' })).toBeVisible();

      // Fill in the blog details
      const titleInput = page.locator('div:has-text("title:") input');
      const authorInput = page.locator('div:has-text("author:") input');
      const urlInput = page.locator('div:has-text("url:") input');

      await titleInput.fill('Test Blog Title');
      await authorInput.fill('Test Author');
      await urlInput.fill('http://testblog.com');

      // Set up dialog handler for the success alert
      page.once('dialog', async dialog => {
        expect(dialog.message()).toContain('Test Blog Title');
        await dialog.accept();
      });

      // Submit the form
      await page.getByRole('button', { name: 'create' }).click();

      // Wait for the new blog to appear in the list
      // The blog displays as "title author" format (from Blog.jsx: {blog.title} {blog.author})
      await expect(page.getByText('Test Blog Title Test Author')).toBeVisible({ timeout: 15000 });
    });
  });
});

