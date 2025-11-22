// playwright.config.js
module.exports = {
  testDir: './tests',
  use: {
    headless: true, // Set to false if you want to see the browser actions
    baseURL: 'http://localhost:5174', // Adjust to your application's URL
    browserName: 'chromium',
  },
};

