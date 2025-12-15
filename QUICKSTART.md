# Quick Start Guide

## Prerequisites
- Node.js 14+ installed
- Vue 3 CLI (or npm/yarn)
- Laravel backend running at `http://10.236.166.133:8000`

## Installation & Setup

### 1. Install Dependencies
```bash
cd d:\crud-app
npm install
```

### 2. Verify Backend Configuration
In `src/main.js`, ensure this URL matches your Laravel backend:
```javascript
axios.defaults.baseURL = "http://10.236.166.133:8000/api";
```

### 3. Start Development Server
```bash
npm run serve
```
The app will be available at `http://localhost:8080`

### 4. Build for Production
```bash
npm run build
```
Output will be in the `dist/` folder

## Features Available

### ✅ Implemented
- [x] **Profile Management** - 4-tab profile with CRUD operations
- [x] **Dashboard** - Real-time KPI cards with farm/harvest analytics
- [x] **Farms CRUD** - Complete create, read, update, delete operations
- [x] **Employee Management** - Farmer/user CRUD with role management
- [x] **Map Component** - Geospatial farm location display
- [x] **Reports & Export** - Analytics dashboard with CSV export functionality
- [x] **Authentication** - Bearer token via localStorage
- [x] **Error Handling** - SweetAlert2 notifications and inline error messages
- [x] **Responsive Design** - Mobile-friendly layout

### Component Navigation
- **Dashboard**: `/main/dashboard` - KPI cards and statistics
- **Overview**: `/main/overview` - System overview
- **Farms**: `/main/farms` - Farm management CRUD
- **Employees**: `/main/employee` - Farmer/user management
- **Map**: `/main/map` - Farm locations
- **Reports**: `/main/reports` - Analytics and export
- **Profile**: `/main/profile` - User profile management
- **Weather**: `/main/weather` - Weather integration

## API Endpoints Required

Make sure your Laravel backend has these endpoints:

### Farms
```
GET    /api/farms              - List all farms
POST   /api/farms              - Create farm
GET    /api/farms/{id}         - Get single farm
PATCH  /api/farms/{id}         - Update farm
DELETE /api/farms/{id}         - Delete farm
```

### Users/Farmers
```
GET    /api/users              - List all users
POST   /api/users              - Create user
GET    /api/users/{id}         - Get user
PATCH  /api/users/{id}         - Update user
DELETE /api/users/{id}         - Delete user
```

### Harvests & Analytics
```
GET    /api/harvests           - List all harvests
GET    /api/analytics/dashboard - Dashboard metrics
```

### User Profile
```
GET    /api/user               - Get current user
PUT    /api/user               - Update profile
PUT    /api/user/profile-picture - Upload profile picture
GET    /api/user/audit-logs    - Audit logs
GET    /api/user/history-logs  - History logs
```

## Troubleshooting

### Port Already in Use
If port 8080 is already in use:
```bash
npm run serve -- --port 8081
```

### Clear Cache
```bash
npm cache clean --force
rm -rf node_modules
npm install
```

### Check Backend Connection
Open browser DevTools (F12) → Network tab → make any API call to see if it reaches the backend

### CORS Issues
Backend must allow requests from your frontend domain:
```php
// In Laravel CORS config
'allowed_origins' => ['http://localhost:8080', 'http://localhost:8081'],
```

## Development Tips

### Adding a New Page
1. Create component in `src/views/sidebar/NewPage.vue`
2. Add route in `src/router/index.js`
3. Add link in `src/components/SideBar.vue` navigation
4. Use same patterns from existing pages for consistency

### Creating API Service
1. Create file in `src/services/newService.js`
2. Export async functions that call `axios.get()`, `axios.post()`, etc.
3. Handle errors with try-catch
4. Return data or empty default (array/object)

### Styling Consistency
- Use CSS variables defined in component `<style>` blocks
- Primary color: `#1b5e20` (green)
- Use Bootstrap utilities for responsive design
- Card shadow: `0 4px 12px rgba(0,0,0,0.08)`

## Deployment

### Build
```bash
npm run build
```

### Test Production Build Locally
```bash
npm install -g serve
serve -s dist -l 8080
```

### Deploy to Server
Copy entire `dist/` folder contents to your web server (Nginx, Apache, etc.)

Ensure web server redirects all routes to `index.html` for SPA routing to work.

## Support & Documentation

For detailed API documentation, see: **IMPLEMENTATION_SUMMARY.md**

For component-specific details, check comments in individual `.vue` files.

---

**Ready to start?**
```bash
npm run serve
```
Then navigate to `http://localhost:8080` in your browser.

Happy coding! 🚀
