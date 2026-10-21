import { useState } from 'react'

const BlogForm = ({ createBlog, onCancel }) => {
  const [newTitle, setNewTitle] = useState('')
  const [newAuthor, setNewAuthor] = useState('')
  const [newUrl, setNewUrl] = useState('')

  const handleSubmit = async event => {
    event.preventDefault()

    const blog = {
      title: newTitle,
      author: newAuthor,
      url: newUrl
    }

    const success = await createBlog(blog)

    if (success) {
      setNewTitle('')
      setNewAuthor('')
      setNewUrl('')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>create new</h2>

      <div>
        title:
        <input
          type="text"
          value={newTitle}
          onChange={event => setNewTitle(event.target.value)}
        />
      </div>

      <div>
        author:
        <input
          type="text"
          value={newAuthor}
          onChange={event => setNewAuthor(event.target.value)}
        />
      </div>

      <div>
        url:
        <input
          type="text"
          value={newUrl}
          onChange={event => setNewUrl(event.target.value)}
        />
      </div>

      <button type="submit">create</button>
      <button type="button" onClick={onCancel}>cancel</button>
    </form>
  )
}

export default BlogForm