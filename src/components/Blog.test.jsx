import {
  cleanup,
  fireEvent,
  render,
  screen
} from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import Blog from './Blog'

afterEach(() => {
  cleanup()
})

describe('Blog component', () => {
  const blog = {
    title: 'Testing React components',
    author: 'Test Author',
    url: 'https://example.com/blog',
    likes: 7,
    user: {
      name: 'Test User',
      username: 'testuser'
    }
  }

  it('renders title and author, but not URL or likes by default', () => {
    const { container } = render(
      <Blog
        blog={blog}
        onLike={() => {}}
        onDelete={() => {}}
        canDelete={false}
      />
    )

    const blogElement = container.querySelector('.blog')
    const displayedText = blogElement.textContent

    expect(displayedText).toContain(blog.title)
    expect(displayedText).toContain(blog.author)
    expect(displayedText).not.toContain(blog.url)
    expect(displayedText).not.toContain(`likes ${blog.likes}`)
  })

  it('shows URL and likes when the view button is clicked', () => {
    render(
      <Blog
        blog={blog}
        onLike={() => {}}
        onDelete={() => {}}
        canDelete={false}
      />
    )

    const viewButton = screen.getByRole('button', { name: 'view' })
    fireEvent.click(viewButton)

    expect(screen.getByText(blog.url)).toBeTruthy()
    expect(screen.getByText(`likes ${blog.likes}`)).toBeTruthy()
  })
})