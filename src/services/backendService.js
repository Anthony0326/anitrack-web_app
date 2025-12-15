import axios from 'axios'

export default {
  async getFarms() {
    const res = await axios.get('/farms')
    return res.data?.data || []
  },
  async getHarvests() {
    const res = await axios.get('/harvests')
    return res.data?.data || []
  },
  async getUserProfile() {
    const res = await axios.get('/user')
    return res.data?.data || res.data || null
  }
}
