import { useEffect, useState } from 'react'
import Blog from './components/Blog'
import blogService from './services/blogs'

const App = () => {
  const [blogs, setBlogs] = useState([])

  const [user, setUser] = useState(() => {
    const savedUser = window.localStorage.getItem('loggedBlogappUser')
    return savedUser ? JSON.parse(savedUser) : null
  })

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const [newTitle, setNewTitle] = useState('')
  const [newAuthor, setNewAuthor] = useState('')
  const [newUrl, setNewUrl] = useState('')

  useEffect(() => {
    if (user) {
      blogService.getAll().then(blogsFromServer => {
        setBlogs(blogsFromServer)
      })
    }
  }, [user])

  const handleLogin = async event => {
    event.preventDefault()

    try {
      const loggedInUser = await blogService.login({
        username,
        password
      })

      window.localStorage.setItem(
        'loggedBlogappUser',
        JSON.stringify(loggedInUser)
      )

      setUser(loggedInUser)
      setUsername('')
      setPassword('')
    } catch (error) {
      window.alert('Wrong username or password')
    }
  }

  const handleLogout = () => {
    window.localStorage.removeItem('loggedBlogappUser')
    setUser(null)
    setBlogs([])
  }

  const handleCreateBlog = async event => {
    event.preventDefault()

    const newBlog = {
      title: newTitle,
      author: newAuthor,
      url: newUrl
    }

    try {
      const createdBlog = await blogService.create(newBlog, user.token)
      setBlogs(blogs.concat(createdBlog))
      setNewTitle('')
      setNewAuthor('')
      setNewUrl('')
    } catch (error) {
      window.alert('Could not create the blog')
    }
  }

  if (user === null) {
    return (
      <div>
        <h2>Log in to application</h2>

        <form onSubmit={handleLogin}>
          <div>
            username
            <input
              type="text"
              value={username}
              onChange={event => setUsername(event.target.value)}
            />
          </div>

          <div>
            password
            <input
              type="password"
              value={password}
              onChange={event => setPassword(event.target.value)}
            />
          </div>

          <button type="submit">login</button>
        </form>
      </div>
    )
  }

  return (
    <div>
      <h2>blogs</h2>

      <p>
        {user.name} logged in{' '}
        <button onClick={handleLogout}>logout</button>
      </p>

      <h2>create new</h2>

      <form onSubmit={handleCreateBlog}>
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
      </form>

      {blogs.map(blog => (
        <Blog key={blog.id} blog={blog} />
      ))}
    </div>
  )
}

export default App