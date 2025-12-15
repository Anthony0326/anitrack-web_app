import axios from 'axios'

export async function getUsers() {
  try {
    const res = await axios.get('/users')
    return res.data?.data || res.data || []
  } catch (e) {
    console.error('Failed to fetch users', e)
    return []
  }
}

export async function getUserById(id) {
  const res = await axios.get(`/users/${id}`)
  return res.data?.data || res.data
}

export async function createUser(userData) {
  const res = await axios.post('/users', userData)
  return res.data?.data || res.data
}

export async function updateUser(id, userData) {
  const res = await axios.put(`/users/${id}`, userData)
  return res.data?.data || res.data
}

export async function deleteUser(id) {
  return await axios.delete(`/users/${id}`)
}

export default {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
}
