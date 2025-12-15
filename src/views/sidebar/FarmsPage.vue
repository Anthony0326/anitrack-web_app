<template>
  <div class="farms-page">
    <div class="page-header">
      <h1>Farm Management</h1>
      <!-- <input
          v-model="searchQuery"
          type="search"
          class="form-control"
          placeholder="Search farm or municipality"
          style="max-width:360px; margin-right:-200px;"
        />
      <button @click="applyFilter" class="btn btn-outline-primary" style="margin-right: -90px;">
        <i class="bi bi-search"></i> Search
      </button> -->
      <button @click="showCreateModal = true" class="btn btn-success">
        <i class="bi bi-plus-circle"></i> Add New Farm
      </button>
    </div>

    <div v-if="error" class="alert alert-danger">{{ error }}</div>

    <!-- Farms Table -->
    <div class="table-responsive card shadow-sm">
      <table class="table table-hover mb-0">
        <thead class="table-dark">
          <tr>
            <th>Farm Name</th>
            <th>Total Area (ha)</th>
            <th>Soil Type</th>
            <th>Rice Variety</th>
            <th>Water Source</th>
            <th>Location<br>(latitude, longitude)</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="9" class="text-center py-4">
              <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </td>
          </tr>
          <tr v-else-if="farms.length === 0">
            <td colspan="9" class="text-center py-4 text-muted">No farms found</td>
          </tr>
          <tr v-for="farm in farms" :key="farm.id">
            <td><strong>{{ farm.farm_name }}</strong></td>
            <td>{{ farm.total_area }}</td>
            <td><span class="badge bg-info">{{ farm.soil_type }}</span></td>
            <td>{{ farm.rice_variety }}</td>
            <td>{{ farm.water_source }}</td>
            <td>{{ farm.latitude }}, {{ farm.longitude }}</td>
            <td>
              <span :class="farm.is_active ? 'badge bg-success' : 'badge bg-secondary'">
                {{ farm.is_active ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td>
              <button @click="editFarm(farm)" class="btn btn-sm btn-primary me-2" title="Edit">
                <i class="bi bi-pencil"></i>
              </button>
              <button @click="confirmDelete(farm)" class="btn btn-sm btn-danger" title="Delete">
                <i class="bi bi-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h5>{{ editingFarm ? 'Edit Farm' : 'Create New Farm' }}</h5>
          <button @click="closeModal" class="btn-close"></button>
        </div>
        <form @submit.prevent="saveFarm" class="modal-body">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label">Farm Name *</label>
              <input v-model="formData.farm_name" type="text" class="form-control" required />
            </div>
            <div class="col-md-6">
              <label class="form-label">Total Area (hectares) *</label>
              <input v-model.number="formData.total_area" type="number" step="0.01" class="form-control" required />
            </div>
            <div class="col-md-6">
              <label class="form-label">Soil Type *</label>
              <select v-model="formData.soil_type" class="form-control" required>
                <option value="">Select soil type</option>
                <option value="clay">Clay</option>
                <option value="loam">Loam</option>
                <option value="sandy">Sandy</option>
                <option value="clay_loam">Clay Loam</option>
                <option value="silty_loam">Silty Loam</option>
              </select>
            </div>
            <div class="col-md-6">
              <label class="form-label">Rice Variety *</label>
              <input v-model="formData.rice_variety" type="text" class="form-control" required />
            </div>
            <div class="col-md-6">
              <label class="form-label">Water Source *</label>
              <select v-model="formData.water_source" class="form-control" required>
                <option value="">Select water source</option>
                <option value="irrigation">Irrigation</option>
                <option value="rainfed">Rainfed</option>
                <option value="deep_well">Deep Well</option>
                <option value="river">River</option>
              </select>
            </div>
            <div class="col-md-12">
              <label class="form-label">Location on Map</label>
              <div class="location-input-group">
                <input 
                  type="text" 
                  class="form-control" 
                  :value="`Lat: ${formData.latitude}, Lng: ${formData.longitude}`"
                  disabled 
                  placeholder="Click 'Pick Location' button to select from map"
                />
                <button 
                  @click.prevent="showMapPicker = true" 
                  type="button" 
                  class="btn btn-outline-primary"
                  title="Open map to select location"
                >
                  <i class="bi bi-geo-alt"></i> Pick Location
                </button>
              </div>
            </div>
            <div class="col-md-6">
              <label class="form-label">Elevation (m)</label>
              <input v-model.number="formData.elevation" type="number" class="form-control" />
            </div>
            <div class="col-md-12">
              <label class="form-check-label">
                <input v-model="formData.is_active" type="checkbox" class="form-check-input" />
                Active
              </label>
            </div>
          </div>
        </form>
        <div class="modal-footer">
          <button @click="closeModal" class="btn btn-secondary">Cancel</button>
          <button @click="saveFarm" class="btn btn-primary" :disabled="saving">
            {{ saving ? 'Saving...' : 'Save Farm' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Map Picker Modal -->
    <div v-if="showMapPicker" class="modal-overlay" @click.self="closeMapPicker">
      <div class="modal-content map-modal">
        <div class="modal-header">
          <h5>Select Farm Location</h5>
          <button @click="closeMapPicker" class="btn-close"></button>
        </div>
        <div class="map-picker-container">
          <div ref="mapPickerElement" id="mapPicker" style="width: 100%; height: 400px;"></div>
        </div>
        <div class="modal-footer">
          <button @click="closeMapPicker" class="btn btn-secondary">Cancel</button>
          <button @click="confirmLocation" class="btn btn-primary">Confirm Location</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { getFarms, createFarm, updateFarm, deleteFarm } from '@/services/farmService'
import Swal from 'sweetalert2'

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
})

const farms = ref([])
const loading = ref(false)
const saving = ref(false)
const error = ref(null)
const showCreateModal = ref(false)
const showMapPicker = ref(false)
const editingFarm = ref(null)

const mapPickerElement = ref(null)
let mapPickerInstance = null
let selectedMarker = null

const formData = ref({
  farm_name: '',
  total_area: null,
  soil_type: '',
  rice_variety: '',
  water_source: '',
  latitude: null,
  longitude: null,
  elevation: null,
  is_active: true
})

const loadFarms = async () => {
  loading.value = true
  error.value = null
  try {
    farms.value = await getFarms()
  } catch (e) {
    error.value = 'Failed to load farms'
    console.error(e)
  } finally {
    loading.value = false
  }
}


const editFarm = (farm) => {
  editingFarm.value = farm
  formData.value = { ...farm }
  showCreateModal.value = true
}

const resetForm = () => {
  formData.value = {
    farm_name: '',
    total_area: null,
    soil_type: '',
    rice_variety: '',
    water_source: '',
    latitude: null,
    longitude: null,
    elevation: null,
    is_active: true
  }
  editingFarm.value = null
}

const saveFarm = async () => {
  saving.value = true
  error.value = null
  try {
    if (editingFarm.value) {
      await updateFarm(editingFarm.value.id, formData.value)
      Swal.fire('Success', 'Farm updated successfully', 'success')
    } else {
      await createFarm(formData.value)
      Swal.fire('Success', 'Farm created successfully', 'success')
    }
    closeModal()
    await loadFarms()
  } catch (e) {
    error.value = e.response?.data?.message || 'Failed to save farm'
    Swal.fire('Error', error.value, 'error')
  } finally {
    saving.value = false
  }
}

const confirmDelete = async (farm) => {
  const result = await Swal.fire({
    title: 'Delete Farm?',
    // text: `Are you sure you want to delete "${farm.farm_name}"?`,
    text: `This account will be deleted automatically if it is no longer active in 150 days.`,
    icon: 'warning',
    showCancelButton: true,
    //confirmButtonText: 'Yes, delete it',
    cancelButtonText: 'Cancel'
  })

  if (result.isConfirmed) {
    try {
      await deleteFarm(farm.id)
      Swal.fire('Deleted!', 'Farm deleted successfully', 'success')
      await loadFarms()
    } catch (e) {
      console.error('Delete error:', e)
      console.error('Error response:', e.response?.data)
      console.error('Error status:', e.response?.status)
      const errorMsg = 'Failed to delete farm'
      Swal.fire('Error', errorMsg, 'error')
    }
  }
}

const initMapPicker = async () => {
  await nextTick()
  
  if (!mapPickerElement.value) {
    console.error('Map picker element not found')
    return
  }

  try {
    // Clean up existing map
    if (mapPickerInstance) {
      mapPickerInstance.remove()
      mapPickerInstance = null
    }
    
    // Clear leaflet id
    if (mapPickerElement.value._leaflet_id) {
      delete mapPickerElement.value._leaflet_id
    }

    // Create new map
    mapPickerInstance = L.map(mapPickerElement.value).setView([12.8797, 121.7740], 6)
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapPickerInstance)

    // Add existing marker if there's a location
    if (formData.value.latitude && formData.value.longitude) {
      selectedMarker = L.marker([formData.value.latitude, formData.value.longitude], {
        draggable: true
      }).addTo(mapPickerInstance)
      
      selectedMarker.on('dragend', () => {
        const latlng = selectedMarker.getLatLng()
        formData.value.latitude = latlng.lat
        formData.value.longitude = latlng.lng
      })
      
      mapPickerInstance.setView([formData.value.latitude, formData.value.longitude], 12)
    }

    // Handle map clicks
    mapPickerInstance.on('click', (e) => {
      if (selectedMarker) {
        mapPickerInstance.removeLayer(selectedMarker)
      }
      
      selectedMarker = L.marker(e.latlng, {
        draggable: true
      }).addTo(mapPickerInstance)
      
      selectedMarker.on('dragend', () => {
        const latlng = selectedMarker.getLatLng()
        formData.value.latitude = latlng.lat
        formData.value.longitude = latlng.lng
      })
      
      formData.value.latitude = e.latlng.lat
      formData.value.longitude = e.latlng.lng
    })

    // Force resize
    setTimeout(() => {
      if (mapPickerInstance) {
        mapPickerInstance.invalidateSize()
      }
    }, 100)

  } catch (e) {
    console.error('Error initializing map picker:', e)
  }
}

const confirmLocation = () => {
  if (formData.value.latitude && formData.value.longitude) {
    closeMapPicker()
  } else {
    Swal.fire('Error', 'Please select a location on the map', 'error')
  }
}

const closeMapPicker = () => {
  showMapPicker.value = false
  if (mapPickerInstance) {
    try {
      mapPickerInstance.remove()
    } catch (e) {
      console.log('Error removing map:', e)
    }
    mapPickerInstance = null
  }
}

const closeModal = () => {
  showCreateModal.value = false
  resetForm()
}



// Lifecycle hooks
import { onMounted, watch } from 'vue'

onMounted(() => {
  loadFarms()
})

watch(showMapPicker, (newVal) => {
  if (newVal) {
    setTimeout(() => {
      initMapPicker()
    }, 100)
  }
})
</script>

<style scoped>
.farms-page {
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

.table-responsive {
  border-radius: 8px;
  overflow: hidden;
}

.table {
  margin-bottom: 0;
}

.table thead {
  background: #1b5e20;
}

.table tbody tr:hover {
  background: #f0f8f5;
}

.btn-sm {
  padding: 0.4rem 0.6rem;
  font-size: 0.85rem;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #dee2e6;
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #dee2e6;
}

.location-input-group {
  display: flex;
  gap: 10px;
}

.location-input-group .form-control {
  flex: 1;
}

.location-input-group .btn {
  white-space: nowrap;
}

.map-modal {
  max-width: 800px;
}

.map-picker-container {
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
}
</style>
