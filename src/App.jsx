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
import './App.css'

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
  <section className="form-container login-container">
    <h2>Log in to application</h2>

    <form className="styled-form login-form" onSubmit={handleLogin}>
      <input
        className="styled-input login-input"
        type="text"
        placeholder="username"
        aria-label="username"
        value={username}
        onChange={event => setUsername(event.target.value)}
      />

      <input
        className="styled-input login-input"
        type="password"
        placeholder="password"
        aria-label="password"
        value={password}
        onChange={event => setPassword(event.target.value)}
      />

      <button className="styled-button" type="submit">
        login
      </button>
    </form>
  </section>
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
    setNotification(null)
    navigate('/')
  }

  const handleCreateBlog = async newBlog => {
    try {
      const createdBlog = await blogService.create(newBlog, user.token)

      const blogWithCreator = {
        ...createdBlog,
        user: {
          username: user.username,
          name: user.name
        }
      }

      setBlogs(currentBlogs => currentBlogs.concat(blogWithCreator))
      setNotification({
        message: `${createdBlog.title} by ${createdBlog.author} added`,
        type: 'success'
      })
      navigate('/')

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

    const updatedBlog = {
      ...blog,
      likes: blog.likes + 1
    }

    setBlogs(currentBlogs =>
      currentBlogs.map(currentBlog =>
        currentBlog.id === blog.id
          ? { ...currentBlog, likes: updatedBlog.likes }
          : currentBlog
      )
    )

    try {
      await blogService.update(updatedBlog, user.token)
    } catch {
      setBlogs(currentBlogs =>
        currentBlogs.map(currentBlog =>
          currentBlog.id === blog.id
            ? { ...currentBlog, likes: blog.likes }
            : currentBlog
        )
      )

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
    <div className="app">
      <nav className="navigation">
        <Link to="/">blogs</Link>
        {' '}

        {user === null ? (
          <Link to="/login">login</Link>
        ) : (
          <>
            <Link to="/create">new blog</Link>
            {' '}
            <button type="button" onClick={handleLogout}>
              logout
            </button>
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

              <ul>
                {sortedBlogs.map(blog => (
                  <Blog key={blog.id} blog={blog} />
                ))}
              </ul>
            </div>
          }
        />

        <Route
          path="/create"
          element={
            user === null ? (
              <Navigate to="/login" replace />
            ) : (
              <section className="form-container create-container">
                <h2>create new</h2>
                <BlogForm
                  createBlog={handleCreateBlog}
                  onCancel={() => navigate('/')}
                />
              </section>
            )
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