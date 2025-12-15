<template>
  <div class="map-page">
    <div class="page-header">
      <h1>Farm Locations Map</h1>
      <div class="map-controls d-flex align-items-center gap-2">
        <input
          v-model="searchQuery"
          type="search"
          class="form-control"
          placeholder="Search farm or municipality"
          style="max-width:360px;"
        />
        <button @click="applyFilter" class="btn btn-outline-primary">
          <i class="bi bi-search"></i>
        </button>
        <select v-model="selectedMunicipality" class="form-select" style="max-width:200px;">
          <option value="all">All Municipalities</option>
          <option v-for="m in municipalities" :key="m" :value="m">{{ m }}</option>
        </select>
        <button @click="clearFilter" class="btn btn-outline-secondary">Clear</button>
        <button @click="refreshMarkers" class="btn btn-primary ms-auto">
         Refresh
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading map...</span>
      </div>
    </div>

    <div v-else-if="farms.length === 0" class="alert alert-info">
      No farms with location data available
    </div>

    <div v-else class="map-container">
      <div class="map-grid">
        <div
          id="leafletMap"
          ref="mapElement"
          style="width: 100%; height: 600px; border-radius: 8px;"
        ></div>

        <!-- optional list under map -->
       <hr>
       <h4>Farm List</h4>
        <div class="farm-list">
          <div
            v-for="farm in filteredFarms"
            :key="farm.id"
            class="farm-card-list"
            @click="selectFarmFromList(farm)"
          >
            <strong>{{ farm.farm_name }}</strong>
            <div class="small text-muted">
            {{farm.latitude}}, {{farm.longitude}}  
            </div>  
          </div>
        </div>
      </div>

      <div v-if="selectedFarm" class="selected-farm-panel">
        <div class="panel-header">
          <h3>{{ selectedFarm.farm_name }} - Details</h3>
          <button @click="selectedFarm = null" class="btn-close"></button>
        </div>
        <div class="panel-content">
          <div class="info-row"><label>Farm Name:</label> <span>{{ selectedFarm.farm_name }}</span></div>
          <div class="info-row"><label>Total Area:</label> <span>{{ selectedFarm.total_area }} hectares</span></div>
          <div class="info-row"><label>Coordinates:</label> <span>{{ selectedFarm.latitude }}, {{ selectedFarm.longitude }}</span></div>
          <div class="info-row"><label>Soil Type:</label> <span>{{ selectedFarm.soil_type }}</span></div>
          <div class="info-row"><label>Water Source:</label> <span>{{ selectedFarm.water_source }}</span></div>
          <div class="info-row">
            <label>Status:</label>
            <span :class="selectedFarm.is_active ? 'text-success' : 'text-danger'">
              {{ selectedFarm.is_active ? "Active" : "Inactive" }}
            </span>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, nextTick, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { getFarms } from '@/services/farmService'
import 'leaflet.heat';


// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
})

const farms = ref([])
const loading = ref(false)
const selectedFarm = ref(null)
const heatLayer = ref(null)
const map = ref(null)
const markersLayer = ref(null)
const mapElement = ref(null)

const searchQuery = ref('')
const selectedMunicipality = ref('all')
const userName = ref('all')
const municipalities = ref([])

const filteredFarms = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()

  return farms.value.filter(f => {
    if (selectedMunicipality.value !== 'all') {
      const muni = (f.municipality || f.farmer?.municipality || '').toLowerCase()
      if (muni !== (selectedMunicipality.value || '').toLowerCase()) return false
    }
     if (userName.value !== 'all') {
      const user = (f.farmer?.first_name || '').toLowerCase()
      if (user !== (userName.value || '').toLowerCase()) return false
    }
    if (!q) return true
    return (
      (f.farm_name || '').toLowerCase().includes(q) ||
      (f.farmer?.first_name || '').toLowerCase().includes(q) ||
      (f.farmer?.last_name || '').toLowerCase().includes(q) ||
      (f.municipality || f.farmer?.municipality || '').toLowerCase().includes(q)
    )
  })
})

const addHeatmap = (farmList) => {
  if (!map.value) return;

  const heatPoints = farmList
    .filter(f => !isNaN(parseFloat(f.latitude)) && !isNaN(parseFloat(f.longitude)))
    .map(f => [
      parseFloat(f.latitude),
      parseFloat(f.longitude),
      0.6 // intensity (0–1)
    ]);

  // Remove previous heatmap if exists
  if (heatLayer.value) {
    map.value.removeLayer(heatLayer.value);
  }

  // Create new heat cluster
  heatLayer.value = L.heatLayer(heatPoints, {
    radius: 25,
    blur: 15,
    maxZoom: 12
  });

  heatLayer.value.addTo(map.value);
};

const initMap = async () => {
  await nextTick();

  // Wait until the map element exists and has non-zero size (helps when inside hidden/transitioned containers)
  let attempts = 0;
  while (mapElement.value && (mapElement.value.offsetWidth === 0 || mapElement.value.offsetHeight === 0) && attempts < 10) {
    // small delay to allow layout to settle
    // eslint-disable-next-line no-await-in-loop
    await new Promise((res) => setTimeout(res, 100));
    attempts++;
  }

  if (!mapElement.value || mapElement.value.offsetWidth === 0 || mapElement.value.offsetHeight === 0) {
    console.warn('Map element not ready yet')
    return;
  }

   if (map.value) {
    console.warn("Map is already initialized");
    return;
  }

  map.value = L.map(mapElement.value, { scrollWheelZoom: true }).setView([12.8797, 121.7740], 6)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map.value)
  markersLayer.value = L.layerGroup().addTo(map.value)
}

const clearMarkers = () => {
  if (markersLayer.value?.clearLayers) markersLayer.value.clearLayers()
}

const addMarkers = (farmList) => {
  if (!map.value || !markersLayer.value) {
    console.warn("Map or markersLayer not ready yet");
    return;
  }

  clearMarkers();

  const bounds = [];

  farmList.forEach(f => {
    const lat = parseFloat(f.latitude);
    const lng = parseFloat(f.longitude);

    if (!isNaN(lat) && !isNaN(lng)) {
      const marker = L.marker([lat, lng]).addTo(markersLayer.value);

      marker.bindPopup(
        `<strong>${f.farm_name}</strong><br/>
         ${f.latitude}, ${f.longitude}`
      );

      marker.on('click', () => { selectedFarm.value = f });

      bounds.push([lat, lng]);
    }
  });

  if (bounds.length > 0) {
    map.value.fitBounds(bounds, { padding: [50, 50] });
  }
};


const loadFarms = async () => {
  loading.value = true
  try {
    const allFarms = await getFarms()
    farms.value = allFarms.filter(f => f.latitude && f.longitude)

    municipalities.value = [...new Set(farms.value.map(f => f.municipality || f.farmer?.municipality).filter(Boolean))]
    
    if (!map.value) await initMap()
    // Only add markers/heatmap after map is initialized
    addMarkers(filteredFarms.value)
    addHeatmap(filteredFarms.value)
  } catch (e) {
    console.error('Error loading farms:', e)
  } finally {
    loading.value = false
  }
}

const selectFarm = (farm) => {
  selectedFarm.value = farm
  if (map.value && farm.latitude && farm.longitude) {
    map.value.setView([parseFloat(farm.latitude), parseFloat(farm.longitude)], 15)
  }
}

const selectFarmFromList = (farm) => {
  selectFarm(farm)
  if (markersLayer.value && map.value) {
    markersLayer.value.eachLayer(layer => {
      const latlng = layer.getLatLng?.()
      if (latlng &&
          Math.abs(latlng.lat - parseFloat(farm.latitude)) < 0.0001 &&
          Math.abs(latlng.lng - parseFloat(farm.longitude)) < 0.0001) {
        layer.openPopup()
      }
    })
  }
}

const refreshMarkers = () => {
  loadFarms()
}

const applyFilter = () => {
  addMarkers(filteredFarms.value)
}

const clearFilter = () => {
  searchQuery.value = ''
  selectedMunicipality.value = 'all'
  addMarkers(filteredFarms.value)
}

onMounted(() => {
  watch(loading, async (val) => {
    if (val === false) {
      await nextTick();
      if (mapElement.value) {
        // ensure map is initialized before adding markers
        await initMap();
        if (map.value && markersLayer.value) {
          addMarkers(filteredFarms.value);
          addHeatmap(filteredFarms.value);
        }
      }
    }
  });

  loadFarms()
});

onBeforeUnmount(() => {
  if (map.value) {
    map.value.remove()
    map.value = null
  }
})
</script>

<style scoped>
.map-page {
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

.map-container {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 20px;
}

.map-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 15px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.farm-list {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow: auto;
}

.farm-card-list {
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #eef2f1;
  cursor: pointer;
}

.farm-card {
  border: 2px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.farm-card:hover {
  border-color: #1b5e20;
  box-shadow: 0 4px 12px rgba(27, 94, 32, 0.15);
  transform: translateY(-2px);
}

.farm-header {
  border-bottom: 2px solid #1b5e20;
  padding-bottom: 10px;
  margin-bottom: 10px;
}

.farm-header h4 {
  margin: 0;
  color: #1b5e20;
  font-size: 1.1rem;
}

.farm-info {
  font-size: 0.9rem;
  color: #333;
}

.farm-info p {
  margin: 5px 0;
}

.farm-footer {
  padding-top: 10px;
  margin-top: 10px;
  border-top: 1px solid #eee;
}

.selected-farm-panel {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 20px;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 2px solid #1b5e20;
  background: #f8f9fa;
}

.panel-header h3 {
  margin: 0;
  color: #1b5e20;
  font-size: 1.1rem;
}

.panel-content {
  padding: 15px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.info-row:last-child {
  border-bottom: none;
}

.info-row label {
  font-weight: 600;
  color: #555;
}

.info-row span {
  color: #333;
  text-align: right;
}

.text-success {
  color: #28a745;
  font-weight: 600;
}

.text-danger {
  color: #dc3545;
  font-weight: 600;
}

@media (max-width: 1024px) {
  .map-container {
    grid-template-columns: 1fr;
  }

  .selected-farm-panel {
    position: static;
  }
}
</style>
