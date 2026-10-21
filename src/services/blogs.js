import axios from 'axios'

const baseUrl = '/api/blogs'
const loginUrl = '/api/login'

const getAll = async () => {
  const response = await axios.get(baseUrl)
  return response.data
}

const login = async credentials => {
  const response = await axios.post(loginUrl, credentials)
  return response.data
}

const create = async (newBlog, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }

  const response = await axios.post(baseUrl, newBlog, config)
  return response.data
}

const update = async (blog, token) => {
  const userId = blog.user?.id || blog.user?._id || blog.user

  const updatedBlog = {
    user: userId,
    likes: blog.likes,
    author: blog.author,
    title: blog.title,
    url: blog.url
  }

  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }

  const response = await axios.put(`${baseUrl}/${blog.id}`, updatedBlog, config)
  return response.data
}

export default {
  getAll,
  login,
  create,
  update
}