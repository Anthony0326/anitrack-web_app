import { createRouter, createWebHistory } from 'vue-router'

//SideBar
import DashboardPage from '@/views/sidebar/DashboardPage.vue'
import OverviewPage from '@/views/sidebar/OverViewPage.vue'
import ReportsPage from '@/views/sidebar/ReportsPage.vue'
import SettingPage from '@/views/sidebar/SettingPage.vue'
import Employee from '@/views/sidebar/EmployePage.vue'
import MapPage from '@/views/sidebar/MapPage.vue'
import WeatherPage from '@/views/sidebar/WeatherPage.vue'
import FarmsPage from '@/views/sidebar/FarmsPage.vue'


const routes = [
  {
    path: '/',
    name: 'Login',
    component: () => import('../views/login/register/LoginView.vue')
  },
  {
    path: '/register',
    name: 'Registration',
    component: () => import('../views/login/register/RegistrationView.vue')
  },
  {
    path: '/main',
    name: 'MainComponet',
    component: () => import('../views/MainView.vue'),
    children:[
      {
        path: 'dashboard',
        component: DashboardPage
      },
      {
        path: 'overview',
        component: OverviewPage
      },
      {
        path: 'reports',
        component: ReportsPage
      },
      {
        path: 'employee',
        component: Employee
      },
      {
        path: 'setting',
        component: SettingPage
      },
      {
        path: 'map',
        component: MapPage
      },
      {
        path: 'farms',
        component: FarmsPage
      },
      {
        path: 'weather',
        component: WeatherPage
      }
    ]
  },
  {
    path: '/list',
    name: 'list',
    component: () => import('../views/ListView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})
export default router
