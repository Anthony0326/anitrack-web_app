# Weather Feature - API Setup Guide

## Overview
The weather forecasting feature integrates with **OpenWeatherMap API** for real-time weather data and **Nominatim (OpenStreetMap)** for location geocoding. Nominatim is free and requires no API key, while OpenWeatherMap requires a free API key for full functionality.

## Quick Start

### Option 1: Using Free Tier (Recommended for Development)
The app automatically falls back to demo data if the API key is not configured. This allows you to test the UI without an API key.

**Current Status**: The app will show demo data by default.

---

## OpenWeatherMap Setup (Optional but Recommended)

### Step 1: Create a Free Account
1. Go to https://openweathermap.org/api
2. Click "Sign Up" and create a free account
3. Verify your email address

### Step 2: Get Your API Key
1. Log in to your OpenWeatherMap account
2. Go to **API keys** page
3. Copy your **default API key**
4. Wait 5-10 minutes for the key to be activated (newly created keys take time to activate)

### Step 3: Add API Key to Your Project
1. Open `src/services/weatherService.js`
2. Find this line (around line 8):
   ```javascript
   const OPENWEATHER_API_KEY = 'YOUR_OPENWEATHERMAP_API_KEY'
   ```
3. Replace `'YOUR_OPENWEATHERMAP_API_KEY'` with your actual API key:
   ```javascript
   const OPENWEATHER_API_KEY = 'abc123def456ghi789jkl'
   ```
4. Save the file

### Step 4: Test the Weather Feature
1. Navigate to the Weather page in your app
2. Try searching for a location (e.g., "Manila", "Cebu", "Davao")
3. The map should display real weather data

---

## Features Enabled by API Key

### With OpenWeatherMap API Key ✅
- **Real-time weather data** - Current temperature, conditions, humidity, wind speed
- **5-day forecast** - Daily weather predictions
- **Hourly forecasts** - 12-hour temperature and humidity charts
- **UV Index** - Sun exposure warnings
- **Dynamic alerts** - Weather-based warnings (high UV, rain, wind, humidity)
- **Farm recommendations** - Context-aware farming advice based on actual conditions
- **Impact analytics** - Farm suitability percentages

### Without API Key (Demo Mode) ⚠️
- All features work with simulated data
- Perfect for UI/UX testing
- Good for development and demonstrations

---

## Location Search

### Supported Location Formats
The location search uses Nominatim (OpenStreetMap) geocoding and supports:
- City names: "Manila", "Cezon City"
- Province names: "Laguna", "Batangas"
- Region names: "Calabarzon"
- Barangay names: "Barangay Hall, Pasig"
- Full addresses: "123 Main St, San Juan, Metro Manila"

### Example Searches
```
Quezon City, Philippines
Benguet
Abra
Ifugao
Metro Manila
```

---

## API Rate Limits

### OpenWeatherMap Free Tier
- **Limit**: 1,000 calls per day
- **Per minute**: ~40 requests/minute
- Perfect for development and small-scale usage

### Nominatim (Geocoding)
- **Limit**: 1 request per second
- Free to use, no key needed
- User-Agent header required (already configured)

---

## Troubleshooting

### Issue: "Failed to fetch weather data. API key invalid"
**Solution**: 
- Check that your API key is correctly pasted in `weatherService.js`
- Wait 5-10 minutes after creating the API key
- Ensure you're using the Free tier API key (not a reserved key)

### Issue: "Location not found"
**Solution**:
- Use a more specific location name
- Try a different spelling
- Include province/region in search

### Issue: Data showing as "demo" or mock values
**Solution**:
- Verify API key is set in `weatherService.js`
- Check browser console (F12) for error messages
- Try refreshing the page
- Check your OpenWeatherMap API usage quota

### Issue: CORS Error (Cross-Origin Request Blocked)
**Solution**:
- This is normal for browser-based API calls
- The services already handle CORS for free APIs (Nominatim, OpenWeatherMap)
- If still failing, check that your domain is allowed in OpenWeatherMap settings

---

## Production Deployment

### For Production Use:
1. **Never commit API keys** to public repositories
2. **Use environment variables**:
   ```javascript
   const OPENWEATHER_API_KEY = process.env.VUE_APP_OPENWEATHER_API_KEY
   ```
3. **Create `.env` file** in project root:
   ```
   VUE_APP_OPENWEATHER_API_KEY=your_actual_key_here
   ```
4. **Add `.env` to `.gitignore`** to prevent accidental commits
5. **Use backend proxy** for API calls (recommended security practice)

### Backend Proxy Example (Node.js/Express):
```javascript
// server.js
const express = require('express')
const axios = require('axios')
const app = express()

app.get('/api/weather/:lat/:lon', async (req, res) => {
    const apiKey = process.env.OPENWEATHER_API_KEY
    const { lat, lon } = req.params
    
    try {
        const response = await axios.get('https://api.openweathermap.org/data/2.5/forecast', {
            params: { lat, lon, appid: apiKey, units: 'metric' }
        })
        res.json(response.data)
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch weather' })
    }
})
```

---

## Alternative APIs

If you prefer different weather providers:

### PAGASA (Philippine Atmospheric, Geophysical and Astronomical Services Administration)
- Official Philippine weather service
- Focus on Philippines-specific forecasts
- May require special integration

### WeatherAPI.com
- Free tier available
- Good coverage for Southeast Asia
- Setup similar to OpenWeatherMap

### Weather.gov.ph
- Philippine government weather service
- Free access
- Might have different data format

---

## Features Implementation Details

### Current Functions:
1. **getCoordinatesByLocation(locationName)** - Converts location text to lat/lon coordinates
2. **getWeatherByCoordinates(lat, lon)** - Fetches weather data for coordinates
3. **getUVIndex(lat, lon)** - Gets UV index for sun protection alerts
4. **generateWeatherAlerts(currentWeather, uvIndex)** - Creates weather-based warnings
5. **generateFarmRecommendations(weather, forecast)** - Farm-specific advice
6. **calculateImpactAnalytics(weather, forecast)** - Farm suitability metrics

### Data Processing:
- All temperatures converted to Celsius
- Wind speeds in km/h
- Pressure in millibars
- Visibility in kilometers
- Rainfall probability as percentage

---

## Contact & Support

For issues with:
- **OpenWeatherMap API**: https://openweathermap.org/find-technical-help
- **Nominatim Geocoding**: https://nominatim.org
- **App Integration**: Check the code comments in `src/services/weatherService.js`

---

## License & Credits

- **OpenWeatherMap**: https://openweathermap.org (API)
- **Nominatim**: https://nominatim.openstreetmap.org (Geocoding)
- **OpenStreetMap**: https://www.openstreetmap.org (Map data)

All services are free for personal and non-commercial use.
