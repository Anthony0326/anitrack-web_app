<template>
    <div class="dashboard-page">
        <div class="page-header">
            <h1>Dashboard</h1>
            <button @click="refreshDashboard" class="btn-refresh">Refresh</button>
        </div>

        <div v-if="error" class="error-banner">{{ error }}</div>

        <!-- KPI Stats Grid -->
        <div class="stats-grid">
            <div class="stat-card">
                <span class="stat-label">TOTAL FARMS</span>
                <span class="stat-icon">🌾</span>
                <div class="stat-value">{{ stats.totalFarms }}</div>
                <div class="stat-subtitle">Active farms</div>
            </div>
            <div class="stat-card">
                <span class="stat-label">ACTIVE USERS</span>
                <span class="stat-icon">👥</span>
                <div class="stat-value">{{ stats.activeUsers }}</div>
                <div class="stat-subtitle">Registered farmers</div>
            </div>
            <div class="stat-card">
                <span class="stat-label">PENDING APPROVALS</span>
                <span class="stat-icon">⏳</span>
                <div class="stat-value">{{ stats.pendingApprovals }}</div>
                <div class="stat-subtitle">Awaiting review</div>
            </div>
            <div class="stat-card">
                <span class="stat-label">TOTAL REVENUE</span>
                <span class="stat-icon">💰</span>
                <div class="stat-value">${{ stats.totalRevenue }}</div>
                <div class="stat-subtitle">This month</div>
            </div>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions">
            <router-link to="/main/farms" class="action-btn">📋 View Farms</router-link>
            <router-link to="/main/reports" class="action-btn">📊 Reports</router-link>
        </div>

        <!-- Charts Section -->
        <div class="charts-section">
            <div class="chart-card">
                <div class="chart-header">
                    <h3>Activity Trend</h3>
                </div>
                <Line v-if="activityChartData" :data="activityChartData" :options="{ responsive: true, maintainAspectRatio: false }" :style="{ height: chartHeights.activity + 'px' }" />
                <div v-else class="chart-placeholder">Loading chart...</div>
            </div>
            <div class="chart-card">
                <div class="chart-header">
                    <h3>User Distribution</h3>
                </div>
                <Doughnut v-if="distributionChartData" :data="distributionChartData" :options="{ responsive: true, maintainAspectRatio: false }" :style="{ height: chartHeights.distribution + 'px' }" />
                <div v-else class="chart-placeholder">Loading chart...</div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler } from 'chart.js'
import { Line, Doughnut } from 'vue-chartjs'
import { calculateActivityTrend, calculateUserDistribution, calculateStats, getFarmsAndHarvests } from '@/services/chartService'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler)

const stats = ref({
    totalFarms: 0,
    activeUsers: 0,
    pendingApprovals: 0,
    totalHarvest: 0,
    avgYield: 0,
    riskAlerts: 0,
})

const activityChartData = ref(null)
const distributionChartData = ref(null)

const chartHeights = ref({
    activity: 300,
    distribution: 300
})

const error = ref(null)

const fetchDashboardData = async () => {
    try {
        error.value = null
        const { farms, harvests } = await getFarmsAndHarvests()
        
        const calculatedStats = calculateStats(farms, harvests)
        stats.value = {
            totalFarms: calculatedStats.totalFarms,
            activeUsers: calculatedStats.activeUsers,
            pendingApprovals: calculatedStats.pendingApprovals,
            totalHarvest: calculatedStats.totalHarvest,
            avgYield: calculatedStats.averageYield,
            riskAlerts: Math.floor(Math.random() * 5),
        }

        activityChartData.value = calculateActivityTrend(harvests)
        distributionChartData.value = calculateUserDistribution(farms)
    } catch (err) {
        console.error('Dashboard error:', err)
        error.value = err.response?.data?.message || 'Failed to load dashboard data'
    }
}

const refreshDashboard = () => {
    fetchDashboardData()
}

onMounted(() => {
    fetchDashboardData()
})
</script>

<style scoped>
.dashboard-page {
    padding: 20px;
    background: linear-gradient(135deg, #f5f3ee 0%, #e8e4d9 100%);
    min-height: 100vh;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
}

.page-header h1 {
    font-size: 2rem;
    color: #1b5e20;
    margin: 0;
}

.btn-refresh {
    padding: 0.6rem 1.2rem;
    background: #1b5e20;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: background 0.2s ease;
}

.btn-refresh:hover {
    background: #145a1a;
}

.error-banner {
    background: #fee;
    color: #c33;
    padding: 12px 16px;
    border-radius: 8px;
    margin-bottom: 24px;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}

.stat-card {
    background: white;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-left: 4px solid #1b5e20;
    transition: transform 0.2s ease;
}

.stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-label {
    font-size: 0.85rem;
    font-weight: 600;
    color: #666;
    letter-spacing: 0.5px;
    text-transform: uppercase;
}

.stat-icon {
    font-size: 1.8rem;
    display: block;
    margin: 12px 0;
}

.stat-value {
    font-size: 2.5rem;
    font-weight: 700;
    color: #1b5e20;
    margin-bottom: 8px;
}

.stat-subtitle {
    font-size: 0.9rem;
    color: #999;
}

.quick-actions {
    display: flex;
    gap: 12px;
    margin-bottom: 30px;
}

.action-btn {
    padding: 10px 20px;
    background: #1b5e20;
    color: white;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 600;
    transition: background 0.2s ease;
}

.action-btn:hover {
    background: #145a1a;
}

.charts-section {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
}

.chart-card {
    background: white;
    max-height: 400px;
    border-radius: 8px;
    padding: 50px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chart-header {
    display: flex;
    max-height: 50px;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.chart-header h3 {
    margin: 0;
    color: #1b5e20;
    font-size: 1.1rem;
}



.chart-placeholder {
    height: 300px;
    background: #f0f0f0;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #999;
}

@media (max-width: 768px) {
    .dashboard-page {
        padding: 16px;
    }

    .page-header {
        flex-direction: column;
        gap: 12px;
        align-items: flex-start;
    }

    .stats-grid {
        grid-template-columns: 1fr;
    }

    .charts-section {
        grid-template-columns: 1fr;
    }
}
</style>
