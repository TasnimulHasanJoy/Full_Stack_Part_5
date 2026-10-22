import { beforeEach, describe, expect, test } from '@playwright/test'

const testUser = {
  name: 'Test User',
  username: 'testuser',
  password: 'password123'
}

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('http://localhost:3003/api/testing/reset')

    await request.post('http://localhost:3003/api/users', {
      data: testUser
    })

    await page.goto('/')
  })

  test('Login form is shown', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: 'Log in to application' })
    ).toBeVisible()

    await expect(page.locator('input[type="text"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.getByRole('button', { name: 'login' })).toBeVisible()
  })

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await page.locator('input[type="text"]').fill(testUser.username)
      await page.locator('input[type="password"]').fill(testUser.password)
      await page.getByRole('button', { name: 'login' }).click()

      await expect(
        page.getByText(`${testUser.name} logged in`)
      ).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      await page.locator('input[type="text"]').fill(testUser.username)
      await page.locator('input[type="password"]').fill('wrong-password')
      await page.getByRole('button', { name: 'login' }).click()

      await expect(
        page.getByText('Wrong username or password')
      ).toBeVisible()

      await expect(
        page.getByRole('heading', { name: 'Log in to application' })
      ).toBeVisible()
    })
  })
})