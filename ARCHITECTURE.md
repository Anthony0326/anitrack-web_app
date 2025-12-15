# 🏗️ Application Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    CRUD Farm Management App                      │
│                         (Vue 3 + Vite)                           │
└─────────────────────────────────────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
            ┌───────▼───────┐        ┌──────▼───────┐
            │   Frontend    │        │   Backend    │
            │  (Vue 3 SPA)  │        │ (Laravel API)│
            │               │        │              │
            │  Port: 8080   │────────│ Port: 8000   │
            └───────────────┘        └──────────────┘
```

---

## Frontend Architecture

### Layer 1: UI Components (Vue)
```
SideBar (Navigation)
    │
    ├── DashboardPage (Analytics KPIs)
    ├── OverViewPage (System Overview)
    ├── ProfilePage (User Profile)
    ├── FarmsPage (CRUD Operations)
    ├── EmployePage (CRUD Operations)
    ├── MapPage (Geolocation)
    ├── ReportsPage (Analytics & Export)
    └── WeatherPage (Weather Data)
```

### Layer 2: Services (API Abstraction)
```
Services/
├── farmService.js          → /farms endpoints
├── userService.js          → /users endpoints
├── analyticsService.js     → /analytics endpoints
├── backendService.js       → Generic endpoints
└── weatherService.js       → Weather endpoints

All services use:
└── axios (HTTP client with Bearer token interceptor)
```

### Layer 3: State Management (Pinia)
```
stores/
└── user.js
    ├── state: { user, token, roles }
    └── getters/actions for user management
```

### Layer 4: Router (Vue Router)
```
router/
└── index.js
    ├── /               (Login)
    ├── /register       (Registration)
    └── /main           (Dashboard Layout)
        ├── /dashboard  → DashboardPage
        ├── /overview   → OverViewPage
        ├── /profile    → ProfilePage
        ├── /farms      → FarmsPage
        ├── /employee   → EmployePage
        ├── /map        → MapPage
        ├── /reports    → ReportsPage
        └── /weather    → WeatherPage
```

---

## Data Flow Diagram

### Example: Create Farm

```
User Input
    │
    ▼
┌─────────────────────────────────┐
│  FarmsPage Component            │
│  - Manages formData (ref)        │
│  - Shows modal form              │
│  - Calls saveFarm()              │
└─────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────┐
│  farmService.createFarm(data)   │
│  - Uses axios.post()             │
│  - Includes Bearer token         │
│  - Returns farm object           │
└─────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────┐
│  Axios Interceptor               │
│  - Adds Authorization header    │
│  - Sets base URL                 │
│  - Handles response/error        │
└─────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────┐
│  Laravel Backend                │
│  POST /api/farms                │
│  - Validates input              │
│  - Creates farm record          │
│  - Returns created farm         │
└─────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────┐
│  Response Handler                │
│  ✅ Success:                      │
│    - Close modal                 │
│    - Reload farms list           │
│    - Show success notification   │
│                                  │
│  ❌ Error:                        │
│    - Show error message          │
│    - Log to console              │
│    - Keep modal open             │
└─────────────────────────────────┘
```

### Example: View Farms

```
Component Mounts
    │
    ▼
onMounted() Hook
    │
    ├─→ loadFarms() function
    │   │
    │   └─→ farmService.getFarms()
    │       │
    │       ▼
    │   Axios GET /api/farms
    │       │
    │       ▼
    │   Backend returns farms[]
    │       │
    │       ▼
    │   Store in farms (ref)
    │
    ▼
Template Re-renders
    │
    └─→ Displays farms table
        └─→ Each row shows: name, location, area, actions
```

---

## Component Communication

### Pattern 1: Parent to Child (Props)
```
SideBar (Parent)
  │
  └─→ Child Components
      ├─ Props: none (most use direct navigation)
```

### Pattern 2: Child to Parent (Emits)
```
Modal Forms
  │
  └─→ Parent Components
      ├─ @close (custom event)
      └─ Triggers parent refresh
```

### Pattern 3: Global State (Pinia)
```
Component A              Component B
    │                        │
    └──→ userStore ←──────┘
         (shared state)
```

### Pattern 4: API Communication
```
Component
    │
    └──→ Service
         │
         └──→ Axios
              │
              └──→ Backend API
```

---

## Data Models

### Farm Object
```javascript
{
  id: 1,
  farm_name: "Green Valley Farm",
  farmer_id: 5,
  farmer_name: "Juan Santos",
  location: "Cabanatuan City",
  total_area: 2.5,
  soil_type: "Clay",
  rice_variety: "IR64",
  water_source: "Irrigated",
  latitude: 15.4909,
  longitude: 121.0503,
  elevation: 65,
  is_active: true,
  created_at: "2024-01-15T10:30:00Z",
  updated_at: "2024-01-20T14:45:00Z"
}
```

### User Object
```javascript
{
  id: 1,
  first_name: "Juan",
  middle_name: "De La",
  last_name: "Santos",
  email: "juan@farm.com",
  phone: "09123456789",
  role: "farmer",
  birthdate: "1980-05-15",
  years_farming: 25,
  barangay: "Sto. Nino",
  municipality: "Cabanatuan City",
  province: "Nueva Ecija",
  address: "123 Farm Street",
  is_active: true,
  created_at: "2024-01-10T08:00:00Z"
}
```

### Harvest Object
```javascript
{
  id: 1,
  farm_id: 1,
  harvest_date: "2024-01-20",
  yield_kg: 2500,
  yield_per_hectare: 1000,
  quality_grade: "A",
  municipality: "Cabanatuan City",
  created_at: "2024-01-20T12:00:00Z"
}
```

---

## API Request Flow

### Authentication Header
```
Every request includes:
{
  headers: {
    Authorization: `Bearer ${token}`,
    Content-Type: "application/json"
  }
}
```

### Request Examples

#### 1. Create Farm
```
POST /api/farms
Content-Type: application/json
Authorization: Bearer {token}

{
  "farm_name": "New Farm",
  "farmer_id": 5,
  "location": "City",
  "total_area": 2.5,
  "soil_type": "Clay",
  "rice_variety": "IR64",
  "water_source": "Irrigated",
  "latitude": 15.4909,
  "longitude": 121.0503
}
```

#### 2. Update Farm
```
PATCH /api/farms/1
Content-Type: application/json
Authorization: Bearer {token}

{
  "farm_name": "Updated Farm Name",
  "total_area": 3.0
}
```

#### 3. Delete Farm
```
DELETE /api/farms/1
Authorization: Bearer {token}
```

#### 4. Get All Farms
```
GET /api/farms
Authorization: Bearer {token}
```

#### 5. Create User
```
POST /api/users
Content-Type: application/json
Authorization: Bearer {token}

{
  "first_name": "Juan",
  "last_name": "Santos",
  "email": "juan@farm.com",
  "phone": "09123456789",
  "role": "farmer",
  "is_active": true
}
```

---

## Error Handling Flow

```
API Call
    │
    ▼
Axios Request
    │
    ├─→ ✅ Success (2xx)
    │   │
    │   ▼
    │   Return data
    │   │
    │   └─→ Update component state
    │       └─→ Re-render UI
    │
    └─→ ❌ Error (4xx, 5xx)
        │
        ▼
        Catch block
        │
        ├─→ Log error to console
        ├─→ Extract error message
        ├─→ Return empty/default value
        │
        ▼
        Show Error to User
        │
        ├─→ SweetAlert2 notification
        │   OR
        └─→ Inline error banner
```

---

## State Management Flow

### Pinia Store (user.js)

```
┌─────────────────────────────┐
│     User State (Pinia)      │
├─────────────────────────────┤
│ State                       │
│  ├── user: {}              │
│  ├── token: ""             │
│  └── roles: []             │
│                             │
│ Getters                     │
│  ├── isAuthenticated()      │
│  └── userEmail()            │
│                             │
│ Actions                     │
│  ├── setUser(user)         │
│  ├── setToken(token)       │
│  └── logout()              │
└─────────────────────────────┘
        │
        ▼
   Components
   (Access via useUserStore())
```

---

## Responsive Design Breakpoints

```
Mobile (< 576px)
├── Single column layout
├── Full-width buttons
├── Stacked modals
└── Hidden details on tables

Tablet (576px - 991px)
├── 2-column grid
├── Adjusted card sizes
├── Simplified tables
└── Responsive navigation

Desktop (≥ 992px)
├── 3-4 column grid
├── Full component layout
├── Complete table details
└── Side panels visible
```

---

## Component Lifecycle Example

### FarmsPage Component

```
Initialization
    │
    ├─→ Component created
    ├─→ Refs initialized
    │   ├── farms = ref([])
    │   ├── showModal = ref(false)
    │   ├── formData = ref({...})
    │   └── editingFarm = ref(null)
    │
    ▼
onMounted Hook
    │
    └─→ Call loadFarms()
        └─→ API call /farms
            └─→ Update farms ref
                └─→ Template re-renders

User Interaction
    │
    ├─→ Click "Create Farm"
    │   └─→ showModal = true
    │       └─→ Modal displays
    │
    ├─→ Fill form & submit
    │   └─→ saveFarm()
    │       └─→ API POST/PATCH
    │           └─→ loadFarms() (refresh)
    │
    └─→ Click delete
        └─→ SweetAlert confirm
            └─→ deleteFarm() (API DELETE)
                └─→ loadFarms() (refresh)

Component Cleanup
    │
    └─→ User navigates away
        └─→ Component unmounted
```

---

## Security Architecture

```
┌──────────────────┐
│   User Login     │
└─────────┬────────┘
          │
          ▼
┌──────────────────────────────┐
│  Backend Validates           │
│  - Email/password check      │
│  - Generate JWT token        │
└─────────┬────────────────────┘
          │
          ▼
┌──────────────────────────────┐
│  Store Token                 │
│  localStorage.setItem(token) │
└─────────┬────────────────────┘
          │
          ▼
┌──────────────────────────────┐
│  All API Requests            │
│  Include Authorization:      │
│  Bearer {token}              │
└─────────┬────────────────────┘
          │
          ▼
┌──────────────────────────────┐
│  Backend Validates Token     │
│  - Check validity            │
│  - Check expiration          │
│  - Check user permissions    │
└─────────┬────────────────────┘
          │
    ┌─────┴─────┐
    │            │
    ▼            ▼
  ✅ Allow    ❌ Reject
  Request    (401/403)
```

---

## Deployment Architecture

```
Development
    │
    ├─→ npm run serve
    │   └─→ Local development server (port 8080)
    │
    ▼
Production Build
    │
    ├─→ npm run build
    │   └─→ Generate optimized dist/ folder
    │
    ▼
Web Server Deployment
    │
    ├─→ Copy dist/ contents
    ├─→ Configure routing (SPA)
    └─→ Set CORS headers (allow frontend domain)
        │
        ▼
    Live Application
    │
    ├─→ Users access via domain
    ├─→ SPA loads in browser
    ├─→ Connects to Laravel backend
    └─→ Manages farms, users, reports
```

---

## Performance Optimization

### Code Splitting
```
├── Main bundle: app.js
└── Route-based chunks: lazy loading via router
```

### Lazy Loading
```
Components loaded on demand:
├── DashboardPage (loaded when route accessed)
├── FarmsPage (loaded when route accessed)
├── etc...
```

### Caching
```
├── Browser cache: static assets (CSS, JS)
├── Component cache: computed properties
└── Data cache: localStorage for user session
```

---

## Testing Strategy

### Unit Testing (Can be added)
```
- Test individual components
- Test service functions
- Test computed properties
- Test form validation
```

### Integration Testing (Can be added)
```
- Test API integration
- Test form submission
- Test navigation
- Test data flow
```

### E2E Testing (Can be added)
```
- Test complete user workflows
- Test CRUD operations
- Test error handling
- Test responsive design
```

---

## Technology Stack Summary

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend** | Vue | 3.2+ | UI framework |
| | Vite | 4.0+ | Build tool |
| | Bootstrap | 5.3+ | CSS framework |
| | Axios | 1.13+ | HTTP client |
| **State** | Pinia | 3.0+ | State management |
| **Routing** | Vue Router | 4.0+ | Client-side routing |
| **Notifications** | SweetAlert2 | 11.0+ | Modal dialogs |
| **Backend** | Laravel | 9.0+ | API server |
| **Database** | MySQL | 8.0+ | Data storage |
| **Language** | JavaScript | ES6+ | Frontend logic |
| | PHP | 8.0+ | Backend logic |

---

## Architecture Strengths

✅ **Modular Design**: Services separated from components
✅ **Scalability**: Easy to add new pages/features
✅ **Maintainability**: Consistent patterns throughout
✅ **Performance**: Optimized bundle size
✅ **Security**: Bearer token authentication
✅ **Error Handling**: Comprehensive error management
✅ **User Experience**: Responsive & intuitive
✅ **Documentation**: Well-documented codebase

---

This architecture ensures the application is:
- **Maintainable**: Easy to understand and modify
- **Scalable**: Can grow with new features
- **Secure**: Proper authentication and validation
- **Performant**: Optimized for speed
- **User-friendly**: Intuitive interface

---

**Architecture Version**: 1.0
**Last Updated**: 2024
**Status**: Production Ready
