import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import BlogView from './BlogView'

afterEach(cleanup)

const blog = {
  id: 'blog-1',
  title: 'Testing with React',
  author: 'Test Author',
  url: 'https://example.com/testing',
  likes: 5,
  user: {
    username: 'creator',
    name: 'Blog Creator'
  }
}

const renderBlogView = user => {
  render(
    <MemoryRouter initialEntries={['/blogs/blog-1']}>
      <Routes>
        <Route
          path="/blogs/:id"
          element={
            <BlogView
              blogs={[blog]}
              blogsLoaded={true}
              user={user}
              onLike={vi.fn()}
              onDelete={vi.fn()}
            />
          }
        />
      </Routes>
    </MemoryRouter>
  )
}

describe('BlogView', () => {
  test('shows blog information to an unauthenticated user without buttons', () => {
    renderBlogView(null)

    expect(
      screen.getByRole('heading', {
        name: 'Test Author: Testing with React'
      })
    ).toBeTruthy()

    expect(
      screen.getByRole('link', {
        name: 'https://example.com/testing'
      })
    ).toBeTruthy()

    expect(screen.getByText('likes 5')).toBeTruthy()
    expect(screen.getByText('Added by Blog Creator')).toBeTruthy()

    expect(
      screen.queryByRole('button', { name: 'like' })
    ).toBeNull()

    expect(
      screen.queryByRole('button', { name: 'remove' })
    ).toBeNull()
  })

  test('shows only the like button to a logged-in user who did not create the blog', () => {
    renderBlogView({
      username: 'another-user',
      name: 'Another User',
      token: 'test-token'
    })

    expect(
      screen.getByRole('button', { name: 'like' })
    ).toBeTruthy()

    expect(
      screen.queryByRole('button', { name: 'remove' })
    ).toBeNull()
  })

  test('shows the like and remove buttons to the blog creator', () => {
    renderBlogView({
      username: 'creator',
      name: 'Blog Creator',
      token: 'test-token'
    })

    expect(
      screen.getByRole('button', { name: 'like' })
    ).toBeTruthy()

    expect(
      screen.getByRole('button', { name: 'remove' })
    ).toBeTruthy()
  })
})