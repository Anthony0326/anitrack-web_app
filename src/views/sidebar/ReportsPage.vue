<template>
  <div class="reports-container">
    <div class="reports-header">
      <h1>Farm Reports & Analytics</h1>
      <div class="header-actions">
        <select v-model="selectedMunicipality" @change="fetchReports" class="period-selector">
          <option value="all">All Municipalities</option>
          <option v-for="muni in municipalities" :key="muni" :value="muni">
            {{ muni }}
          </option>
        </select>
        <button @click="exportReport" class="btn-export" :disabled="loading">
          {{ loading ? 'Loading...' : 'Export CSV' }}
        </button>
      </div>
    </div>

    <div v-if="error" class="error-banner">{{ error }}</div>
    <div v-if="loading" class="loading-spinner">Loading report data...</div>

    <!-- Report Stats Grid -->
    <div class="stats-grid" v-if="!loading">
      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-label">ESTIMATED REVENUE</span>
          <span class="stat-icon">💰</span>
        </div>
        <div class="stat-value">₱{{ reports.totalRevenue.toLocaleString() }}</div>
        <div class="stat-subtitle">at ₱50/kg rate</div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-label">TOTAL HARVEST</span>
          <span class="stat-icon">🌾</span>
        </div>
        <div class="stat-value">{{ Number(reports.totalHarvest).toLocaleString() }}</div>
        <div class="stat-subtitle">kg harvested</div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-label">AVERAGE YIELD</span>
          <span class="stat-icon">📈</span>
        </div>
        <div class="stat-value">{{ reports.averageYield }}</div>
        <div class="stat-subtitle">kg per harvest</div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-label">TOTAL FARMS</span>
          <span class="stat-icon">🏞️</span>
        </div>
        <div class="stat-value">{{ reports.totalFarms }}</div>
        <div class="stat-subtitle">registered farms</div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-label">ACTIVE FARMS</span>
          <span class="stat-icon">✅</span>
        </div>
        <div class="stat-value">{{ reports.activeUsers }}</div>
        <div class="stat-subtitle">currently active</div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-label">AVERAGE HARVEST</span>
          <span class="stat-icon">📊</span>
        </div>
        <div class="stat-value">{{ reports.avgTransaction }}</div>
        <div class="stat-subtitle">kg per transaction</div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="charts-section" v-if="!loading">
      <div class="chart-containers chart-resizable">
        <div class="chart-header">
          <h3>Activity Trend</h3>
        </div>
        <Line v-if="activityChartData" :data="activityChartData" :options="{ responsive: true, maintainAspectRatio: false }" :style="{ height: chartHeights.activity + 'px' }" />
        <div v-else class="chart-placeholder">Loading chart...</div>
      </div>

      <!-- <div class="chart-containers chart-resizable">
        <div class="chart-header">
          <h3>Harvest Distribution</h3>
        </div>
        <Doughnut v-if="harvestChartData" :data="harvestChartData" :options="{ responsive: true, maintainAspectRatio: false }" :style="{ height: chartHeights.harvest + 'px' }" />
        <div v-else class="chart-placeholder pie-chart">Loading chart...</div>
      </div> -->
    </div>

    <!-- Report Details -->
    <div class="details-section card" v-if="!loading">
      <div class="section-header">
        <h3>Harvest by Municipality</h3>
        <span class="record-count">{{ reportDetails.length }} municipalities</span>
      </div>
      <table class="report-table" v-if="reportDetails.length > 0">
        <thead>
          <tr>
            <th>Municipality</th>
            <th>Total Revenue (₱)</th>
            <th>Harvest Count</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in reportDetails" :key="item.id">
            <td>{{ item.category }}</td>
            <td>{{ item.amount.toLocaleString() }}</td>
            <td>{{ item.percentage }}</td>
            <td><span :class="['status', item.status]">{{ item.status }}</span></td>
          </tr>
        </tbody>
      </table>
      <div v-else class="empty-state">
        No harvest data available for selected municipality
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler } from 'chart.js'
import { Line } from 'vue-chartjs'
import axios from 'axios'
import Swal from 'sweetalert2'
import { calculateActivityTrend, calculateHarvestDistribution } from '@/services/chartService'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler)

const selectedPeriod = ref('monthly')
const selectedMunicipality = ref('all')
const error = ref(null)
const loading = ref(false)

const farms = ref([])
const harvests = ref([])
const municipalities = ref([])

const reports = ref({
  totalRevenue: 0,
  totalHarvest: 0,
  averageYield: 0,
  totalFarms: 0,
  activeUsers: 0,
  avgTransaction: 0
})

const reportDetails = ref([])
const activityChartData = ref(null)
const harvestChartData = ref(null)

const chartHeights = ref({
  activity: 300,
  harvest: 300
})

// Computed property for filtered harvests
const filteredHarvests = computed(() => {
  if (selectedMunicipality.value === 'all') {
    return harvests.value
  }
  return harvests.value.filter(h => h.municipality === selectedMunicipality.value)
})

const fetchReports = async () => {
  try {
    loading.value = true
    error.value = null
    
    // Fetch farms and harvests
    const farmsRes = await axios.get('/farms')
    const harvestsRes = await axios.get('/harvests')
    
    farms.value = farmsRes.data?.data || farmsRes.data || []
    harvests.value = harvestsRes.data?.data || harvestsRes.data || []
    
    // Extract unique municipalities
    const munis = [...new Set(farms.value.map(f => f.municipality || f.farmer?.municipality).filter(Boolean))]
    municipalities.value = munis
    
    // Compute reports from filtered harvests
    const filtered = filteredHarvests.value
    
    const totalYield = filtered.reduce((sum, h) => sum + (parseFloat(h.yield_kg || 0) || 0), 0)
    const avgYield = filtered.length > 0 ? (totalYield / filtered.length).toFixed(2) : 0
    
    // Estimate revenue at 50 pesos per kg
    const estimatedRevenue = totalYield * 50
    
    reports.value = {
      totalRevenue: Math.round(estimatedRevenue),
      totalHarvest: totalYield.toFixed(2),
      averageYield: avgYield,
      totalFarms: farms.value.length,
      activeUsers: farms.value.filter(f => f.is_active).length,
      avgTransaction: filtered.length > 0 ? Math.round(totalYield / filtered.length) : 0
    }
    
    // Build report details by municipality
    const muniData = {}
    filtered.forEach(h => {
      const muni = h.municipality || 'Unknown'
      if (!muniData[muni]) {
        muniData[muni] = { yield: 0, count: 0, revenue: 0 }
      }
      muniData[muni].yield += parseFloat(h.yield_kg || 0) || 0
      muniData[muni].count += 1
      muniData[muni].revenue += (parseFloat(h.yield_kg || 0) || 0) * 50
    })
    
    reportDetails.value = Object.entries(muniData).map(([muni, data], idx) => ({
      id: idx + 1,
      category: muni,
      amount: Math.round(data.revenue),
      percentage: data.count,
      status: data.revenue > 50000 ? 'on-track' : 'warning'
    }))
    
    // Calculate chart data
    activityChartData.value = calculateActivityTrend(filtered)
    harvestChartData.value = calculateHarvestDistribution(filtered)
    
  } catch (err) {
    console.error('Reports error:', err)
    error.value = 'Failed to load reports. Please try again.'
  } finally {
    loading.value = false
  }
}

const exportReport = async () => {
  try {
    const csvContent = generateCSV()
    downloadCSV(csvContent, `farm-report-${selectedPeriod.value}.csv`)
    
    await Swal.fire({
      icon: 'success',
      title: 'Export Successful',
      text: `${selectedPeriod.value} report exported successfully`,
      timer: 2000
    })
  } catch (err) {
    console.error('Export error:', err)
    await Swal.fire({
      icon: 'error',
      title: 'Export Failed',
      text: 'Failed to export report'
    })
  }
}

const generateCSV = () => {
  let csv = 'Farm Report\n'
  csv += `Period: ${selectedPeriod.value}\n`
  csv += `Generated: ${new Date().toLocaleString()}\n\n`
  
  csv += 'Summary Metrics\n'
  csv += 'Total Revenue,' + reports.value.totalRevenue + '\n'
  csv += 'Total Harvest (kg),' + reports.value.totalHarvest + '\n'
  csv += 'Average Yield (kg),' + reports.value.averageYield + '\n'
  csv += 'Total Farms,' + reports.value.totalFarms + '\n\n'
  
  csv += 'By Municipality\n'
  csv += 'Municipality,Revenue,Harvest Count,Status\n'
  reportDetails.value.forEach(item => {
    csv += `"${item.category}",${item.amount},${item.percentage},"${item.status}"\n`
  })
  
  return csv
}

const downloadCSV = (csv, filename) => {
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  window.URL.revokeObjectURL(url)
}

onMounted(() => {
  fetchReports()
})
</script>

<style scoped>
:root {
  --primary: #1b5e20;
  --accent: #2e7d32;
  --card-bg: #ffffff;
  --border: #ecf0f1;
  --text: #2c3e50;
  --text-light: #95a5a6;
}

.reports-container {
  min-height: 100vh;
  max-width: 1240px;
  background: linear-gradient(135deg, #f5f3ee 0%, #e8e4d9 100%);
  padding: 30px 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.reports-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
}

.reports-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 16px;
  align-items: center;
}

.period-selector {
  padding: 8px 16px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--card-bg);
  cursor: pointer;
  font-size: 0.95rem;
  color: var(--text);
}

.btn-export {
  padding: 8px 16px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s ease;
}

.btn-export:hover:not(:disabled) {
  background: var(--primary);
}

.btn-export:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-banner {
  background: #fee;
  color: #c33;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 24px;
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
}

.loading-spinner {
  text-align: center;
  padding: 40px;
  color: var(--text-light);
  font-size: 1.1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 40px;
}

.stat-card {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.stat-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-light);
  text-transform: uppercase;
}

.stat-icon {
  font-size: 1.5rem;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 8px;
}

.stat-subtitle {
  font-size: 0.9rem;
  color: var(--text-light);
}

.charts-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  max-height: 1800px;
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 40px;
}

.chart-container {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.chart-containers {
    background: var(--card-bg);
    max-height: 400px;
    border-radius: 12px;
    padding: 50px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.chart-header h3 {
  margin: 0 0 16px 0;
  color: var(--text);
  font-size: 1.2rem;
}

.chart-size-slider {
  width: 120px;
  cursor: pointer;
}

.chart-placeholder {
  max-height: 1000px;
  background: linear-gradient(135deg, #004bbbbb 0%, #e9ecef 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-light);
  font-size: 0.95rem;
  border: 2px dashed var(--border);
}

.pie-chart {
  max-height: 1000px;
}

.details-section {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  margin: 0;
  color: var(--text);
}

.record-count {
  background: #f0f0f0;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  color: var(--text-light);
}

.report-table {
  width: 100%;
  border-collapse: collapse;
}

.report-table thead {
  background: #f8f9fa;
}

.report-table th, .report-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid var(--border);
}

.report-table th {
  font-weight: 600;
  color: var(--text);
  font-size: 0.95rem;
}

.report-table tbody tr:hover {
  background: #fafafa;
}

.status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 600;
}

.status.on-track {
  background: #d4edda;
  color: #155724;
}

.status.warning {
  background: #fff3cd;
  color: #856404;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-light);
  font-size: 1rem;
}

.card {
  background: white;
}

@media (max-width: 768px) {
  .reports-container {
    padding: 16px;
  }

  .reports-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .header-actions {
    width: 100%;
    flex-direction: column;
  }

  .period-selector {
    width: 100%;
  }

  .btn-export {
    width: 100%;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>