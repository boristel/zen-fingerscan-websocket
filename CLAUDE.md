# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Fingerprint Attendance System** built with Vue.js 3 (frontend) and Express.js (backend) with MySQL database. The system enables employee fingerprint registration and attendance tracking using biometric authentication with DigitalPersona U.areU SDK integration.

## Development Commands

### Root Level Commands
```bash
# Install all dependencies (both root and client)
npm run install-all

# Start both backend and frontend in development mode
npm run dev

# Start backend only (with nodemon)
npm run server

# Start frontend only (Vue.js dev server)
npm run client

# Build frontend for production
npm run build
```

### Client (Frontend) Commands
```bash
cd client

# Start Vue.js development server
npm run serve

# Build for production
npm run build

# Lint code (Vue.js style linting)
npm run lint
```

## Architecture Overview

### Backend (Express.js)
- **File**: `server.js` - Main Express server with API endpoints
- **Database**: MySQL with connection pooling using `mysql2`
- **Environment**: Uses `.env` file for configuration (DB credentials, JWT secret, port)

### Frontend (Vue.js 3)
- **Framework**: Vue.js 3 with Composition API
- **Routing**: Vue Router 4 with two main routes:
  - `/` - Fingerprint Registration (RegisterFingerprint.vue)
  - `/attendance` - Attendance Module (AttendanceModule.vue)
- **State Management**: Vuex 4 store for global state
- **UI Framework**: Bootstrap 5 with Bootstrap Icons
- **HTTP Client**: Axios for API calls

### Key Directories
```
client/src/
├── components/     # Reusable Vue components
├── views/         # Main application pages
├── router/        # Vue Router configuration
├── store/         # Vuex state management
└── services/      # API service layer
```

## Database Schema

### Core Tables
- **`ben_hrd_karyawan_info`**: Employee master data
  - Primary key: `kodekaryawan`
  - Links to fingerprint data via `idkaryawan`
  - Contains employee details, department, outlet info

- **`karyawanfpreg`**: Fingerprint registration data
  - Primary key: `autonum`
  - Foreign reference: `karyawanid` (links to `idkaryawan`)
  - Stores fingerprint image data as `mediumtext`
  - Supports up to 10 fingers per employee (fingerindex 0-9)

## API Endpoints

### Employee Management
- `POST /api/search-employee` - Search employees by name or ID
- `GET /api/employee/:id` - Get employee details
- `GET /api/employee/:id/fingerprints` - Get registered fingerprints

### Fingerprint Operations
- `POST /api/register-fingerprint` - Register new fingerprint
- `PUT /api/fingerprint/:id` - Update existing fingerprint
- `DELETE /api/fingerprint/:id` - Delete fingerprint

### System & Debug
- `GET /api/test-connection` - Test database connectivity
- `GET /api/test-contents` - Check database contents
- `GET /api/debug-schema` - Debug table structure
- `GET /api/debug-annisa` - Debug specific employee searches

## Development Workflow

### Prerequisites Setup
1. **MySQL Database**: Create database `bc_zen` and run `setup.sql`
2. **Environment**: Create `.env` file with database credentials
3. **Fingerprint SDK**: Install DigitalPersona U.areU SDK
   - Place SDK files in `client/public/js/`
   - Required files: `fingerprint.sdk.min.js`, `websdk.client.bundle.min.js`

### Development Process
1. Start backend server on available port (auto-detects from 3000, checks ports 3000-3010)
2. Start Vue.js frontend (typically on 8080)
3. Backend serves API at `http://localhost:PORT/api`
4. Frontend development server handles routing and hot reload

### Production Build
1. Run `npm run build` to build Vue.js frontend
2. Start production server with `node server.js`
3. Static files are served from `client/dist/` via Express server

## Fingerprint Integration

### DigitalPersona SDK
- **Location**: `client/public/js/`
- **Integration**: Loaded via `<script>` tags in Vue components
- **Functionality**: Real-time fingerprint capture, quality assessment
- **Data Flow**: Client captures → Base64 encoding → API → MySQL storage

### Registration Process
1. Employee search by name/ID
2. Finger selection (0-9, visual finger map)
3. Multi-scan capture (3-4 scans for quality)
4. Quality assessment and validation
5. Base64 encoding and database storage

## Database Connection

The backend uses MySQL connection pooling with automatic reconnection. Key connection details:
- Database: `bc_zen`
- Character set: `utf8mb4`
- Connection pool configuration in `server.js:19-26`

## Error Handling

- **Backend**: Centralized error handling middleware with development/production mode differences
- **Frontend**: Vuex error state management with automatic timeout
- **API Responses**: Consistent JSON format with `success`, `message`, and `data` fields

## Security Considerations

- Fingerprint data stored as `mediumtext` in MySQL
- Input validation on all API endpoints
- CORS configuration for cross-origin requests
- Environment variables for sensitive configuration
- JWT tokens ready for authentication (infrastructure in place)

## Testing and Debugging

The server includes several debug endpoints for development:
- Database connection testing
- Schema validation
- Employee search debugging
- Content verification

Use these endpoints during development to verify database connectivity and data integrity.