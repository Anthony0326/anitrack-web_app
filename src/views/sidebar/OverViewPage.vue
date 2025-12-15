<template>
    <div class="dashboard-container">
        <div class="dashboard-header">
            <h1>Overview</h1>
            <div class="header-actions">
                <button @click="refreshDashboard" class="btn-refresh">Refresh</button>
            </div>
        </div>

        <div v-if="error" class="error-banner">{{ error }}</div>

        <!-- Stat Cards Grid -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-header">
                    <span class="stat-label">TOTAL FARMS</span>
                    <span class="stat-icon">🌾</span>
                </div>
                <div class="stat-value">{{ stats.totalFarms }}</div>
                <div class="stat-subtitle">Active farms</div>
            </div>

            <div class="stat-card">
                <div class="stat-header">
                    <span class="stat-label">ACTIVE USERS</span>
                    <span class="stat-icon">👥</span>
                </div>
                <div class="stat-value">{{ stats.activeUsers }}</div>
                <div class="stat-subtitle">Registered farmers</div>
            </div>

            <div class="stat-card">
                <div class="stat-header">
                    <span class="stat-label">TOTAL HARVEST</span>
                    <span class="stat-icon">🏆</span>
                </div>
                <div class="stat-value">{{ stats.totalHarvest }}</div>
                <div class="stat-subtitle">This season</div>
            </div>

            <div class="stat-card">
                <div class="stat-header">
                    <span class="stat-label">AVERAGE YIELD</span>
                    <span class="stat-icon">📊</span>
                </div>
                <div class="stat-value">{{ stats.avgYield }}</div>
                <div class="stat-subtitle">Per hectare</div>
            </div>

            <div class="stat-card">
                <div class="stat-header">
                    <span class="stat-label">SEASONS ACTIVE</span>
                    <span class="stat-icon">🌱</span>
                </div>
                <div class="stat-value">{{ stats.seasonsActive }}</div>
                <div class="stat-subtitle">Current seasons</div>
            </div>
        </div>

        <!-- Charts Section -->
        <div class="charts-section">
            <div class="chart-containers chart-resizable">
                <div class="chart-header">
                    <h3>Farm Activity Trend</h3>
                </div>
                <Line v-if="activityChartData" :data="activityChartData" :options="{ responsive: true, maintainAspectRatio: false }" :style="{ height: chartHeights.activity + 'px' }" />
                <div v-else class="chart-placeholder">Loading chart...</div>
            </div>

            <div class="chart-containers chart-resizable">
                <div class="chart-header">
                    <h3>Harvest Distribution</h3>
                </div>
                <Pie v-if="harvestChartData" :data="harvestChartData" :options="{ responsive: true, maintainAspectRatio: false }" :style="{ height: chartHeights.harvest + 'px' }" />
                <div v-else class="chart-placeholder pie-chart">Loading chart...</div>
            </div>
        </div>

        <!-- Recent Activity
        <div class="activity-section card">
            <h3>Recent Activity</h3>
            <div class="activity-list">
                <div v-for="(activity, idx) in recentActivity" :key="idx" class="activity-item">
                    <span class="activity-time">{{ activity.time }}</span>
                    <span class="activity-text">{{ activity.text }}</span>
                </div>
                <div v-if="recentActivity.length === 0" class="empty-state">
                    No recent activity
                </div>
            </div>
        </div> -->
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler } from 'chart.js'
import { Line, Pie } from 'vue-chartjs'
import { calculateActivityTrend, calculateHarvestDistribution, calculateStats, getFarmsAndHarvests } from '@/services/chartService'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler)

const stats = ref({
    totalFarms: 0,
    activeUsers: 0,
    totalHarvest: 0,
    avgYield: 0,
    seasonsActive: 0,
})

const activityChartData = ref(null)
const harvestChartData = ref(null)

const chartHeights = ref({
    activity: 300,
    harvest: 300
})

const recentActivity = ref([
    { time: 'Just now', text: 'Dashboard loaded' },
    { time: '2 min ago', text: 'New farm registered' },
    { time: '5 min ago', text: 'Harvest record updated' }
])

const error = ref(null)

const fetchDashboardData = async () => {
    try {
        error.value = null
        
        // Fetch farms and harvests
        const { farms, harvests } = await getFarmsAndHarvests()
        
        // Calculate stats
        const calculatedStats = calculateStats(farms, harvests)
        stats.value = {
            totalFarms: calculatedStats.totalFarms,
            activeUsers: calculatedStats.activeUsers,
            totalHarvest: calculatedStats.totalHarvest,
            avgYield: calculatedStats.averageYield,
            seasonsActive: 2,
        }

        // Calculate chart data
        activityChartData.value = calculateActivityTrend(harvests)
        harvestChartData.value = calculateHarvestDistribution(harvests)

        // Mock recent activity
        recentActivity.value = [
            { time: 'Just now', text: `Overview refreshed. ${stats.value.totalFarms} farms active.` },
            { time: '5 min ago', text: `Total harvest: ${stats.value.totalHarvest} kg` },
            { time: '15 min ago', text: 'System check completed — all services operational.' }
        ]
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
:root {
    --primary: #1a7a6b;
    --accent: #2c9c8f;
    --card-bg: #ffffff;
    --border: #ecf0f1;
    --text: #2c3e50;
    --text-light: #95a5a6;
}

.dashboard-container {
    min-height: 100px;
    max-width: 1245px;
    background: linear-gradient(135deg, #f5f3ee 0%, #e8e4d9 100%);
    padding: 30px 20px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
    max-width: 1400px;
    margin-left: auto;
    margin-right: auto;
}

.dashboard-header h1 {
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

.user-badge {
    padding: 8px 16px;
    background: var(--card-bg);
    border-radius: 20px;
    font-size: 0.95rem;
    color: var(--text);
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.btn-refresh {
    padding: 8px 16px;
    background: var(--accent);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: background 0.2s ease;
}

.btn-refresh:hover {
    background: var(--primary);
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

/* Stats Grid */
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
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.12);
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
    letter-spacing: 0.5px;
    text-transform: uppercase;
}

.stat-icon {
    font-size: 1.8rem;
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

/* Alternate stat card colors */
.stat-card:nth-child(2) { border-top: 4px solid #3498db; }
.stat-card:nth-child(3) { border-top: 4px solid #f39c12; }
.stat-card:nth-child(4) { border-top: 4px solid #e74c3c; }
.stat-card:nth-child(5) { border-top: 4px solid #9b59b6; }
.stat-card:nth-child(6) { border-top: 4px solid #e67e22; }
.stat-card:nth-child(7) { border-top: 4px solid #1abc9c; }
.stat-card:nth-child(8) { border-top: 4px solid #16a085; }

/* Charts Section */
.charts-section {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
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
    height: 300px;
    background: linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-light);
    font-size: 1rem;
    border: 2px dashed var(--border);
}

.pie-chart {
    height: 300px;
}

/* Activity Section */
.activity-section {
    background: var(--card-bg);
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    max-width: 1400px;
    margin-left: auto;
    margin-right: auto;
}

.activity-section h3 {
    margin: 0 0 20px 0;
    color: var(--text);
    font-size: 1.2rem;
}

.activity-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.activity-item {
    display: flex;
    gap: 16px;
    padding: 12px 0;
    border-bottom: 1px solid var(--border);
}

.activity-item:last-child {
    border-bottom: none;
}

.activity-time {
    color: var(--text-light);
    font-size: 0.85rem;
    min-width: 80px;
}

.activity-text {
    color: var(--text);
    font-size: 0.95rem;
}

.empty-state {
    color: var(--text-light);
    text-align: center;
    padding: 20px;
}

.card {
    background: var(--card-bg);
}

/* Responsive */
@media (max-width: 768px) {
    .dashboard-container {
        padding: 16px;
    }

    .dashboard-header {
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

    .stat-value {
        font-size: 2rem;
    }

    .header-actions {
        width: 100%;
        justify-content: space-between;
    }
}
</style>