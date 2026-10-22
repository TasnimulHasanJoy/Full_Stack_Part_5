const { test, expect } = require('@playwright/test')

const testUser = {
  name: 'Test User',
  username: 'testuser',
  password: 'password'
}

const blog = {
  title: 'E2E test blog',
  author: 'Test Author',
  url: 'https://example.com/e2e-test'
}

const login = async page => {
  await page.getByRole('link', { name: 'login' }).click()
  await page.locator('input').nth(0).fill(testUser.username)
  await page.locator('input').nth(1).fill(testUser.password)
  await page.getByRole('button', { name: 'login' }).click()
}

const createBlog = async page => {
  await login(page)
  await page.getByRole('link', { name: 'new blog' }).click()

  await page.locator('input').nth(0).fill(blog.title)
  await page.locator('input').nth(1).fill(blog.author)
  await page.locator('input').nth(2).fill(blog.url)

  await page.getByRole('button', { name: 'create' }).click()

  await expect(
    page.getByRole('link', { name: `${blog.title} by ${blog.author}` })
  ).toBeVisible()
}

test.beforeEach(async ({ page, request }) => {
  await request.post('http://localhost:3003/api/testing/reset')
  await request.post('http://localhost:3003/api/users', {
    data: testUser
  })

  await page.goto('/')
})

test('login succeeds with the correct username and password', async ({ page }) => {
  await login(page)

  await expect(page.getByRole('button', { name: 'logout' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'new blog' })).toBeVisible()
})

test('login fails with an incorrect username or password', async ({ page }) => {
  await page.getByRole('link', { name: 'login' }).click()
  await page.locator('input').nth(0).fill(testUser.username)
  await page.locator('input').nth(1).fill('wrong-password')
  await page.getByRole('button', { name: 'login' }).click()

  await expect(page.getByText('Wrong username or password')).toBeVisible()
  await expect(page.getByRole('button', { name: 'logout' })).toHaveCount(0)
})

test('a logged-in user can create a blog', async ({ page }) => {
  await createBlog(page)

  await expect(
    page.getByRole('link', { name: `${blog.title} by ${blog.author}` })
  ).toBeVisible()
})

test('a logged-in user can like a blog', async ({ page }) => {
  await createBlog(page)

  await page.getByRole('link', {
    name: `${blog.title} by ${blog.author}`
  }).click()

  const blogDetails = page.locator('.blog-details')

  await expect(blogDetails).toContainText('likes 0')
  await page.getByRole('button', { name: 'like' }).click()
  await expect(blogDetails).toContainText('likes 1')
})

test('a logged-in user can delete a blog', async ({ page }) => {
  await createBlog(page)

  await page.getByRole('link', {
    name: `${blog.title} by ${blog.author}`
  }).click()

  page.once('dialog', dialog => dialog.accept())
  await page.getByRole('button', { name: 'remove' }).click()

  await expect(
    page.getByRole('link', { name: `${blog.title} by ${blog.author}` })
  ).toHaveCount(0)
})