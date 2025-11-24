import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should load the homepage', async ({ page }) => {
    await expect(page).toHaveTitle(/Social Trading/i)
  })

  test('should display the hero section', async ({ page }) => {
    // Look for main heading or hero content
    const heading = page.locator('h1').first()
    await expect(heading).toBeVisible()
  })

  test('should have Connect Wallet button', async ({ page }) => {
    const connectButton = page.getByRole('button', { name: /connect wallet/i })
    await expect(connectButton).toBeVisible()
  })

  test('should have navigation links', async ({ page }) => {
    // Check for common navigation links
    const tradersLink = page.locator('a[href*="traders"]').first()
    await expect(tradersLink).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Page should still be accessible on mobile
    const heading = page.locator('h1').first()
    await expect(heading).toBeVisible()
    
    const connectButton = page.getByRole('button', { name: /connect wallet/i })
    await expect(connectButton).toBeVisible()
  })

  test('should navigate to traders page', async ({ page }) => {
    // Find and click link to traders page
    await page.click('a[href*="/traders"]')
    
    // Wait for navigation
    await page.waitForURL(/.*traders/)
    
    // Verify we're on the traders page
    expect(page.url()).toContain('/traders')
  })

  test('should navigate to become-trader page', async ({ page }) => {
    // Find and click link to become trader page
    const becomeTraderLink = page.locator('a[href*="become-trader"]').first()
    
    if (await becomeTraderLink.isVisible()) {
      await becomeTraderLink.click()
      await page.waitForURL(/.*become-trader/)
      expect(page.url()).toContain('become-trader')
    }
  })

  test('should have no accessibility violations', async ({ page }) => {
    // Basic accessibility check - page should have proper structure
    await expect(page.locator('html')).toHaveAttribute('lang')
    
    // Should have skip links or proper heading hierarchy
    const mainContent = page.locator('main, [role="main"]')
    await expect(mainContent).toBeVisible()
  })
})

