<template>
  <div class="profile-page">
    <div class="profile-header">
      <h1>My Profile</h1>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div v-else class="button-section">
      <button class="btn btn-lg btn-primary me-3" @click="activeTab = 'information'">
        <i class="bi bi-info-circle"></i> Update Information
      </button>
      <button class="btn btn-lg btn-warning me-3" @click="activeTab = 'audit'">
        <i class="bi bi-shield-check"></i> Audit Logs
      </button>
      <button class="btn btn-lg btn-danger" @click="activeTab = 'history'">
        <i class="bi bi-clock-history"></i> History Logs
      </button>
    </div>

    <!-- Update Information Modal -->
    <div v-if="activeTab === 'information'" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3><i class="bi bi-info-circle"></i> Update Information</h3>
          <button class="close-btn" @click="closeModal">&times;</button>
        </div>
        <form @submit.prevent="updateInformation" class="row g-3">
          <div class="col-md-6">
            <label class="form-label">First Name *</label>
            <input v-model="user.first_name" type="text" class="form-control" required />
          </div>
          <div class="col-md-6">
            <label class="form-label">Middle Name</label>
            <input v-model="user.middle_name" type="text" class="form-control" />
          </div>
          <div class="col-md-6">
            <label class="form-label">Last Name *</label>
            <input v-model="user.last_name" type="text" class="form-control" required />
          </div>
          <div class="col-md-6">
            <label class="form-label">Email (Read-only)</label>
            <input v-model="user.email" type="email" class="form-control" disabled />
          </div>
          <div class="col-md-6">
            <label class="form-label">Phone</label>
            <input v-model="user.phone" type="tel" class="form-control" />
          </div>
          <div class="col-md-6">
            <label class="form-label">Birthdate</label>
            <input v-model="user.birthdate" type="date" class="form-control" />
          </div>
          <div class="col-md-12">
            <label class="form-label">Barangay</label>
            <input v-model="user.barangay" type="text" class="form-control" />
          </div>
          <div class="col-md-6">
            <label class="form-label">Municipality</label>
            <input v-model="user.municipality" type="text" class="form-control" />
          </div>
          <div class="col-md-6">
            <label class="form-label">Province</label>
            <input v-model="user.province" type="text" class="form-control" />
          </div>
          <!-- <div class="col-md-6">
            <label class="form-label">Years Farming</label>
            <input v-model.number="user.years_farming" type="number" class="form-control" />
          </div> -->
          <div class="col-md-12 mt-4">
            <button type="submit" class="btn btn-success" :disabled="updating">
              <i class="bi bi-check-circle"></i>
              {{ updating ? 'Updating...' : 'Update Information' }}
            </button>
            <button type="button" class="btn btn-secondary ms-2" @click="resetForm">
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Audit Logs Modal -->
    <div v-if="activeTab === 'audit'" class="modal-overlay" @click="closeModal">
      <div class="modal-content modal-lg" @click.stop>
        <div class="modal-header">
          <h3><i class="bi bi-shield-check"></i> Audit Logs</h3>
          <button class="close-btn" @click="closeModal">&times;</button>
        </div>
        <div class="table-responsive">
          <table class="table table-striped table-hover">
            <thead class="table-dark">
              <tr>
                <th>Date & Time</th>
                <th>Action</th>
                <th>IP Address</th>
                <th>Device</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="auditLogs.length === 0">
                <td colspan="5" class="text-center text-muted py-4">No audit logs available</td>
              </tr>
              <tr v-for="log in auditLogs" :key="log.id">
                <td>{{ formatDate(log.timestamp) }}</td>
                <td>
                  <span class="badge" :class="getActionBadge(log.action)">
                    {{ log.action }}
                  </span>
                </td>
                <td>{{ log.ip_address || 'N/A' }}</td>
                <td>{{ log.device || 'N/A' }}</td>
                <td>
                  <span class="badge" :class="getStatusBadge(log.status)">
                    {{ log.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- History Logs Modal -->
    <div v-if="activeTab === 'history'" class="modal-overlay" @click="closeModal">
      <div class="modal-content modal-lg" @click.stop>
        <div class="modal-header">
          <h3><i class="bi bi-clock-history"></i> History Logs</h3>
          <button class="close-btn" @click="closeModal">&times;</button>
        </div>
        <div class="table-responsive">
          <table class="table table-striped table-hover">
            <thead class="table-dark">
              <tr>
                <th>Date & Time</th>
                <th>Field</th>
                <th>Old Value</th>
                <th>New Value</th>
                <th>Changed By</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="historyLogs.length === 0">
                <td colspan="5" class="text-center text-muted py-4">No history logs available</td>
              </tr>
              <tr v-for="log in historyLogs" :key="log.id">
                <td>{{ formatDate(log.timestamp) }}</td>
                <td>
                  <span class="badge bg-info">{{ log.field }}</span>
                </td>
                <td>
                  <code>{{ log.old_value || '-' }}</code>
                </td>
                <td>
                  <code>{{ log.new_value || '-' }}</code>
                </td>
                <td>{{ log.changed_by || 'System' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { useUserStore } from '@/stores/user'
import Swal from 'sweetalert2'

export default {
  data() {
    return {
      user: {},
      originalUser: {},
      loading: true,
      updating: false,
      activeTab: null,
      auditLogs: [],
      historyLogs: [],
      auditLogsLoading: false,
      historyLogsLoading: false
    }
  },
  computed: {
    userStore() {
      return useUserStore()
    }
  },
  async created() {
    const storeUser = useUserStore().user
    if (storeUser) {
      this.user = { ...storeUser }
      this.originalUser = JSON.parse(JSON.stringify(this.user))
    }
    await this.loadUserData()
    await this.loadAuditLogs()
    await this.loadHistoryLogs()
  },
  methods: {
    async loadUserData() {
      this.loading = true
      try {
        const res = await axios.get('/user')
        this.user = res.data?.data?.user ?? res.data?.user ?? res.data
        this.originalUser = JSON.parse(JSON.stringify(this.user))
      } catch (e) {
        console.error('Failed to load profile', e)
        Swal.fire('Error', 'Failed to load profile data', 'error')
      } finally {
        this.loading = false
      }
    },
    async loadAuditLogs() {
      this.auditLogsLoading = true
      try {
        const res = await axios.get('/user/audit-logs')
        const data = res.data?.data || res.data || []
        this.auditLogs = Array.isArray(data) ? data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) : []
      } catch (e) {
        console.error('Failed to load audit logs', e)
        Swal.fire('Error', 'Failed to load audit logs', 'error')
        this.auditLogs = []
      } finally {
        this.auditLogsLoading = false
      }
    },
    async loadHistoryLogs() {
      this.historyLogsLoading = true
      try {
        const res = await axios.get('/user/history-logs')
        const data = res.data?.data || res.data || []
        this.historyLogs = Array.isArray(data) ? data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) : []
      } catch (e) {
        console.error('Failed to load history logs', e)
        Swal.fire('Error', 'Failed to load history logs', 'error')
        this.historyLogs = []
      } finally {
        this.historyLogsLoading = false
      }
    },
    async updateInformation() {
      const hasChanges = JSON.stringify(this.user) !== JSON.stringify(this.originalUser)
      if (!hasChanges) {
        Swal.fire('Info', 'No changes detected', 'info')
        return
      }

      this.updating = true
      try {
        const payload = { ...this.user }
        const res = await axios.put('/user', payload)
        const updatedUser = res.data?.data?.user ?? res.data?.user ?? res.data
        
        this.user = updatedUser
        this.originalUser = JSON.parse(JSON.stringify(this.user))
        this.userStore.setUser(this.user)
        
        Swal.fire('Success', 'Information updated successfully', 'success')
        await this.loadHistoryLogs()
        this.closeModal()
      } catch (e) {
        console.error('Update error', e)
        Swal.fire('Error', e.response?.data?.message || 'Failed to update information', 'error')
      } finally {
        this.updating = false
      }
    },
    resetForm() {
      this.user = JSON.parse(JSON.stringify(this.originalUser))
      Swal.fire('Info', 'Form reset to original values', 'info')
    },
    closeModal() {
      this.activeTab = null
    },
    formatDate(dateString) {
      if (!dateString) return 'N/A'
      const date = new Date(dateString)
      return date.toLocaleString()
    },
    getActionBadge(action) {
      const badges = {
        'LOGIN': 'bg-success',
        'LOGOUT': 'bg-warning',
        'UPDATE': 'bg-info',
        'DELETE': 'bg-danger',
        'CREATE': 'bg-primary',
        'VIEW': 'bg-secondary'
      }
      return badges[action] || 'bg-secondary'
    },
    getStatusBadge(status) {
      const badges = {
        'SUCCESS': 'bg-success',
        'FAILED': 'bg-danger',
        'PENDING': 'bg-warning'
      }
      return badges[status] || 'bg-secondary'
    }
  }
}
</script>


<style scoped>
.profile-page {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.profile-header {
  margin-bottom: 30px;
  border-bottom: 2px solid #1b5e20;
  padding-bottom: 15px;
}

.profile-header h1 {
  color: #1b5e20;
  font-size: 2rem;
  margin: 0;
}

.button-section {
  display: flex;
  gap: 15px;
  margin-top: 30px;
  flex-wrap: wrap;
}

.btn {
  padding: 12px 24px;
  font-weight: 600;
  border-radius: 6px;
  border: none;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.btn-primary {
  background: #1b5e20;
  color: #fff;
}

.btn-primary:hover {
  background: #134e10;
}

.btn-warning {
  background: #ffc107;
  color: #333;
}

.btn-warning:hover {
  background: #e0a800;
}

.btn-danger {
  background: #dc3545;
  color: #fff;
}

.btn-danger:hover {
  background: #c82333;
}

.btn-success {
  background: #28a745;
  color: #fff;
}

.btn-success:hover {
  background: #218838;
}

.btn-secondary {
  background: #6c757d;
  color: #fff;
}

.btn-secondary:hover {
  background: #5a6268;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  padding: 20px;
}

.modal-content {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
  max-width: 600px;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  animation: slideIn 0.3s ease;
}

.modal-content.modal-lg {
  max-width: 900px;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 2px solid #1b5e20;
  background: #f8f9fa;
}

.modal-header h3 {
  margin: 0;
  color: #1b5e20;
  display: flex;
  align-items: center;
  gap: 8px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #6c757d;
  transition: color 0.3s ease;
}

.close-btn:hover {
  color: #333;
}

.modal-content > form,
.modal-content > .table-responsive {
  padding: 25px;
}

.form-label {
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.form-control {
  border-radius: 6px;
  border: 1px solid #ddd;
  padding: 10px 12px;
  transition: all 0.3s ease;
}

.form-control:focus {
  border-color: #1b5e20;
  box-shadow: 0 0 0 0.2rem rgba(27, 94, 32, 0.25);
}

.form-control:disabled {
  background: #e9ecef;
  color: #6c757d;
}

/* Table Styles */
.table {
  margin-bottom: 0;
}

.table thead {
  background: #1b5e20;
  color: #fff;
}

.table tbody tr:hover {
  background: #f0f8f5;
}

.table td {
  vertical-align: middle;
  padding: 12px;
}

.table-responsive {
  border-radius: 6px;
  overflow: hidden;
}

.badge {
  padding: 6px 12px;
  font-weight: 500;
  font-size: 0.85rem;
}

.badge.bg-success {
  background: #28a745 !important;
}

.badge.bg-danger {
  background: #dc3545 !important;
}

.badge.bg-warning {
  background: #ffc107 !important;
  color: #333;
}

.badge.bg-info {
  background: #17a2b8 !important;
}

.badge.bg-primary {
  background: #007bff !important;
}

.badge.bg-secondary {
  background: #6c757d !important;
}

code {
  background: #f8f9fa;
  padding: 2px 6px;
  border-radius: 3px;
  color: #e83e8c;
  font-size: 0.9rem;
}

.text-muted {
  color: #6c757d !important;
  font-size: 0.9rem;
}

.spinner-border {
  color: #1b5e20;
}

/* Responsive */
@media (max-width: 768px) {
  .button-section {
    flex-direction: column;
  }

  .btn-lg {
    width: 100%;
  }

  .modal-content {
    max-width: 95vw;
  }

  .modal-header {
    padding: 15px;
  }

  .modal-content > form,
  .modal-content > .table-responsive {
    padding: 15px;
  }

  .table {
    font-size: 0.9rem;
  }

  .table td {
    padding: 8px;
  }
}
</style>
