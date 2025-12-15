import axios from 'axios'

/**
 * Comprehensive service for calculating chart data and analytics
 */

export async function getFarmsAndHarvests() {
  try {
    const [farmsRes, harvestsRes] = await Promise.all([
      axios.get('/farms'),
      axios.get('/harvests')
    ])
    
    const farms = farmsRes.data?.data || farmsRes.data || []
    const harvests = harvestsRes.data?.data || harvestsRes.data || []
    
    return { farms, harvests }
  } catch (e) {
    console.error('Error fetching farms and harvests:', e)
    return { farms: [], harvests: [] }
  }
}

/**
 * Calculate activity trend data for line charts
 * Returns data grouped by date
 */
export function calculateActivityTrend(harvests) {
  if (!Array.isArray(harvests) || harvests.length === 0) {
    // Return mock data if no harvests
    return {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'],
      datasets: [
        {
          label: 'Harvests',
          data: [12, 19, 3, 5, 2],
          borderColor: '#1b5e20',
          backgroundColor: 'rgba(27, 94, 32, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'New Farms',
          data: [5, 8, 4, 6, 3],
          borderColor: '#2e7d32',
          backgroundColor: 'rgba(46, 125, 50, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    }
  }

  // Group harvests by week
  const weeks = {}
  harvests.forEach(h => {
    const date = new Date(h.created_at || h.date)
    const weekNum = getWeekNumber(date)
    const key = `Week ${weekNum}`
    
    if (!weeks[key]) weeks[key] = 0
    weeks[key] += 1
  })

  const labels = Object.keys(weeks).slice(-5) // Last 5 weeks
  const data = labels.map(label => weeks[label] || 0)

  return {
    labels,
    datasets: [
      {
        label: 'Harvests',
        data,
        borderColor: '#1b5e20',
        backgroundColor: 'rgba(27, 94, 32, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  }
}

/**
 * Calculate user distribution data for pie/doughnut charts
 */
export function calculateUserDistribution(farms) {
  if (!Array.isArray(farms) || farms.length === 0) {
    return {
      labels: ['Active', 'Inactive'],
      datasets: [
        {
          data: [65, 35],
          backgroundColor: ['#1b5e20', '#e0e0e0'],
          borderColor: ['#fff', '#fff'],
          borderWidth: 2
        }
      ]
    }
  }

  const active = farms.filter(f => f.is_active).length
  const inactive = farms.length - active

  return {
    labels: ['Active Farms', 'Inactive Farms'],
    datasets: [
      {
        data: [active, inactive],
        backgroundColor: ['#1b5e20', '#e0e0e0'],
        borderColor: ['#fff', '#fff'],
        borderWidth: 2
      }
    ]
  }
}

/**
 * Calculate harvest distribution by crop type
 */
export function calculateHarvestDistribution(harvests) {
  if (!Array.isArray(harvests) || harvests.length === 0) {
    return {
      labels: ['Rice', 'Corn', 'Sugarcane', 'Others'],
      datasets: [
        {
          data: [30, 25, 20, 25],
          backgroundColor: [
            '#1b5e20',
            '#2e7d32',
            '#558b2f',
            '#9ccc65'
          ],
          borderColor: '#fff',
          borderWidth: 2
        }
      ]
    }
  }

  const cropData = {}
  harvests.forEach(h => {
    const crop = h.crop_type || 'Unknown'
    if (!cropData[crop]) cropData[crop] = 0
    cropData[crop] += parseFloat(h.yield_kg || 0)
  })

  const labels = Object.keys(cropData)
  const data = Object.values(cropData)
  const colors = ['#1b5e20', '#2e7d32', '#558b2f', '#9ccc65', '#7cb342']

  return {
    labels,
    datasets: [
      {
        data,
        backgroundColor: colors.slice(0, labels.length),
        borderColor: '#fff',
        borderWidth: 2
      }
    ]
  }
}

/**
 * Calculate summary statistics
 */
export function calculateStats(farms, harvests) {
  const stats = {
    totalFarms: Array.isArray(farms) ? farms.length : 0,
    activeFarms: Array.isArray(farms) ? farms.filter(f => f.is_active).length : 0,
    inactiveFarms: Array.isArray(farms) ? farms.filter(f => !f.is_active).length : 0,
    totalHarvest: 0,
    averageYield: 0,
    totalArea: 0,
    activeUsers: 0,
    pendingApprovals: 0
  }

  if (Array.isArray(farms) && farms.length > 0) {
    stats.totalArea = farms.reduce((sum, f) => sum + (parseFloat(f.total_area || 0) || 0), 0)
    stats.activeUsers = farms.filter(f => f.is_active).length
    stats.pendingApprovals = farms.filter(f => !f.is_approved).length
  }

  if (Array.isArray(harvests) && harvests.length > 0) {
    const totalYield = harvests.reduce((sum, h) => sum + (parseFloat(h.yield_kg || 0) || 0), 0)
    stats.totalHarvest = Math.round(totalYield)
    stats.averageYield = (totalYield / harvests.length).toFixed(2)
  }

  return stats
}

/**
 * Calculate municipality-wise data
 */
export function calculateMunicipalityData(farms, harvests) {
  const muniMap = {}

  // Gather farm data by municipality
  if (Array.isArray(farms)) {
    farms.forEach(f => {
      const muni = f.municipality || f.farmer?.municipality || 'Unknown'
      if (!muniMap[muni]) {
        muniMap[muni] = {
          farms: 0,
          area: 0,
          harvests: 0,
          yield: 0,
          revenue: 0
        }
      }
      muniMap[muni].farms += 1
      muniMap[muni].area += parseFloat(f.total_area || 0) || 0
    })
  }

  // Add harvest data
  if (Array.isArray(harvests)) {
    harvests.forEach(h => {
      const muni = h.municipality || h.farm?.municipality || 'Unknown'
      if (!muniMap[muni]) {
        muniMap[muni] = {
          farms: 0,
          area: 0,
          harvests: 0,
          yield: 0,
          revenue: 0
        }
      }
      muniMap[muni].harvests += 1
      const yieldKg = parseFloat(h.yield_kg || 0) || 0
      muniMap[muni].yield += yieldKg
      muniMap[muni].revenue += yieldKg * 50 // 50 pesos per kg
    })
  }

  return muniMap
}

/**
 * Helper: Get week number from date
 */
function getWeekNumber(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 4 - (d.getDay() || 7))
  const yearStart = new Date(d.getFullYear(), 0, 1)
  const weekNum = Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
  return weekNum
}

/**
 * Format revenue number
 */
export function formatRevenue(amount) {
  return Math.round(amount).toLocaleString('en-PH', {
    style: 'currency',
    currency: 'PHP'
  })
}

export default {
  getFarmsAndHarvests,
  calculateActivityTrend,
  calculateUserDistribution,
  calculateHarvestDistribution,
  calculateStats,
  calculateMunicipalityData,
  formatRevenue
}
