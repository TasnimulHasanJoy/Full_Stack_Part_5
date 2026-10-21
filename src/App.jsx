import { useEffect, useState } from 'react'
import Blog from './components/Blog'
import BlogForm from './components/BlogForm'
import blogService from './services/blogs'

const Notification = ({ notification }) => {
  if (notification === null) {
    return null
  }

  const style = {
    color: notification.type === 'error' ? 'red' : 'green',
    backgroundColor: '#ddd',
    border: `3px solid ${notification.type === 'error' ? 'red' : 'green'}`,
    borderRadius: '5px',
    padding: '10px',
    marginBottom: '10px'
  }

  return <div style={style}>{notification.message}</div>
}

const App = () => {
  const [blogs, setBlogs] = useState([])

  const [user, setUser] = useState(() => {
    const savedUser = window.localStorage.getItem('loggedBlogappUser')
    return savedUser ? JSON.parse(savedUser) : null
  })

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    if (user) {
      blogService.getAll().then(blogsFromServer => {
        setBlogs(blogsFromServer)
      })
    }
  }, [user])

  useEffect(() => {
    if (notification === null) {
      return
    }

    const timer = window.setTimeout(() => {
      setNotification(null)
    }, 5000)

    return () => window.clearTimeout(timer)
  }, [notification])

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
      setNotification(null)
    } catch (error) {
      setNotification({
        message: 'Wrong username or password',
        type: 'error'
      })
    }
  }

  const handleLogout = () => {
    window.localStorage.removeItem('loggedBlogappUser')
    setUser(null)
    setBlogs([])
    setShowForm(false)
    setNotification(null)
  }

  const handleCreateBlog = async newBlog => {
    try {
      const createdBlog = await blogService.create(newBlog, user.token)

      setBlogs(blogs.concat(createdBlog))
      setShowForm(false)
      setNotification({
        message: `${createdBlog.title} by ${createdBlog.author} added`,
        type: 'success'
      })

      return true
    } catch (error) {
      setNotification({
        message: 'Could not create blog',
        type: 'error'
      })

      return false
    }
  }

  const handleLike = async blog => {
    const blogWithOneMoreLike = {
      ...blog,
      likes: blog.likes + 1
    }

    try {
      const updatedBlog = await blogService.update(
        blogWithOneMoreLike,
        user.token
      )

      setBlogs(blogs.map(currentBlog =>
        currentBlog.id === updatedBlog.id
          ? { ...updatedBlog, user: currentBlog.user }
          : currentBlog
      ))
    } catch (error) {
      setNotification({
        message: 'Could not like the blog',
        type: 'error'
      })
    }
  }

  if (user === null) {
    return (
      <div>
        <Notification notification={notification} />

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
      <Notification notification={notification} />

      <h2>blogs</h2>

      <p>
        {user.name} logged in{' '}
        <button onClick={handleLogout}>logout</button>
      </p>

      {showForm ? (
        <BlogForm
          createBlog={handleCreateBlog}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <button onClick={() => setShowForm(true)}>create new blog</button>
      )}

      {blogs.map(blog => (
        <Blog key={blog.id} blog={blog} onLike={handleLike} />
      ))}
    </div>
  )
}

export default App