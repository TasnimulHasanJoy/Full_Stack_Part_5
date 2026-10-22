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
    <article className="blog-details-card">
      <h2 className="blog-details-title">{blog.title}</h2>

      <p className="blog-details-author">by {blog.author}</p>

      <a className="blog-details-url" href={blog.url}>
        {blog.url}
      </a>

      <p className="blog-details-added-by">
        Added by {blog.user?.name}
      </p>

      <div className="blog-details-actions">
        <span className="blog-details-likes">
          likes {blog.likes}
        </span>

        {user !== null && (
          <button
            className="blog-action-button like-button"
            type="button"
            onClick={() => onLike(blog)}
          >
            like
          </button>
        )}

        {canDelete && (
          <button
            className="blog-action-button remove-button"
            type="button"
            onClick={() => onDelete(blog)}
          >
            remove
          </button>
        )}
      </div>
    </article>
  )
}

export default BlogView