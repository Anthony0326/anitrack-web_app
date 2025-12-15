<template>
  <div class="d-flex" id="wrapper">
    <div class="bg-light border-right" id="sidebar-wrapper">
      <div class="sidebar-heading d-flex align-items-center justify-content-between">
        <img src="@/assets/anilogo.png" alt="AniTrack Logo" /> <span class="logo">AniTrack</span>
      </div>
      <div class="list-group list-group-flush">
        <router-link to="/main/dashboard" class="list-group-item list-group-item-action">
          <i class="bi bi-speedometer2"></i> <span>Dashboard</span>
        </router-link>
        <router-link to="/main/overview" class="list-group-item list-group-item-action">
          <i class="bi bi-eye"></i> <span>Overview</span>
        </router-link>
        <router-link to="/main/map" class="list-group-item list-group-item-action">
          <i class="bi bi-map"></i> <span>Map</span>
        </router-link>
        <router-link to="/main/farms" class="list-group-item list-group-item-action">
          <i class="bi bi-folder2-open"></i> <span>Farms</span>
        </router-link>
        <router-link to="/main/reports" class="list-group-item list-group-item-action">
          <i class="bi bi-bar-chart"></i> <span>Reports</span>
        </router-link>
        <!-- <router-link to="/main/setting" class="list-group-item list-group-item-action">
          <i class="bi bi-person-circle"></i> <span>Settings</span>
        </router-link> -->
        <a href="javascript:void(0)" class="list-group-item list-group-item-action" @click="logout()">
          <i class="bi bi-box-arrow-right"></i> <span>Logout</span>
        </a>
      </div>
    </div>

    <div id="page-content-wrapper">
      <nav class="navbar navbar-expand-lg border-bottom d-flex align-items-center">
        <div class="d-flex align-items-center">
          <h1 class="header_name">Admin | <u>{{ userName }}</u></h1>
          <p class="date">Today is: <u>{{ new Date().toLocaleDateString() }}</u></p>
        </div>
      </nav>

      <div class="container-fluid">
        <router-view/>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'

const userStore = useUserStore()
const router = useRouter()

const userName = computed(() => {
  const user = userStore.user
  if (user) return `${user.first_name || 'User'} ${user.last_name || ''}`
  return 'Admin'
})



const swal = Swal // using SweetAlert directly here
const logout = () => {
  swal.fire({
    title: "Log out",
    text: "Are you sure you want to logout?",
    icon: "question",
    showCancelButton: true,
    cancelButtonText: "No",
    confirmButtonText: "Yes",
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.removeItem("token")
      router.push("/")
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      Swal.fire("Cancelled", "Your session is still active", "error")
    }
  })
}
</script>

<style scoped>
#sidebar-wrapper {
  min-width: 250px;
  max-width: 250px;
  background: linear-gradient(180deg, #141f15, #1b5e20);
  color: #fdf6e3;
  transition: all 0.3s;
  height: 100vh;
  box-shadow: 4px 0 12px rgba(0,0,0,0.2);
}

.date {
  margin-left: 600px;
  margin-top: 50px;
  font-size: 1.1rem;
  color: #555;
}

img {
  height: 60px;
  margin-right: 15px;
}

/* profile image styles */
.profile-container {
  margin-left: 15px;
  margin-top: 30px;
  margin-right: 60px;
}
.profile-img {
  height: 60px;
  width: 60px;
  object-fit: cover;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid rgba(0,0,0,0.1);
}

.sidebar-heading {
  padding: 20px;
  font-size: 1.25rem;
  font-weight: bold;
  text-align: center;
  border-bottom: 1px solid rgba(255,255,255,0.2);
  color: #fdf6e3;
}

.list-group-item {
  background: transparent;
  color: #fdf6e3;
  border: none;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: background 0.2s, color 0.2s;
}

.container-fluid {
  overflow-y: auto;
  overflow-x: hidden;
  max-height: calc(100vh - 80px);
  padding-right: 2px;
  padding-left: 2px;
  padding-bottom: 20px;
}

.list-group-item:hover {
  background: rgba(255, 215, 0, 0.2);
  color: #fff;
  cursor: pointer;
}

.list-group-item i {
  font-size: 1.2rem;
}

#page-content-wrapper {
  flex: 1;
  background: linear-gradient(135deg, #ddd9ce 0%, #e8e4d9 100%);
  margin-top: -30px;
  padding-top: -90px;
  transition: all 0.3s;
}

.toggle-btn {
  background: #4caf4f00;
  color: #fdf6e3;
  border: none;
}
.toggle-btn:hover {
  background: #66bb6a;
}

.header_name {
  font-size: 2rem;
  margin-top: 40px;
  margin-left: 30px;
  color: #333;
}

#wrapper {
  display: flex;
  flex-direction: row;
}

#wrapper.toggled #sidebar-wrapper {
  margin-left: -250px;
}
.logo {
  font-size: 2rem;
  margin-right: 40px;
  font-weight: bold;
  color: #fdf6e3;
}
</style>