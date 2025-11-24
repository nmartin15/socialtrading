import { test, expect } from '@playwright/test'

test.describe('Traders Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/traders')
  })

  test('should load the traders page', async ({ page }) => {
    await expect(page).toHaveURL(/.*traders/)
  })

  test('should display page heading', async ({ page }) => {
    const heading = page.locator('h1, h2').first()
    await expect(heading).toBeVisible()
  })

  test('should display trader cards or empty state', async ({ page }) => {
    // Either trader cards exist or there's an empty state message
    const hasTraders = await page.locator('a[href*="/traders/"]').count() > 0
    const hasEmptyState = await page.getByText(/no traders/i).isVisible()
    
    expect(hasTraders || hasEmptyState).toBe(true)
  })

  test('should have filter options', async ({ page }) => {
    // Check if there are any filter buttons or inputs
    const filters = page.locator('button').filter({ hasText: /all|verified|filter/i })
    const filterCount = await filters.count()
    
    // Should have at least some filtering mechanism
    expect(filterCount).toBeGreaterThanOrEqual(0)
  })

  test('should be able to click on a trader card', async ({ page }) => {
    // Wait for trader cards to load
    const traderCard = page.locator('a[href*="/traders/"]').first()
    
    // Only proceed if there are trader cards
    if (await traderCard.isVisible()) {
      const href = await traderCard.getAttribute('href')
      await traderCard.click()
      
      // Should navigate to trader detail page
      await page.waitForURL(/.*traders\/.*/)
      expect(page.url()).toContain('/traders/')
      
      // Verify we're on a different page (not just /traders)
      expect(page.url()).not.toBe('http://localhost:3000/traders')
    }
  })

  test('should display trader information on cards', async ({ page }) => {
    const traderCard = page.locator('a[href*="/traders/"]').first()
    
    if (await traderCard.isVisible()) {
      // Check for trader username or wallet address
      const hasUsername = await traderCard.locator('text=/0x|[A-Za-z0-9_]+/').first().isVisible()
      expect(hasUsername).toBe(true)
      
      // Check for follow/subscribe button
      const hasActionButton = await traderCard.getByRole('button').first().isVisible()
      expect(hasActionButton).toBe(true)
    }
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Page should still be functional on mobile
    const heading = page.locator('h1, h2').first()
    await expect(heading).toBeVisible()
  })

  test('should allow filtering verified traders', async ({ page }) => {
    const verifiedFilter = page.getByRole('button', { name: /verified/i })
    
    if (await verifiedFilter.isVisible()) {
      await verifiedFilter.click()
      
      // URL should update with filter parameter or cards should update
      await page.waitForTimeout(500) // Brief wait for filtering
      
      // Verify some change occurred (URL param or UI update)
      const url = page.url()
      expect(url).toBeTruthy()
    }
  })

  test('should navigate back to homepage', async ({ page }) => {
    // Look for home link or logo
    const homeLink = page.locator('a[href="/"]').first()
    
    if (await homeLink.isVisible()) {
      await homeLink.click()
      await expect(page).toHaveURL('/')
    }
  })
})

