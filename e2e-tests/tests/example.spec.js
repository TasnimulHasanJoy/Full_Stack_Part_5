import { beforeEach, describe, expect, test } from '@playwright/test'

const testUser = {
  name: 'Test User',
  username: 'testuser',
  password: 'password123'
}

const createBlog = async (page, title, author, url) => {
  await page.getByRole('button', { name: 'create new blog' }).click()

  const inputs = page.locator('form input')
  await inputs.nth(0).fill(title)
  await inputs.nth(1).fill(author)
  await inputs.nth(2).fill(url)

  await page.getByRole('button', { name: 'create', exact: true }).click()

  const blog = page.locator('.blog').filter({ hasText: title })
  await expect(blog).toBeVisible()

  return blog
}

const login = async (page, username, password) => {
  await page.locator('input[type="text"]').fill(username)
  await page.locator('input[type="password"]').fill(password)
  await page.getByRole('button', { name: 'login' }).click()
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
      await login(page, testUser.username, testUser.password)

      await expect(
        page.getByText(`${testUser.name} logged in`)
      ).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      await login(page, testUser.username, 'wrong-password')

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
      await login(page, testUser.username, testUser.password)

      await expect(
        page.getByRole('button', { name: 'create new blog' })
      ).toBeVisible()
    })

    test('a new blog can be created', async ({ page }) => {
      const blog = await createBlog(
        page,
        'Playwright created blog',
        'Playwright Test',
        'https://example.com/playwright-blog'
      )

      await expect(blog).toContainText('Playwright Test')
    })

    test('a blog can be liked', async ({ page }) => {
      const blog = await createBlog(
        page,
        'Blog to like',
        'Playwright Test',
        'https://example.com/blog-to-like'
      )

      await blog.getByRole('button', { name: 'view' }).click()
      await expect(blog).toContainText('likes 0')

      await blog.getByRole('button', { name: 'like' }).click()
      await expect(blog).toContainText('likes 1')
    })

    test('the user who added a blog can delete it', async ({ page }) => {
      const title = 'Blog to delete'

      await createBlog(
        page,
        title,
        'Playwright Test',
        'https://example.com/blog-to-delete'
      )

      await page.reload()

      const blog = page.locator('.blog').filter({ hasText: title })
      await expect(blog).toBeVisible()
      await blog.getByRole('button', { name: 'view' }).click()

      page.once('dialog', dialog => dialog.accept())
      await blog.getByRole('button', { name: 'remove' }).click()

      await expect(blog).toHaveCount(0)
    })

    test('only the user who added a blog sees its remove button', async ({
      page,
      request
    }) => {
      const title = 'Another users blog'
      const otherUser = {
        name: 'Other User',
        username: 'otheruser',
        password: 'otherpassword'
      }

      await createBlog(
        page,
        title,
        'Playwright Test',
        'https://example.com/another-users-blog'
      )

      await page.reload()

      await request.post('http://localhost:3003/api/users', {
        data: otherUser
      })

      await page.getByRole('button', { name: 'logout' }).click()
      await login(page, otherUser.username, otherUser.password)

      const blog = page.locator('.blog').filter({ hasText: title })
      await expect(blog).toBeVisible()
      await blog.getByRole('button', { name: 'view' }).click()

      await expect(blog.getByRole('button', { name: 'remove' })).toHaveCount(0)
    })
  })
})