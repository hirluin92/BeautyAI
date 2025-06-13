import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login')
    
    // Verifica elementi della pagina login
    await expect(page.getByRole('heading', { name: /accedi/i })).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /accedi/i })).toBeVisible()
  })

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/login')
    
    // Clicca accedi senza compilare
    await page.getByRole('button', { name: /accedi/i }).click()
    
    // Verifica messaggi di errore
    await expect(page.getByText(/email.*obbligator/i)).toBeVisible()
    await expect(page.getByText(/password.*obbligator/i)).toBeVisible()
  })

  test('should redirect to dashboard after successful login', async ({ page }) => {
    await page.goto('/login')
    
    // Compila il form
    await page.getByLabel(/email/i).fill('test@beautycenter.it')
    await page.getByLabel(/password/i).fill('testpassword123')
    
    // Accedi
    await page.getByRole('button', { name: /accedi/i }).click()
    
    // Verifica redirect
    await page.waitForURL('/dashboard')
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible()
  })

  test('should navigate to registration page', async ({ page }) => {
    await page.goto('/login')
    
    // Clicca su "Registrati"
    await page.getByText(/non hai un account.*registrati/i).click()
    
    // Verifica di essere sulla pagina di registrazione
    await expect(page).toHaveURL('/register')
    await expect(page.getByRole('heading', { name: /registrati/i })).toBeVisible()
  })
})