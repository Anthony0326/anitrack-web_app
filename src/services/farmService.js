import axios from 'axios'

export async function getFarms() {
  const res = await axios.get('/farms')
  return res.data?.data || res.data || []
}

export async function getFarmById(id) {
  const res = await axios.get(`/farms/${id}`)
  return res.data?.data || res.data
}

export async function createFarm(farmData) {
  const res = await axios.post('/farms', farmData)
  return res.data?.data || res.data
}

export async function updateFarm(id, farmData) {
  const res = await axios.put(`/farms/${id}`, farmData)
  return res.data?.data || res.data
}

export async function deleteFarm(id) {
  const res = await axios.delete(`/farms/${id}`)
  // Handle both wrapped and direct responses
  return res.data?.data || res.data || { success: true }
}

// Legacy support
export async function fetchFarms() {
  return getFarms()
}

export async function fetchFarm(id) {
  return getFarmById(id)
}

export default {
  getFarms,
  getFarmById,
  createFarm,
  updateFarm,
  deleteFarm,
  fetchFarms,
  fetchFarm
}
