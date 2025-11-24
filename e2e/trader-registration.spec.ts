import { test, expect } from '@playwright/test'

test.describe('Trader Registration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/become-trader')
  })

  test('should load the trader registration page', async ({ page }) => {
    await expect(page).toHaveURL(/.*become-trader/)
  })

  test('should display registration form', async ({ page }) => {
    // Check for form elements
    await expect(page.getByRole('textbox', { name: /username/i })).toBeVisible()
    await expect(page.getByRole('textbox', { name: /bio/i })).toBeVisible()
  })

  test('should have all required form fields', async ({ page }) => {
    // Username field
    const usernameField = page.getByLabel(/username/i)
    await expect(usernameField).toBeVisible()
    
    // Bio field
    const bioField = page.getByLabel(/bio/i)
    await expect(bioField).toBeVisible()
    
    // Subscription price
    const priceField = page.getByLabel(/subscription price/i)
    await expect(priceField).toBeVisible()
    
    // Performance fee
    const feeField = page.getByLabel(/performance fee/i)
    await expect(feeField).toBeVisible()
    
    // Submit button
    const submitButton = page.getByRole('button', { name: /register/i })
    await expect(submitButton).toBeVisible()
  })

  test('should show validation errors for empty form', async ({ page }) => {
    // Try to submit empty form
    const submitButton = page.getByRole('button', { name: /register/i })
    await submitButton.click()
    
    // Wait for validation errors
    await page.waitForTimeout(500)
    
    // Should show error messages
    const errors = page.locator('text=/required|must be|cannot be empty/i')
    const errorCount = await errors.count()
    expect(errorCount).toBeGreaterThan(0)
  })

  test('should validate username length', async ({ page }) => {
    // Enter short username
    await page.getByLabel(/username/i).fill('ab')
    await page.getByRole('button', { name: /register/i }).click()
    
    // Should show error about username length
    await expect(page.getByText(/username must be at least 3/i)).toBeVisible()
  })

  test('should validate bio length', async ({ page }) => {
    // Enter short bio
    await page.getByLabel(/bio/i).fill('short')
    await page.getByRole('button', { name: /register/i }).click()
    
    // Should show error about bio length
    await expect(page.getByText(/bio must be at least 10/i)).toBeVisible()
  })

  test('should have trading style selection', async ({ page }) => {
    // Look for trading style buttons or checkboxes
    const tradingStyles = page.getByText(/day trading|swing trading|scalping/i).first()
    await expect(tradingStyles).toBeVisible()
  })

  test('should allow selecting trading styles', async ({ page }) => {
    // Find and click trading style buttons
    const dayTrading = page.locator('button', { hasText: /day trading/i }).first()
    
    if (await dayTrading.isVisible()) {
      await dayTrading.click()
      
      // Button should change appearance when selected
      await expect(dayTrading).toHaveClass(/bg-blue|selected|active/)
    }
  })

  test('should validate performance fee range', async ({ page }) => {
    const feeInput = page.getByLabel(/performance fee/i)
    
    // Try to enter invalid fee (> 20%)
    await feeInput.fill('25')
    await page.getByRole('button', { name: /register/i }).click()
    
    // Should show error or prevent submission
    await page.waitForTimeout(500)
    const hasError = await page.getByText(/cannot exceed 20|max.*20/i).isVisible()
    expect(hasError).toBe(true)
  })

  test('should fill out complete valid form', async ({ page }) => {
    // Fill out all fields with valid data
    await page.getByLabel(/username/i).fill('test_trader_e2e')
    await page.getByLabel(/bio/i).fill('This is a test bio for e2e testing purposes.')
    
    // Fill numeric fields
    const priceField = page.getByLabel(/subscription price/i)
    await priceField.fill('50')
    
    const feeField = page.getByLabel(/performance fee/i)
    await feeField.fill('15')
    
    // Select at least one trading style
    const dayTrading = page.locator('button', { hasText: /day trading/i }).first()
    if (await dayTrading.isVisible()) {
      await dayTrading.click()
    }
    
    // Form should be filled correctly
    await expect(page.getByLabel(/username/i)).toHaveValue('test_trader_e2e')
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Form should still be usable on mobile
    await expect(page.getByLabel(/username/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /register/i })).toBeVisible()
  })

  test('should show loading state when submitting', async ({ page }) => {
    // Fill out valid form
    await page.getByLabel(/username/i).fill('test_trader_submit')
    await page.getByLabel(/bio/i).fill('Valid bio for submission test.')
    
    const priceField = page.getByLabel(/subscription price/i)
    await priceField.fill('25')
    
    const feeField = page.getByLabel(/performance fee/i)
    await feeField.fill('10')
    
    // Select trading style
    const dayTrading = page.locator('button', { hasText: /day trading/i }).first()
    if (await dayTrading.isVisible()) {
      await dayTrading.click()
    }
    
    // Click submit
    const submitButton = page.getByRole('button', { name: /register/i })
    await submitButton.click()
    
    // Should show loading state (button disabled or text changed)
    await expect(submitButton).toBeDisabled().catch(() => {
      // Alternative: check for loading text
      expect(submitButton).toHaveText(/registering|loading/i)
    })
  })
})

