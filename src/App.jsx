import { useEffect, useState } from 'react'
import {
  Link,
  Navigate,
  Route,
  Routes,
  useNavigate
} from 'react-router-dom'
import Blog from './components/Blog'
import BlogForm from './components/BlogForm'
import BlogView from './components/BlogView'
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

const LoginForm = ({
  handleLogin,
  username,
  setUsername,
  password,
  setPassword
}) => (
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

const App = () => {
  const navigate = useNavigate()
  const [blogs, setBlogs] = useState([])
  const [blogsLoaded, setBlogsLoaded] = useState(false)

  const [user, setUser] = useState(() => {
    const savedUser = window.localStorage.getItem('loggedBlogappUser')
    return savedUser ? JSON.parse(savedUser) : null
  })

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    blogService.getAll()
      .then(blogsFromServer => {
        setBlogs(blogsFromServer)
        setBlogsLoaded(true)
      })
      .catch(() => {
        setNotification({
          message: 'Could not load blogs',
          type: 'error'
        })
        setBlogsLoaded(true)
      })
  }, [])

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
      navigate('/')
    } catch {
      setNotification({
        message: 'Wrong username or password',
        type: 'error'
      })
    }
  }

  const handleLogout = () => {
    window.localStorage.removeItem('loggedBlogappUser')
    setUser(null)
    setShowForm(false)
    setNotification(null)
    navigate('/')
  }

  const handleCreateBlog = async newBlog => {
    try {
      const createdBlog = await blogService.create(newBlog, user.token)

      setBlogs(currentBlogs => currentBlogs.concat(createdBlog))
      setShowForm(false)
      setNotification({
        message: `${createdBlog.title} by ${createdBlog.author} added`,
        type: 'success'
      })

      return true
    } catch {
      setNotification({
        message: 'Could not create blog',
        type: 'error'
      })

      return false
    }
  }

  const handleLike = async blog => {
    if (user === null) {
      return
    }

    const blogWithOneMoreLike = {
      ...blog,
      likes: blog.likes + 1
    }

    try {
      const updatedBlog = await blogService.update(
        blogWithOneMoreLike,
        user.token
      )

      setBlogs(currentBlogs =>
        currentBlogs.map(currentBlog =>
          currentBlog.id === updatedBlog.id
            ? { ...updatedBlog, user: currentBlog.user }
            : currentBlog
        )
      )
    } catch {
      setNotification({
        message: 'Could not like the blog',
        type: 'error'
      })
    }
  }

  const handleDelete = async blog => {
    const confirmed = window.confirm(
      `Remove blog ${blog.title} by ${blog.author}?`
    )

    if (!confirmed) {
      return
    }

    try {
      await blogService.remove(blog.id, user.token)

      setBlogs(currentBlogs =>
        currentBlogs.filter(currentBlog => currentBlog.id !== blog.id)
      )

      setNotification({
        message: `${blog.title} by ${blog.author} removed`,
        type: 'success'
      })

      navigate('/')
    } catch {
      setNotification({
        message: 'Could not remove blog',
        type: 'error'
      })
    }
  }

  const sortedBlogs = [...blogs].sort(
    (first, second) => second.likes - first.likes
  )

  return (
    <div>
      <nav>
        <Link to="/">blogs</Link>
        {' '}

        {user === null ? (
          <Link to="/login">login</Link>
        ) : (
          <>
            <button type="button" onClick={handleLogout}>logout</button>
          </>
        )}
      </nav>

      <Notification notification={notification} />

      <Routes>
        <Route
          path="/"
          element={
            <div>
              <h2>blogs</h2>

              {user !== null && (
                showForm ? (
                  <BlogForm
                    createBlog={handleCreateBlog}
                    onCancel={() => setShowForm(false)}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowForm(true)}
                  >
                    create new blog
                  </button>
                )
              )}

              <ul>
                {sortedBlogs.map(blog => (
                  <Blog key={blog.id} blog={blog} />
                ))}
              </ul>
            </div>
          }
        />

        <Route
          path="/login"
          element={
            user !== null ? (
              <Navigate to="/" replace />
            ) : (
              <LoginForm
                handleLogin={handleLogin}
                username={username}
                setUsername={setUsername}
                password={password}
                setPassword={setPassword}
              />
            )
          }
        />

        <Route
          path="/blogs/:id"
          element={
            <BlogView
              blogs={blogs}
              blogsLoaded={blogsLoaded}
              user={user}
              onLike={handleLike}
              onDelete={handleDelete}
            />
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App