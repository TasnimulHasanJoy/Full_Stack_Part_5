import { Link } from 'react-router-dom'

const Blog = ({ blog }) => (
  <li className="blog">
    <Link to={`/blogs/${blog.id}`}>
      {blog.title} by {blog.author}
    </Link>
  </li>
)

export default Blog