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

export default {
  getAll,
  login
}