<template>
  <div class="employee-page">
    <div class="page-header">
      <h1>Employee / Farmer Management</h1>
      <button @click="showCreateModal = true" class="btn btn-success">
        <i class="bi bi-plus-circle"></i> Add New Farmer
      </button>
    </div>

    <div v-if="error" class="alert alert-danger">{{ error }}</div>

    <!-- Farmers Table -->
    <div class="table-responsive card shadow-sm">
      <table class="table table-hover mb-0">
        <thead class="table-dark">
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Role</th>
            <th>Location</th>
            <th>Years Farming</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="8" class="text-center py-4">
              <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </td>
          </tr>
          <tr v-else-if="users.length === 0">
            <td colspan="8" class="text-center py-4 text-muted">No farmers found</td>
          </tr>
          <tr v-for="user in users" :key="user.id">
            <td><strong>{{ user.first_name }} {{ user.last_name }}</strong></td>
            <td>{{ user.email }}</td>
            <td>{{ user.phone || 'N/A' }}</td>
            <td><span class="badge bg-primary">{{ user.role }}</span></td>
            <td>{{ user.municipality || 'N/A' }}</td>
            <td>{{ user.years_farming || '—' }}</td>
            <td>
              <span :class="user.is_active ? 'badge bg-success' : 'badge bg-secondary'">
                {{ user.is_active ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td>
              <button @click="editUser(user)" class="btn btn-sm btn-primary me-2" title="Edit">
                <i class="bi bi-pencil"></i>
              </button>
              <button @click="confirmDelete(user)" class="btn btn-sm btn-danger" title="Delete">
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
          <h5>{{ editingUser ? 'Edit Farmer' : 'Add New Farmer' }}</h5>
          <button @click="closeModal" class="btn-close"></button>
        </div>
        <form @submit.prevent="saveUser" class="modal-body">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label">First Name *</label>
              <input v-model="formData.first_name" type="text" class="form-control" required />
            </div>
            <div class="col-md-6">
              <label class="form-label">Last Name *</label>
              <input v-model="formData.last_name" type="text" class="form-control" required />
            </div>
            <div class="col-md-6">
              <label class="form-label">Middle Name</label>
              <input v-model="formData.middle_name" type="text" class="form-control" />
            </div>
            <div class="col-md-6">
              <label class="form-label">Email *</label>
              <input v-model="formData.email" type="email" class="form-control" required />
            </div>
            <div class="col-md-6">
              <label class="form-label">Phone</label>
              <input v-model="formData.phone" type="tel" class="form-control" />
            </div>
            <div class="col-md-6">
              <label class="form-label">Role *</label>
              <select v-model="formData.role" class="form-control" required>
                <option value="">Select role</option>
                <option value="farmer">Farmer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div class="col-md-6">
              <label class="form-label">Birthdate</label>
              <input v-model="formData.birthdate" type="date" class="form-control" />
            </div>
            <div class="col-md-6">
              <label class="form-label">Years Farming</label>
              <input v-model.number="formData.years_farming" type="number" class="form-control" />
            </div>
            <div class="col-md-6">
              <label class="form-label">Barangay</label>
              <input v-model="formData.barangay" type="text" class="form-control" />
            </div>
            <div class="col-md-6">
              <label class="form-label">Municipality</label>
              <input v-model="formData.municipality" type="text" class="form-control" />
            </div>
            <div class="col-md-6">
              <label class="form-label">Province</label>
              <input v-model="formData.province" type="text" class="form-control" />
            </div>
            <div class="col-md-6">
              <label class="form-label">Address</label>
              <input v-model="formData.address" type="text" class="form-control" />
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
          <button @click="saveUser" class="btn btn-primary" :disabled="saving">
            {{ saving ? 'Saving...' : 'Save Farmer' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getUsers, createUser, updateUser, deleteUser } from '@/services/userService'
import Swal from 'sweetalert2'

const users = ref([])
const loading = ref(false)
const saving = ref(false)
const error = ref(null)
const showCreateModal = ref(false)
const editingUser = ref(null)

const formData = ref({
  first_name: '',
  middle_name: '',
  last_name: '',
  email: '',
  phone: '',
  role: 'farmer',
  birthdate: '',
  years_farming: null,
  barangay: '',
  municipality: '',
  province: '',
  address: '',
  is_active: true
})

const loadUsers = async () => {
  loading.value = true
  error.value = null
  try {
    users.value = await getUsers()
  } catch (e) {
    error.value = 'Failed to load farmers'
    console.error(e)
  } finally {
    loading.value = false
  }
}

const editUser = (user) => {
  editingUser.value = user
  formData.value = { ...user }
  showCreateModal.value = true
}

const resetForm = () => {
  formData.value = {
    first_name: '',
    middle_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: 'farmer',
    birthdate: '',
    years_farming: null,
    barangay: '',
    municipality: '',
    province: '',
    address: '',
    is_active: true
  }
  editingUser.value = null
}

const saveUser = async () => {
  if (!formData.value.email) {
    Swal.fire('Error', 'Email is required', 'error')
    return
  }

  saving.value = true
  error.value = null
  try {
    if (editingUser.value) {
      await updateUser(editingUser.value.id, formData.value)
      Swal.fire('Success', 'Farmer updated successfully', 'success')
    } else {
      await createUser(formData.value)
      Swal.fire('Success', 'Farmer created successfully', 'success')
    }
    closeModal()
    await loadUsers()
  } catch (e) {
    error.value = e.response?.data?.message || 'Failed to save farmer'
    Swal.fire('Error', error.value, 'error')
  } finally {
    saving.value = false
  }
}

const confirmDelete = async (user) => {
  const result = await Swal.fire({
    title: 'Delete Farmer?',
    text: `Are you sure you want to delete "${user.first_name} ${user.last_name}"?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it',
    cancelButtonText: 'Cancel'
  })

  if (result.isConfirmed) {
    try {
      await deleteUser(user.id)
      Swal.fire('Deleted!', 'Farmer deleted successfully', 'success')
      await loadUsers()
    } catch (e) {
      Swal.fire('Error', 'Failed to delete farmer', 'error')
    }
  }
}

const closeModal = () => {
  showCreateModal.value = false
  resetForm()
}

onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.employee-page {
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
  max-width: 700px;
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

.form-label {
  font-weight: 600;
}
</style>
