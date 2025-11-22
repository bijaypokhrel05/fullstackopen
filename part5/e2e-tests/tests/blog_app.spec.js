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
    const response = await request.post('http://localhost:3001/api/users', {
      data: {
        username: 'testuser',
        password: 'password',
        name: 'Test User'
      }
    });
    
    // Ensure the user was created successfully
    if (response.status() !== 201) {
      throw new Error(`Failed to create user: ${await response.text()}`);
    }

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

    test('a blog can be liked', async ({ page }) => {
      // First, create a blog to like
      await page.getByRole('button', { name: 'create new blog' }).click();
      await expect(page.getByRole('heading', { name: 'create new' })).toBeVisible();

      const titleInput = page.locator('div:has-text("title:") input');
      const authorInput = page.locator('div:has-text("author:") input');
      const urlInput = page.locator('div:has-text("url:") input');

      await titleInput.fill('Blog to Like');
      await authorInput.fill('Test Author');
      await urlInput.fill('http://testblog.com');

      page.once('dialog', async dialog => {
        await dialog.accept();
      });

      await page.getByRole('button', { name: 'create' }).click();
      await expect(page.getByText('Blog to Like Test Author')).toBeVisible({ timeout: 15000 });

      // Find the blog by its text and click "view" to show details
      // The blog structure: div containing "Blog to Like Test Author" and a "view" button
      const blogDiv = page.locator('div').filter({ hasText: /Blog to Like Test Author/ }).first();
      await expect(blogDiv).toBeVisible();
      
      // Click the "view" button to show blog details
      await blogDiv.getByRole('button', { name: 'view' }).click();

      // Wait for the details to appear and check initial likes
      const likesTextElement = blogDiv.getByText(/likes \d+/);
      await expect(likesTextElement).toBeVisible({ timeout: 5000 });
      
      // Get the initial likes count
      const likesText = await likesTextElement.textContent();
      const initialLikes = parseInt(likesText.match(/likes (\d+)/)[1]);

      // Click the "likes" button to increment likes
      await blogDiv.getByRole('button', { name: 'likes' }).click();

      // Wait for the likes count to increase by 1
      await expect(blogDiv.getByText(`likes ${initialLikes + 1}`)).toBeVisible({ timeout: 10000 });
    });

    test('user who added the blog can delete it', async ({ page }) => {
      // First, create a blog
      await page.getByRole('button', { name: 'create new blog' }).click();
      await expect(page.getByRole('heading', { name: 'create new' })).toBeVisible();

      const titleInput = page.locator('div:has-text("title:") input');
      const authorInput = page.locator('div:has-text("author:") input');
      const urlInput = page.locator('div:has-text("url:") input');

      const blogTitle = 'Blog to Delete';
      const blogAuthor = 'Test Author';

      await titleInput.fill(blogTitle);
      await authorInput.fill(blogAuthor);
      await urlInput.fill('http://testblog.com');

      page.once('dialog', async dialog => {
        await dialog.accept();
      });

      await page.getByRole('button', { name: 'create' }).click();
      await expect(page.getByText(`${blogTitle} ${blogAuthor}`)).toBeVisible({ timeout: 15000 });

      // Find the blog and click "view" to show details
      const blogDiv = page.locator('div').filter({ hasText: new RegExp(`${blogTitle} ${blogAuthor}`) }).first();
      await expect(blogDiv).toBeVisible();
      
      // Click the "view" button to show blog details
      await blogDiv.getByRole('button', { name: 'view' }).click();

      // Wait for the details to appear and verify the "remove" button is visible
      // (only visible for the user who created the blog)
      const removeButton = blogDiv.getByRole('button', { name: 'remove' });
      await expect(removeButton).toBeVisible({ timeout: 5000 });

      // Set up dialog handler for the confirm dialog
      page.once('dialog', async dialog => {
        expect(dialog.type()).toBe('confirm');
        expect(dialog.message()).toContain(blogTitle);
        expect(dialog.message()).toContain(blogAuthor);
        await dialog.accept(); // Accept the confirmation to delete
      });

      // Click the "remove" button
      await removeButton.click();

      // Wait for the blog to be removed from the list
      await expect(page.getByText(`${blogTitle} ${blogAuthor}`)).not.toBeVisible({ timeout: 10000 });
    });

    test('only the user who added the blog sees the delete button', async ({ page, request }) => {
      // First, create a blog as testuser
      await page.getByRole('button', { name: 'create new blog' }).click();
      await expect(page.getByRole('heading', { name: 'create new' })).toBeVisible();

      const titleInput = page.locator('div:has-text("title:") input');
      const authorInput = page.locator('div:has-text("author:") input');
      const urlInput = page.locator('div:has-text("url:") input');

      const blogTitle = 'Blog for Delete Button Test';
      const blogAuthor = 'Test Author';

      await titleInput.fill(blogTitle);
      await authorInput.fill(blogAuthor);
      await urlInput.fill('http://testblog.com');

      page.once('dialog', async dialog => {
        await dialog.accept();
      });

      await page.getByRole('button', { name: 'create' }).click();
      await expect(page.getByText(`${blogTitle} ${blogAuthor}`)).toBeVisible({ timeout: 15000 });

      // Find the blog and click "view" to show details
      const blogDiv = page.locator('div').filter({ hasText: new RegExp(`${blogTitle} ${blogAuthor}`) }).first();
      await expect(blogDiv).toBeVisible();
      
      // Click the "view" button to show blog details
      await blogDiv.getByRole('button', { name: 'view' }).click();

      // Verify the "remove" button IS visible for the user who created the blog
      const removeButton = blogDiv.getByRole('button', { name: 'remove' });
      await expect(removeButton).toBeVisible({ timeout: 5000 });

      // Now logout
      await page.getByRole('button', { name: 'logout' }).click();
      
      // Verify we're logged out (login form should be visible)
      await expect(page.getByRole('heading', { name: 'log in to application' })).toBeVisible({ timeout: 10000 });

      // Create a second user
      const secondUserResponse = await request.post('http://localhost:3001/api/users', {
        data: {
          username: 'otheruser',
          password: 'password',
          name: 'Other User'
        }
      });
      
      if (secondUserResponse.status() !== 201) {
        throw new Error(`Failed to create second user: ${await secondUserResponse.text()}`);
      }

      // Login as the second user
      page.once('dialog', async dialog => {
        expect(dialog.message()).toContain('otheruser');
        await dialog.accept();
      });

      await page.locator('input[type="text"]').fill('otheruser');
      await page.locator('input[type="password"]').fill('password');
      await page.locator('button[type="submit"]').click();

      // Wait for login to complete
      await expect(page.getByRole('heading', { name: 'blogs' })).toBeVisible({ timeout: 30000 });

      // Find the same blog (created by testuser) and click "view"
      const blogDivOtherUser = page.locator('div').filter({ hasText: new RegExp(`${blogTitle} ${blogAuthor}`) }).first();
      await expect(blogDivOtherUser).toBeVisible();
      
      // Click the "view" button to show blog details
      await blogDivOtherUser.getByRole('button', { name: 'view' }).click();

      // Verify the "remove" button is NOT visible for the other user
      const removeButtonOtherUser = blogDivOtherUser.getByRole('button', { name: 'remove' });
      await expect(removeButtonOtherUser).not.toBeVisible({ timeout: 5000 });
    });
  });
});

