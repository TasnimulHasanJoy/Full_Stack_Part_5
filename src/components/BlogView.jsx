import { Navigate, useParams } from 'react-router-dom'

const BlogView = ({ blogs, blogsLoaded, user, onLike, onDelete }) => {
  const { id } = useParams()
  const blog = blogs.find(currentBlog => currentBlog.id === id)

  if (!blogsLoaded) {
    return <p>Loading blog...</p>
  }

  if (!blog) {
    return <Navigate to="/" replace />
  }

  const canDelete = blog.user?.username === user?.username

  return (
    <div className="blog-details">
      <h3>
        {blog.author}: {blog.title}
      </h3>

      <div>
        <a href={blog.url}>{blog.url}</a>
      </div>

      <div>
        likes {blog.likes}{' '}
        {user !== null && (
          <button type="button" onClick={() => onLike(blog)}>
            like
          </button>
        )}
      </div>

      <div>Added by {blog.user?.name}</div>

      {canDelete && (
        <button type="button" onClick={() => onDelete(blog)}>
          remove
        </button>
      )}
    </div>
  )
}

export default BlogView