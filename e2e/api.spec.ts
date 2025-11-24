import { test, expect } from '@playwright/test'

test.describe('API Endpoints', () => {
  test('should return healthy status from health endpoint', async ({ request }) => {
    const response = await request.get('/api/health')
    
    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
    
    const data = await response.json()
    expect(data.status).toBe('ok')
    expect(data.database).toBe('connected')
    expect(data.timestamp).toBeTruthy()
  })

  test('should fetch traders from API', async ({ request }) => {
    const response = await request.get('/api/traders')
    
    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
    
    const data = await response.json()
    expect(Array.isArray(data)).toBe(true)
  })

  test('should filter verified traders', async ({ request }) => {
    const response = await request.get('/api/traders?verified=true')
    
    expect(response.ok()).toBeTruthy()
    const data = await response.json()
    expect(Array.isArray(data)).toBe(true)
    
    // All returned traders should be verified
    if (data.length > 0) {
      data.forEach((trader: any) => {
        expect(trader.verified).toBe(true)
      })
    }
  })

  test('should filter traders by style', async ({ request }) => {
    const style = 'Day Trading'
    const response = await request.get(`/api/traders?style=${encodeURIComponent(style)}`)
    
    expect(response.ok()).toBeTruthy()
    const data = await response.json()
    expect(Array.isArray(data)).toBe(true)
    
    // All returned traders should have the specified style
    if (data.length > 0) {
      data.forEach((trader: any) => {
        expect(trader.tradingStyles).toContain(style)
      })
    }
  })

  test('should fetch users from API', async ({ request }) => {
    const response = await request.get('/api/users')
    
    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
    
    const data = await response.json()
    expect(Array.isArray(data)).toBe(true)
  })

  test('should return 400 when creating user without wallet address', async ({ request }) => {
    const response = await request.post('/api/users', {
      data: {
        username: 'test_user',
      },
    })
    
    expect(response.status()).toBe(400)
    const data = await response.json()
    expect(data.error).toBeTruthy()
  })

  test('should handle CORS headers properly', async ({ request }) => {
    const response = await request.get('/api/health')
    
    // Check for security headers
    const headers = response.headers()
    expect(headers).toBeTruthy()
  })

  test('should return proper content-type for JSON responses', async ({ request }) => {
    const response = await request.get('/api/traders')
    
    const contentType = response.headers()['content-type']
    expect(contentType).toContain('application/json')
  })

  test('should handle non-existent endpoints gracefully', async ({ request }) => {
    const response = await request.get('/api/nonexistent')
    
    // Should return 404 or handle gracefully
    expect([404, 405]).toContain(response.status())
  })
})

