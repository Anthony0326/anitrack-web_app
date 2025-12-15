import axios from 'axios'

export async function getAnalytics() {
  try {
    const res = await axios.get('/analytics/dashboard')
    return res.data?.data || res.data
  } catch (e) {
    console.error('Failed to fetch analytics', e)
    return null
  }
}

export async function getFarmerRankings() {
  try {
    const res = await axios.get('/analytics/farmer-rankings')
    return res.data?.data || res.data || []
  } catch (e) {
    console.error('Failed to fetch farmer rankings', e)
    return []
  }
}

export async function getHarvests() {
  try {
    const res = await axios.get('/harvests')
    return res.data?.data || res.data || []
  } catch (e) {
    console.error('Failed to fetch harvests', e)
    return []
  }
}

export default {
  getAnalytics,
  getFarmerRankings,
  getHarvests
}
