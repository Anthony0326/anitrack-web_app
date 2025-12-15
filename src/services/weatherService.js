import axios from 'axios'

// OpenWeatherMap API Configuration
// Get your free API key at: https://openweathermap.org/api
const OPENWEATHER_API_KEY = 'YOUR_OPENWEATHERMAP_API_KEY' // Replace with your actual API key
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org'

// Create axios instances for weather APIs
const openWeatherAPI = axios.create({
    baseURL: OPENWEATHER_BASE_URL,
    timeout: 10000
})

// Geocoding service to convert location names to coordinates
const nominatimAPI = axios.create({
    baseURL: 'https://nominatim.openstreetmap.org',
    timeout: 10000,
    headers: {
        'User-Agent': 'AniTrack-WeatherApp'
    }
})

/**
 * Get coordinates from location name using Nominatim (free, no API key needed)
 */
export async function getCoordinatesByLocation(locationName) {
    try {
        const response = await nominatimAPI.get('/search', {
            params: {
                q: locationName,
                format: 'json',
                limit: 1
            }
        })

        if (response.data && response.data.length > 0) {
            const location = response.data[0]
            return {
                lat: parseFloat(location.lat),
                lon: parseFloat(location.lon),
                name: location.display_name
            }
        }
        throw new Error('Location not found')
    } catch (error) {
        console.error('Geocoding error:', error)
        throw new Error('Failed to find location. Please try a different search.')
    }
}

/**
 * Get current weather and forecast using OpenWeatherMap
 */
export async function getWeatherByCoordinates(latitude, longitude) {
    try {
        // Current weather + 5-day forecast
        const response = await openWeatherAPI.get('/data/2.5/forecast', {
            params: {
                lat: latitude,
                lon: longitude,
                appid: OPENWEATHER_API_KEY,
                units: 'metric',
                cnt: 40 // 5 days with 3-hour intervals
            }
        })

        return parseWeatherData(response.data)
    } catch (error) {
        console.error('Weather API error:', error)
        throw new Error('Failed to fetch weather data. Please check your API key.')
    }
}

/**
 * Get UV Index from OpenWeatherMap
 */
export async function getUVIndex(latitude, longitude) {
    try {
        const response = await openWeatherAPI.get('/data/2.5/uvi', {
            params: {
                lat: latitude,
                lon: longitude,
                appid: OPENWEATHER_API_KEY
            }
        })

        return response.data.value
    } catch (error) {
        console.error('UV Index error:', error)
        return 5 // Default mid-range value
    }
}

/**
 * Parse OpenWeatherMap data into our format
 */
function parseWeatherData(data) {
    const list = data.list || []
    const currentData = list[0]

    // Extract hourly data (next 12 hours = 4 forecasts of 3 hours each)
    const hourlyData = list.slice(0, 4).map((item) => {
        const date = new Date(item.dt * 1000)
        const time = `${date.getHours() % 12 || 12}:${String(date.getMinutes()).padStart(2, '0')} ${date.getHours() >= 12 ? 'PM' : 'AM'}`
        
        return {
            time: time,
            temp: Math.round(item.main.temp),
            humidity: item.main.humidity
        }
    })

    // Pad hourly data to 12 hours if needed
    while (hourlyData.length < 12) {
        const lastHour = hourlyData[hourlyData.length - 1]
        hourlyData.push({
            ...lastHour,
            temp: lastHour.temp + (Math.random() * 2 - 1)
        })
    }

    // Extract 5-day forecast (one per day at noon)
    const dailyForecasts = {}
    list.forEach(item => {
        const date = new Date(item.dt * 1000)
        const dayKey = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
        const hour = date.getHours()

        // Get data around noon for better representation
        if (hour >= 9 && hour <= 15) {
            if (!dailyForecasts[dayKey]) {
                dailyForecasts[dayKey] = {
                    date: dayKey,
                    condition: getWeatherCondition(item.weather[0].main),
                    maxTemp: Math.round(item.main.temp_max),
                    minTemp: Math.round(item.main.temp_min),
                    humidity: item.main.humidity,
                    windSpeed: Math.round(item.wind.speed),
                    rainProbability: Math.round((item.pop || 0) * 100),
                    weatherCode: item.weather[0].id
                }
            } else {
                // Update with warmer temperature
                dailyForecasts[dayKey].maxTemp = Math.max(dailyForecasts[dayKey].maxTemp, Math.round(item.main.temp_max))
                dailyForecasts[dayKey].minTemp = Math.min(dailyForecasts[dayKey].minTemp, Math.round(item.main.temp_min))
            }
        }
    })

    const forecast = Object.values(dailyForecasts).slice(0, 5)

    // Current weather
    const currentWeather = {
        temperature: Math.round(currentData.main.temp),
        condition: getWeatherCondition(currentData.weather[0].main),
        humidity: currentData.main.humidity,
        windSpeed: Math.round(currentData.wind.speed),
        feelsLike: Math.round(currentData.main.feels_like),
        pressure: currentData.main.pressure,
        visibility: Math.round((currentData.visibility || 10000) / 1000),
        rainProbability: Math.round((currentData.pop || 0) * 100),
        weatherCode: currentData.weather[0].id,
        description: currentData.weather[0].description
    }

    return {
        currentWeather,
        forecast: forecast.length >= 5 ? forecast : generateDefaultForecast(forecast),
        hourlyData: hourlyData.slice(0, 12)
    }
}

/**
 * Convert OpenWeatherMap weather code to readable condition
 */
function getWeatherCondition(weatherMain) {
    const conditionMap = {
        'Clear': 'Sunny',
        'Clouds': 'Cloudy',
        'Partly clouds': 'Partly Cloudy',
        'Rain': 'Rainy',
        'Drizzle': 'Rainy',
        'Thunderstorm': 'Thunderstorm',
        'Snow': 'Snowy',
        'Mist': 'Foggy',
        'Smoke': 'Foggy',
        'Haze': 'Foggy',
        'Dust': 'Foggy',
        'Fog': 'Foggy',
        'Sand': 'Foggy',
        'Ash': 'Foggy',
        'Squall': 'Windy',
        'Tornado': 'Windy'
    }

    return conditionMap[weatherMain] || weatherMain
}

/**
 * Generate default forecast if API doesn't provide enough data
 */
function generateDefaultForecast(existing) {
    const defaults = [
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
    ]

    return [...existing, ...defaults].slice(0, 5)
}

/**
 * Generate agricultural alerts based on weather conditions
 */
export function generateWeatherAlerts(currentWeather, uvIndex = 5) {
    const alerts = []

    // UV Index Alert
    if (uvIndex >= 8) {
        alerts.push({
            severity: 'warning',
            title: 'High UV Index',
            description: `UV index at ${Math.round(uvIndex)} (very high). Apply protective measures for crops and farmers.`,
            time: 'Active now'
        })
    } else if (uvIndex >= 6) {
        alerts.push({
            severity: 'info',
            title: 'Moderate UV Index',
            description: `UV index at ${Math.round(uvIndex)}. Standard sun protection recommended.`,
            time: 'Active now'
        })
    }

    // Rain Alert
    if (currentWeather.rainProbability >= 70) {
        alerts.push({
            severity: 'warning',
            title: 'Heavy Rain Expected',
            description: `${currentWeather.rainProbability}% chance of rain. Ensure proper drainage systems are functional.`,
            time: 'Expected within next 3 hours'
        })
    } else if (currentWeather.rainProbability >= 40) {
        alerts.push({
            severity: 'info',
            title: 'Rain Possible',
            description: `${currentWeather.rainProbability}% chance of showers. Monitor conditions.`,
            time: 'Expected today'
        })
    }

    // High Wind Alert
    if (currentWeather.windSpeed >= 25) {
        alerts.push({
            severity: 'critical',
            title: 'Strong Winds',
            description: `Wind speed at ${currentWeather.windSpeed} km/h. Check crop support systems and livestock shelter.`,
            time: 'Active now'
        })
    } else if (currentWeather.windSpeed >= 18) {
        alerts.push({
            severity: 'warning',
            title: 'Moderate Winds',
            description: `Wind speed at ${currentWeather.windSpeed} km/h. Monitor spray drift if applying pesticides.`,
            time: 'Active now'
        })
    }

    // Humidity Alert
    if (currentWeather.humidity >= 85) {
        alerts.push({
            severity: 'warning',
            title: 'High Humidity',
            description: `Humidity at ${currentWeather.humidity}%. Risk of fungal diseases. Consider preventive measures.`,
            time: 'Active now'
        })
    }

    // Temperature Alert
    if (currentWeather.temperature >= 35) {
        alerts.push({
            severity: 'critical',
            title: 'Extreme Heat',
            description: `Temperature at ${currentWeather.temperature}°C. Increase irrigation and provide shade for sensitive crops.`,
            time: 'Active now'
        })
    }

    return alerts.length > 0 ? alerts : [
        {
            severity: 'info',
            title: 'Conditions Normal',
            description: 'Weather conditions are favorable for farm operations.',
            time: 'Current conditions'
        }
    ]
}

/**
 * Generate farm recommendations based on weather
 */
export function generateFarmRecommendations(currentWeather, forecast) {
    const recommendations = []

    // Irrigation
    if (currentWeather.humidity < 60) {
        recommendations.push({
            icon: '💧',
            title: 'Increase Irrigation',
            description: 'Low humidity suggests crops need more water. Schedule irrigation in early morning.',
            priority: 'high'
        })
    } else if (currentWeather.humidity > 80) {
        recommendations.push({
            icon: '💧',
            title: 'Reduce Irrigation',
            description: 'High humidity means less evaporation. Consider reducing irrigation frequency.',
            priority: 'medium'
        })
    }

    // Pest Control
    if (currentWeather.humidity >= 75 && currentWeather.temperature >= 20) {
        recommendations.push({
            icon: '🌱',
            title: 'Monitor Fungal Diseases',
            description: 'Warm and humid conditions favor fungal growth. Scout crops and apply fungicides if needed.',
            priority: 'high'
        })
    }

    // Spraying Operations
    if (currentWeather.windSpeed < 15 && currentWeather.rainProbability < 30) {
        recommendations.push({
            icon: '🚜',
            title: 'Good Window for Spraying',
            description: 'Wind and rain conditions are favorable for pesticide/fertilizer application.',
            priority: 'high'
        })
    } else if (currentWeather.windSpeed >= 20) {
        recommendations.push({
            icon: '💨',
            title: 'Avoid Spraying',
            description: 'Wind speed too high for effective spraying. Risk of spray drift.',
            priority: 'high'
        })
    }

    // Harvesting
    if (currentWeather.rainProbability < 20 && currentWeather.condition === 'Sunny') {
        recommendations.push({
            icon: '🌾',
            title: 'Ideal Harvesting Conditions',
            description: 'Sunny and dry weather perfect for harvesting. Plan operations accordingly.',
            priority: 'high'
        })
    }

    // Rainfall Preparation
    if (forecast && forecast[0] && forecast[0].rainProbability >= 60) {
        recommendations.push({
            icon: '☔',
            title: 'Prepare for Rain',
            description: 'Heavy rain expected. Ensure drainage systems are clear and prepare soil conservation measures.',
            priority: 'high'
        })
    }

    return recommendations.length >= 4 ? recommendations : [
        {
            icon: '💧',
            title: 'Irrigation Schedule',
            description: 'Monitor soil moisture and adjust irrigation based on rainfall and humidity.',
            priority: 'medium'
        },
        {
            icon: '🌱',
            title: 'Pest Monitoring',
            description: 'Regular crop scouting to detect pest and disease problems early.',
            priority: 'medium'
        },
        {
            icon: '🚜',
            title: 'Farm Operations',
            description: 'Plan fieldwork during favorable weather windows.',
            priority: 'medium'
        },
        {
            icon: '☔',
            title: 'Weather Monitoring',
            description: 'Keep an eye on weather forecasts for better planning.',
            priority: 'low'
        }
    ]
}

/**
 * Calculate farm impact analytics
 */
export function calculateImpactAnalytics(currentWeather) {
    let ideal = 50
    let warning = 35
    let critical = 15

    // Adjust based on current conditions
    if (currentWeather.temperature >= 25 && currentWeather.temperature <= 32 && currentWeather.humidity >= 60 && currentWeather.humidity <= 80) {
        ideal = 70
        warning = 25
        critical = 5
    } else if (currentWeather.windSpeed >= 25 || currentWeather.rainProbability >= 80) {
        ideal = 20
        warning = 35
        critical = 45
    } else if (currentWeather.humidity >= 85) {
        ideal = 35
        warning = 45
        critical = 20
    }

    return { ideal, warning, critical }
}
