import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Blog from './Blog'

describe('Blog component', () => {
  it('renders title and author, but not URL or likes by default', () => {
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
})