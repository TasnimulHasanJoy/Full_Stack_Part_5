import { useEffect, useState } from 'react'
import Blog from './components/Blog'
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
  const [newTitle, setNewTitle] = useState('')
  const [newAuthor, setNewAuthor] = useState('')
  const [newUrl, setNewUrl] = useState('')
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
    setNotification(null)
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

      setNotification({
        message: `${createdBlog.title} by ${createdBlog.author} added`,
        type: 'success'
      })
    } catch (error) {
      setNotification({
        message: 'Could not create blog',
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