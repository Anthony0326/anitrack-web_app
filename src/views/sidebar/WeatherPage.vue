<template>
    <div class="weather-container">
        <div class="weather-header">
            <h1>Weather Forecasting</h1>
            <p class="subtitle">Monitor weather conditions to optimize farming operations</p>
            <div class="weather-controls">
                <input 
                    v-model="locationSearch" 
                    type="text" 
                    placeholder="Search location (province, municipality, barangay)..." 
                    class="search-input"
                    @keydown.enter="searchLocation"
                />
                <button @click="searchLocation" class="btn-search">Search</button>
                <button @click="getCurrentLocation" class="btn-location">📍 Current Location</button>
                <button @click="refreshWeather" class="btn-refresh">Refresh</button>
            </div>
        </div>

        <div v-if="loading" class="loading-spinner">
            <div class="spinner"></div>
            <p>Loading weather data...</p>
        </div>

        <div v-else-if="error" class="error-message">
            <span>⚠️ {{ error }}</span>
            <button @click="refreshWeather" class="btn-retry">Retry</button>
        </div>

        <div v-else class="weather-content">
            <!-- Current Weather Card -->
            <div class="current-weather-card">
                <div class="location-info">
                    <h2>{{ currentLocation }}</h2>
                    <p class="timestamp">Last updated: {{ lastUpdated }}</p>
                </div>

                <div class="weather-main">
                    <div class="temperature-section">
                        <div class="temp-display">
                            <span class="temp-value">{{ currentWeather.temperature }}°C</span>
                            <span class="condition">{{ currentWeather.condition }}</span>
                        </div>
                        <div class="weather-icon">
                            <span>{{ getWeatherIcon(currentWeather.condition) }}</span>
                        </div>
                    </div>

                    <div class="weather-details-grid">
                        <div class="detail-item">
                            <span class="detail-icon">💧</span>
                            <span class="detail-label">Humidity</span>
                            <span class="detail-value">{{ currentWeather.humidity }}%</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-icon">💨</span>
                            <span class="detail-label">Wind Speed</span>
                            <span class="detail-value">{{ currentWeather.windSpeed }} km/h</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-icon">🌡️</span>
                            <span class="detail-label">Feels Like</span>
                            <span class="detail-value">{{ currentWeather.feelsLike }}°C</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-icon">🌪️</span>
                            <span class="detail-label">Pressure</span>
                            <span class="detail-value">{{ currentWeather.pressure }} mb</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-icon">👁️</span>
                            <span class="detail-label">Visibility</span>
                            <span class="detail-value">{{ currentWeather.visibility }} km</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-icon">☔</span>
                            <span class="detail-label">Rainfall Prob.</span>
                            <span class="detail-value">{{ currentWeather.rainProbability }}%</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Alerts Section -->
            <div v-if="weatherAlerts.length > 0" class="weather-alerts">
                <h3>⚠️ Weather Alerts</h3>
                <div class="alerts-list">
                    <div 
                        v-for="(alert, idx) in weatherAlerts" 
                        :key="idx" 
                        class="alert-item"
                        :class="alert.severity"
                    >
                        <span class="alert-icon">{{ getAlertIcon(alert.severity) }}</span>
                        <div class="alert-content">
                            <strong>{{ alert.title }}</strong>
                            <p>{{ alert.description }}</p>
                            <span class="alert-time">{{ alert.time }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 5-Day Forecast -->
            <div class="forecast-section">
                <h3>5-Day Forecast</h3>
                <div class="forecast-grid">
                    <div 
                        v-for="(day, idx) in forecast" 
                        :key="idx" 
                        class="forecast-card"
                    >
                        <div class="forecast-date">{{ day.date }}</div>
                        <div class="forecast-icon">{{ getWeatherIcon(day.condition) }}</div>
                        <div class="forecast-condition">{{ day.condition }}</div>
                        <div class="forecast-temps">
                            <span class="max">{{ day.maxTemp }}°</span>
                            <span class="min">{{ day.minTemp }}°</span>
                        </div>
                        <div class="forecast-details">
                            <span>💧 {{ day.humidity }}%</span>
                            <span>💨 {{ day.windSpeed }} km/h</span>
                        </div>
                        <div class="forecast-rain">☔ {{ day.rainProbability }}%</div>
                    </div>
                </div>
            </div>

            <!-- Agricultural Recommendations -->
            <div class="recommendations-section">
                <h3>🌾 Farm Recommendations</h3>
                <div class="recommendations-grid">
                    <div 
                        v-for="(rec, idx) in recommendations" 
                        :key="idx" 
                        class="recommendation-card"
                        :class="rec.priority"
                    >
                        <div class="rec-icon">{{ rec.icon }}</div>
                        <div class="rec-content">
                            <h4>{{ rec.title }}</h4>
                            <p>{{ rec.description }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Hourly Forecast Chart -->
            <div class="hourly-section">
                <h3>Hourly Temperature & Humidity (Next 12 Hours)</h3>
                <div class="hourly-chart">
                    <div class="chart-container">
                        <div class="chart-labels">
                            <div v-for="(hour, idx) in hourlyData" :key="idx" class="hour-label">
                                {{ hour.time }}
                            </div>
                        </div>
                        <div class="chart-bars">
                            <div v-for="(hour, idx) in hourlyData" :key="idx" class="bar-group">
                                <div class="temp-bar" :style="{ height: (hour.temp / 40) * 100 + '%' }"></div>
                                <div class="humidity-bar" :style="{ height: (hour.humidity / 100) * 100 + '%' }"></div>
                            </div>
                        </div>
                        <div class="chart-legend">
                            <div class="legend-item temp">
                                <span class="legend-color"></span>
                                <span>Temperature (°C)</span>
                            </div>
                            <div class="legend-item humidity">
                                <span class="legend-color"></span>
                                <span>Humidity (%)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Farmer Impact Analytics -->
            <div class="impact-section">
                <h3>📊 Farm Impact Analytics</h3>
                <div class="impact-grid">
                    <div class="impact-card ideal">
                        <div class="impact-title">Ideal Conditions</div>
                        <div class="impact-percentage">{{ impactAnalytics.ideal }}%</div>
                        <div class="impact-description">Good for farming operations</div>
                    </div>
                    <div class="impact-card warning">
                        <div class="impact-title">Caution</div>
                        <div class="impact-percentage">{{ impactAnalytics.warning }}%</div>
                        <div class="impact-description">Monitor conditions closely</div>
                    </div>
                    <div class="impact-card critical">
                        <div class="impact-title">Critical</div>
                        <div class="impact-percentage">{{ impactAnalytics.critical }}%</div>
                        <div class="impact-description">Consider farm protection measures</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
    getCoordinatesByLocation,
    getWeatherByCoordinates,
    getUVIndex,
    generateWeatherAlerts,
    generateFarmRecommendations,
    calculateImpactAnalytics
} from '@/services/weatherService'

const locationSearch = ref('')
const currentLocation = ref('Quezon City, Philippines')
const loading = ref(false)
const error = ref(null)
const lastUpdated = ref('')
const hasAPIKey = ref(false)
const currentCoordinates = ref({ lat: 14.5995, lon: 120.9842 })

// Current Weather Data
const currentWeather = ref({
    temperature: 28,
    condition: 'Partly Cloudy',
    humidity: 72,
    windSpeed: 15,
    feelsLike: 30,
    pressure: 1013,
    visibility: 10,
    rainProbability: 20
})

// Weather Alerts
const weatherAlerts = ref([
    {
        severity: 'warning',
        title: 'High UV Index',
        description: 'UV index will reach 9-10 between 10 AM and 3 PM. Apply protective measures for crops.',
        time: 'Active until today 6 PM'
    },
    {
        severity: 'info',
        title: 'Rain Expected',
        description: 'Scattered showers expected in the evening. Rainfall estimated at 5-10 mm.',
        time: 'Expected at 5 PM onwards'
    }
])

// 5-Day Forecast
const forecast = ref([
    {
        date: 'Mon, Dec 8',
        condition: 'Sunny',
        maxTemp: 31,
        minTemp: 24,
        humidity: 65,
        windSpeed: 12,
        rainProbability: 5
    },
    {
        date: 'Tue, Dec 9',
        condition: 'Cloudy',
        maxTemp: 29,
        minTemp: 23,
        humidity: 70,
        windSpeed: 18,
        rainProbability: 30
    },
    {
        date: 'Wed, Dec 10',
        condition: 'Rainy',
        maxTemp: 26,
        minTemp: 21,
        humidity: 85,
        windSpeed: 20,
        rainProbability: 80
    },
    {
        date: 'Thu, Dec 11',
        condition: 'Rainy',
        maxTemp: 25,
        minTemp: 20,
        humidity: 88,
        windSpeed: 22,
        rainProbability: 85
    },
    {
        date: 'Fri, Dec 12',
        condition: 'Partly Cloudy',
        maxTemp: 28,
        minTemp: 22,
        humidity: 72,
        windSpeed: 16,
        rainProbability: 25
    }
])

// Hourly Data
const hourlyData = ref([
    { time: '12 AM', temp: 23, humidity: 75 },
    { time: '1 AM', temp: 22, humidity: 78 },
    { time: '2 AM', temp: 21, humidity: 80 },
    { time: '3 AM', temp: 20, humidity: 82 },
    { time: '4 AM', temp: 19, humidity: 85 },
    { time: '5 AM', temp: 19, humidity: 86 },
    { time: '6 AM', temp: 20, humidity: 84 },
    { time: '7 AM', temp: 22, humidity: 80 },
    { time: '8 AM', temp: 24, humidity: 76 },
    { time: '9 AM', temp: 26, humidity: 72 },
    { time: '10 AM', temp: 28, humidity: 68 },
    { time: '11 AM', temp: 30, humidity: 65 }
])

// Agricultural Recommendations
const recommendations = ref([
    {
        icon: '💧',
        title: 'Irrigation Schedule',
        description: 'Moderate humidity levels suggest irrigation in early morning. Monitor soil moisture before watering.',
        priority: 'high'
    },
    {
        icon: '🌱',
        title: 'Pest Control',
        description: 'High humidity increases fungal disease risk. Consider preventive spraying on vulnerable crops.',
        priority: 'high'
    },
    {
        icon: '🚜',
        title: 'Harvesting Window',
        description: 'Weather conditions favorable for harvesting. Plan harvest operations for next 2 days.',
        priority: 'medium'
    },
    {
        icon: '☔',
        title: 'Rainfall Preparation',
        description: 'Rain expected Wednesday-Thursday. Ensure proper drainage and soil conservation measures.',
        priority: 'high'
    }
])

// Impact Analytics
const impactAnalytics = ref({
    ideal: 55,
    warning: 30,
    critical: 15
})

function getWeatherIcon(condition) {
    const iconMap = {
        'Sunny': '☀️',
        'Partly Cloudy': '⛅',
        'Cloudy': '☁️',
        'Rainy': '🌧️',
        'Thunderstorm': '⛈️',
        'Snowy': '❄️',
        'Foggy': '🌫️',
        'Windy': '💨'
    }
    return iconMap[condition] || '🌤️'
}

function getAlertIcon(severity) {
    if (severity === 'critical') return '🚨'
    if (severity === 'warning') return '⚠️'
    return 'ℹ️'
}

const searchLocation = async () => {
    if (!locationSearch.value.trim()) return
    
    loading.value = true
    error.value = null
    
    try {
        // Get coordinates from location name using Nominatim (free, no API key needed)
        const coordinates = await getCoordinatesByLocation(locationSearch.value)
        currentLocation.value = coordinates.name
        currentCoordinates.value = { lat: coordinates.lat, lon: coordinates.lon }
        
        // Fetch real weather data
        await loadRealWeatherData(coordinates.lat, coordinates.lon)
        updateTimestamp()
    } catch (err) {
        error.value = err.message || 'Failed to fetch weather data. Please try again.'
        console.error('Error:', err)
        // Fall back to demo data if API fails
        loadMockWeatherData()
        updateTimestamp()
    } finally {
        loading.value = false
    }
}

const getCurrentLocation = async () => {
    loading.value = true
    error.value = null
    
    try {
        if (!navigator.geolocation) {
            error.value = 'Geolocation is not supported by your browser.'
            return
        }
        
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords
                    currentCoordinates.value = { lat: latitude, lon: longitude }
                    
                    // Fetch real weather data for current location
                    await loadRealWeatherData(latitude, longitude)
                    
                    // Try to get location name via reverse geocoding
                    const locName = await getLocationName(latitude, longitude)
                    currentLocation.value = locName
                    updateTimestamp()
                } catch (err) {
                    error.value = 'Failed to fetch weather for current location.'
                    currentLocation.value = `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`
                } finally {
                    loading.value = false
                }
            },
            (err) => {
                error.value = 'Unable to access location. Please enable location permissions.'
                loading.value = false
                console.error('Geolocation error:', err)
            }
        )
    } catch (err) {
        error.value = 'Error accessing location.'
        loading.value = false
    }
}

const refreshWeather = () => {
    loading.value = true
    error.value = null
    
    loadRealWeatherData(currentCoordinates.value.lat, currentCoordinates.value.lon)
        .then(() => {
            updateTimestamp()
            error.value = null
        })
        .catch((err) => {
            error.value = 'Failed to refresh weather data. Using cached data.'
            console.error('Refresh error:', err)
        })
        .finally(() => {
            loading.value = false
        })
}

function updateTimestamp() {
    const now = new Date()
    lastUpdated.value = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
    })
}

async function loadRealWeatherData(lat, lon) {
    try {
        // Fetch weather data from OpenWeatherMap API
        const weatherData = await getWeatherByCoordinates(lat, lon)
        
        // Update current weather
        currentWeather.value = weatherData.currentWeather
        
        // Update forecast
        forecast.value = weatherData.forecast
        
        // Update hourly data
        hourlyData.value = weatherData.hourlyData
        
        // Get UV Index
        const uvIndex = await getUVIndex(lat, lon)
        
        // Generate alerts based on real data
        weatherAlerts.value = generateWeatherAlerts(currentWeather.value, uvIndex)
        
        // Generate recommendations
        recommendations.value = generateFarmRecommendations(currentWeather.value, forecast.value)
        
        // Calculate impact analytics
        impactAnalytics.value = calculateImpactAnalytics(currentWeather.value, forecast.value)
        
        hasAPIKey.value = true
    } catch (err) {
        console.error('Real weather data error:', err)
        // If API fails, fall back to mock data
        if (!hasAPIKey.value) {
            error.value = 'Using demo data. To enable real weather data, add your OpenWeatherMap API key to weatherService.js'
            loadMockWeatherData()
        }
        throw err
    }
}

async function getLocationName(lat, lon) {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`,
            { headers: { 'User-Agent': 'AniTrack-WeatherApp' } }
        )
        const data = await response.json()
        const address = data.address || {}
        const name = address.city || address.town || address.village || data.display_name
        return name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`
    } catch (err) {
        console.error('Reverse geocoding error:', err)
        return `${lat.toFixed(4)}, ${lon.toFixed(4)}`
    }
}

function loadMockWeatherData() {
    // Simulate varying weather data
    const temps = [24, 25, 26, 27, 28, 29, 30, 31]
    const temp = temps[Math.floor(Math.random() * temps.length)]
    
    const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy']
    const condition = conditions[Math.floor(Math.random() * conditions.length)]
    
    currentWeather.value = {
        temperature: temp,
        condition: condition,
        humidity: Math.floor(Math.random() * 40) + 50,
        windSpeed: Math.floor(Math.random() * 20) + 5,
        feelsLike: temp + Math.floor(Math.random() * 4) - 1,
        pressure: 1010 + Math.floor(Math.random() * 10),
        visibility: Math.floor(Math.random() * 5) + 7,
        rainProbability: Math.floor(Math.random() * 70)
    }
}

onMounted(() => {
    updateTimestamp()
    // Try to load real weather for default location (Quezon City)
    loadRealWeatherData(currentCoordinates.value.lat, currentCoordinates.value.lon)
        .catch(() => {
            // Fall back to mock data if API is not available
            loadMockWeatherData()
        })
})
</script>

<style scoped>
:root {
    --primary: #1a7a6b;
    --accent: #2c9c8f;
    --success: #27ae60;
    --warning: #f39c12;
    --danger: #e74c3c;
    --info: #3498db;
    --text: #2c3e50;
    --text-light: #95a5a6;
    --border: #ecf0f1;
    --bg: #f5f7fa;
}

.weather-container {
    padding: 24px;
    background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
    min-height: 100vh;
}

.weather-header {
    background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
    color: rgb(24, 23, 23);
    padding: 32px;
    border-radius: 12px;
    margin-bottom: 28px;
    box-shadow: 0 8px 16px rgba(26, 122, 107, 0.2);
}

.weather-header h1 {
    margin: 0 0 8px 0;
    font-size: 2.2rem;
    font-weight: 700;
}

.subtitle {
    margin: 0 0 20px 0;
    opacity: 0.95;
    font-size: 1rem;
}

.weather-controls {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
}

.search-input {
    flex: 1;
    min-width: 280px;
    padding: 11px 16px;
    border: none;
    border-radius: 8px;
    font-size: 0.95rem;
    background: rgba(255, 255, 255, 0.95);
    color: var(--text);
}

.search-input::placeholder {
    color: var(--text-light);
}

.search-input:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3);
}

.btn-search,
.btn-location,
.btn-refresh,
.btn-retry {
    padding: 11px 18px;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.9rem;
}

.btn-search {
    background: rgba(255, 255, 255, 0.95);
    color: var(--primary);
}

.btn-search:hover {
    background: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-location {
    background: rgba(255, 255, 255, 0.85);
    color: var(--primary);
}

.btn-location:hover {
    background: rgba(255, 255, 255, 0.95);
}

.btn-refresh {
    background: rgba(255, 255, 255, 0.85);
    color: var(--primary);
}

.btn-refresh:hover {
    background: rgba(255, 255, 255, 0.95);
}

.loading-spinner {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    color: var(--text);
}

.spinner {
    border: 4px solid var(--border);
    border-top: 4px solid var(--accent);
    border-radius: 50%;
    width: 50px;
    height: 50px;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.error-message {
    background: #fee;
    color: var(--danger);
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-left: 4px solid var(--danger);
}

.btn-retry {
    background: var(--danger);
    color: white;
    padding: 8px 16px;
}

.btn-retry:hover {
    background: #c0392b;
}

.weather-content {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

/* Current Weather Card */
.current-weather-card {
    background: white;
    padding: 32px;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.location-info h2 {
    margin: 0 0 4px 0;
    font-size: 1.8rem;
    color: var(--text);
}

.timestamp {
    margin: 0;
    color: var(--text-light);
    font-size: 0.9rem;
}

.weather-main {
    display: flex;
    gap: 40px;
    margin-top: 20px;
    flex-wrap: wrap;
}

.temperature-section {
    display: flex;
    gap: 32px;
    align-items: center;
    flex: 0 1 300px;
}

.temp-display {
    display: flex;
    flex-direction: column;
}

.temp-value {
    font-size: 4rem;
    font-weight: 700;
    color: var(--primary);
    line-height: 1;
}

.condition {
    font-size: 1.2rem;
    color: var(--text);
    margin-top: 8px;
}

.weather-icon {
    font-size: 5rem;
}

.weather-details-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 16px;
    flex: 1;
    min-width: 300px;
}

.detail-item {
    background: var(--bg);
    padding: 16px;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}

.detail-icon {
    font-size: 2rem;
    margin-bottom: 8px;
}

.detail-label {
    font-size: 0.85rem;
    color: var(--text-light);
    margin-bottom: 6px;
}

.detail-value {
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--primary);
}

/* Weather Alerts */
.weather-alerts {
    background: white;
    padding: 28px;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.weather-alerts h3 {
    margin: 0 0 16px 0;
    font-size: 1.3rem;
    color: var(--text);
}

.alerts-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.alert-item {
    display: flex;
    gap: 16px;
    padding: 16px;
    border-radius: 8px;
    border-left: 4px solid;
}

.alert-item.critical {
    background: #fee;
    border-color: var(--danger);
}

.alert-item.warning {
    background: #ffeaa7;
    border-color: var(--warning);
}

.alert-item.info {
    background: #e3f2fd;
    border-color: var(--info);
}

.alert-icon {
    font-size: 1.5rem;
    flex-shrink: 0;
}

.alert-content {
    flex: 1;
}

.alert-content strong {
    display: block;
    color: var(--text);
    margin-bottom: 4px;
}

.alert-content p {
    margin: 0 0 6px 0;
    color: var(--text);
    font-size: 0.9rem;
}

.alert-time {
    font-size: 0.85rem;
    color: var(--text-light);
}

/* Forecast Section */
.forecast-section {
    background: white;
    padding: 28px;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.forecast-section h3 {
    margin: 0 0 20px 0;
    font-size: 1.3rem;
    color: var(--text);
}

.forecast-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 16px;
}

.forecast-card {
    background: linear-gradient(135deg, var(--bg) 0%, #f0f4f8 100%);
    padding: 16px;
    border-radius: 8px;
    text-align: center;
    border: 1px solid var(--border);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.forecast-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.forecast-date {
    font-size: 0.85rem;
    color: var(--text-light);
    font-weight: 600;
    margin-bottom: 8px;
}

.forecast-icon {
    font-size: 2.5rem;
    margin-bottom: 8px;
}

.forecast-condition {
    font-size: 0.95rem;
    color: var(--text);
    font-weight: 600;
    margin-bottom: 12px;
}

.forecast-temps {
    display: flex;
    justify-content: center;
    gap: 12px;
    margin-bottom: 12px;
}

.forecast-temps .max {
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--danger);
}

.forecast-temps .min {
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--info);
}

.forecast-details {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 0.85rem;
    color: var(--text-light);
    margin-bottom: 12px;
}

.forecast-rain {
    padding: 8px;
    background: rgba(52, 152, 219, 0.1);
    border-radius: 4px;
    font-size: 0.85rem;
    color: var(--info);
    font-weight: 600;
}

/* Recommendations Section */
.recommendations-section {
    background: white;
    padding: 28px;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.recommendations-section h3 {
    margin: 0 0 20px 0;
    font-size: 1.3rem;
    color: var(--text);
}

.recommendations-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 16px;
}

.recommendation-card {
    padding: 20px;
    border-radius: 8px;
    border-left: 4px solid;
    display: flex;
    gap: 16px;
}

.recommendation-card.high {
    background: #fee;
    border-color: var(--danger);
}

.recommendation-card.medium {
    background: #ffeaa7;
    border-color: var(--warning);
}

.recommendation-card.low {
    background: #d4edda;
    border-color: var(--success);
}

.rec-icon {
    font-size: 2rem;
    flex-shrink: 0;
}

.rec-content h4 {
    margin: 0 0 8px 0;
    color: var(--text);
    font-size: 1rem;
}

.rec-content p {
    margin: 0;
    color: var(--text);
    font-size: 0.85rem;
    line-height: 1.5;
}

/* Hourly Section */
.hourly-section {
    background: white;
    padding: 28px;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.hourly-section h3 {
    margin: 0 0 20px 0;
    font-size: 1.3rem;
    color: var(--text);
}

.hourly-chart {
    overflow-x: auto;
}

.chart-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-width: 800px;
}

.chart-labels {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    padding: 0 40px;
}

.hour-label {
    font-size: 0.8rem;
    color: var(--text-light);
    flex: 1;
    text-align: center;
}

.chart-bars {
    display: flex;
    gap: 12px;
    height: 200px;
    align-items: flex-end;
    padding: 0 40px;
}

.bar-group {
    display: flex;
    gap: 4px;
    flex: 1;
    align-items: flex-end;
}

.temp-bar {
    flex: 1;
    background: linear-gradient(180deg, var(--danger), #e67e22);
    border-radius: 4px 4px 0 0;
    min-height: 20px;
}

.humidity-bar {
    flex: 1;
    background: linear-gradient(180deg, var(--info), #5dade2);
    border-radius: 4px 4px 0 0;
    min-height: 20px;
}

.chart-legend {
    display: flex;
    justify-content: center;
    gap: 30px;
    padding: 16px 0 0 0;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;
    color: var(--text);
}

.legend-color {
    width: 16px;
    height: 16px;
    border-radius: 3px;
}

.legend-item.temp .legend-color {
    background: var(--danger);
}

.legend-item.humidity .legend-color {
    background: var(--info);
}

/* Impact Analytics */
.impact-section {
    background: white;
    padding: 28px;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.impact-section h3 {
    margin: 0 0 20px 0;
    font-size: 1.3rem;
    color: var(--text);
}

.impact-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
}

.impact-card {
    padding: 24px;
    border-radius: 8px;
    text-align: center;
    color: white;
}

.impact-card.ideal {
    background: linear-gradient(135deg, var(--success), #229954);
}

.impact-card.warning {
    background: linear-gradient(135deg, var(--warning), #d68910);
}

.impact-card.critical {
    background: linear-gradient(135deg, var(--danger), #c0392b);
}

.impact-title {
    font-size: 0.95rem;
    opacity: 0.95;
    margin-bottom: 12px;
    font-weight: 600;
}

.impact-percentage {
    font-size: 2.8rem;
    font-weight: 700;
    margin-bottom: 8px;
}

.impact-description {
    font-size: 0.85rem;
    opacity: 0.9;
}

/* Responsive */
@media (max-width: 768px) {
    .weather-container {
        padding: 16px;
    }

    .weather-header {
        padding: 20px;
    }

    .weather-header h1 {
        font-size: 1.8rem;
    }

    .weather-controls {
        flex-direction: column;
    }

    .search-input {
        min-width: unset;
    }

    .weather-main {
        gap: 20px;
    }

    .temperature-section {
        flex: 1 1 100%;
        justify-content: center;
    }

    .weather-details-grid {
        grid-template-columns: repeat(2, 1fr);
    }

    .forecast-grid {
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    }

    .recommendations-grid {
        grid-template-columns: 1fr;
    }

    .temp-value {
        font-size: 3rem;
    }

    .weather-icon {
        font-size: 3rem;
    }

    .chart-container {
        min-width: 100%;
    }

    .chart-bars {
        padding: 0 24px;
    }

    .chart-labels {
        padding: 0 24px;
    }
}
</style>
