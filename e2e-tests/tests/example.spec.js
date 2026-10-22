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

  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      await page.locator('input[type="text"]').fill(testUser.username)
      await page.locator('input[type="password"]').fill(testUser.password)
      await page.getByRole('button', { name: 'login' }).click()

      await expect(
        page.getByRole('button', { name: 'create new blog' })
      ).toBeVisible()
    })

    test('a new blog can be created', async ({ page }) => {
      const title = 'Playwright created blog'
      const author = 'Playwright Test'
      const url = 'https://example.com/playwright-blog'

      await page.getByRole('button', { name: 'create new blog' }).click()

      const inputs = page.locator('form input')
      await inputs.nth(0).fill(title)
      await inputs.nth(1).fill(author)
      await inputs.nth(2).fill(url)

      await page.getByRole('button', { name: 'create', exact: true }).click()

      const createdBlog = page.locator('.blog').filter({ hasText: title })
      await expect(createdBlog).toContainText(author)
      await expect(createdBlog).toBeVisible()
    })
  })
})