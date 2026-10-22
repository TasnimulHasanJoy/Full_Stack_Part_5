import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import BlogForm from './BlogForm'

afterEach(() => {
  cleanup()
})

describe('BlogForm component', () => {
  it('calls the event handler with the right details when a new blog is created', async () => {
    const createBlog = vi.fn().mockResolvedValue(true)

    const { container } = render(
      <BlogForm
        createBlog={createBlog}
        onCancel={() => {}}
      />
    )

    const inputs = container.querySelectorAll('input')

    fireEvent.change(inputs[0], {
      target: { value: 'Testing React forms' }
    })
    fireEvent.change(inputs[1], {
      target: { value: 'Test Author' }
    })
    fireEvent.change(inputs[2], {
      target: { value: 'https://example.com/blog' }
    })

    fireEvent.click(screen.getByRole('button', { name: 'create' }))

    await waitFor(() => {
      expect(createBlog).toHaveBeenCalledWith({
        title: 'Testing React forms',
        author: 'Test Author',
        url: 'https://example.com/blog'
      })
    })
  })
})