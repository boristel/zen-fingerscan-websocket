# Fingerprint Attendance System - Vue.js

A modern fingerprint attendance system built with Vue.js 3, Express.js, and MySQL. This application allows employees to register their fingerprints and track attendance using biometric authentication.

## Features

### 🔐 Fingerprint Registration Module
- **Employee Search**: Search employees by name or ID
- **Multi-Finger Registration**: Register up to 10 fingers per employee
- **Multi-Scan Quality**: 3-4 scans per finger for optimal quality
- **Real-time Quality Assessment**: Live feedback during fingerprint scanning
- **Visual Preview**: See fingerprint scans in real-time
- **Database Integration**: MySQL database for storing fingerprint data

### ⏰ Attendance Module (Coming Soon)
- Check-in/Check-out functionality
- Attendance history tracking
- Reporting and analytics

## Technology Stack

### Frontend
- **Vue.js 3**: Modern JavaScript framework
- **Vue Router**: Client-side routing
- **Vuex**: State management
- **Bootstrap 5**: Responsive UI framework
- **Axios**: HTTP client for API calls
- **DigitalPersona Fingerprint SDK**: Biometric integration

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **MySQL2**: MySQL database driver
- **CORS**: Cross-origin resource sharing
- **dotenv**: Environment configuration

### Database
- **MySQL**: Relational database management
- **Tables**:
  - `ben_hrd_karyawan_info`: Employee information
  - `karyawanfpreg`: Fingerprint registrations

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MySQL Server
- DigitalPersona Fingerprint SDK
- Compatible fingerprint scanner

### 1. Clone the Repository
```bash
git clone <repository-url>
cd fingerprint-attendance-vue
```

### 2. Install Dependencies
```bash
npm run install-all
```

### 3. Database Setup
Create a MySQL database named `bc_zen` and ensure the following tables exist:

#### Employee Information Table
```sql
CREATE TABLE `ben_hrd_karyawan_info` (
  `kodekaryawan` varchar(30) NOT NULL DEFAULT '',
  `idkaryawan` varchar(5) DEFAULT NULL,
  `namakaryawan` varchar(255) DEFAULT NULL,
  `idoutlet` char(3) DEFAULT NULL,
  `departemen` char(10) DEFAULT NULL,
  `jadwaltetap` char(1) NOT NULL DEFAULT 'N',
  `kodejadwal` int(2) DEFAULT NULL,
  `kodekontrak` char(30) DEFAULT NULL,
  `tglmasukkerja` date NOT NULL DEFAULT '1900-01-01',
  `tglhabiskontrak` date DEFAULT NULL,
  `namabank` char(30) DEFAULT NULL,
  `norek` char(30) DEFAULT NULL,
  `namarek` varchar(255) DEFAULT NULL,
  `tagedit` char(1) DEFAULT 'I',
  `lastedituser` varchar(30) DEFAULT NULL,
  `lasteditdate` datetime DEFAULT NULL,
  `isadmin` char(1) DEFAULT NULL,
  `active` char(1) DEFAULT 'Y',
  PRIMARY KEY (`kodekaryawan`)
);
```

#### Fingerprint Registration Table
```sql
CREATE TABLE `karyawanfpreg` (
  `autonum` int(11) NOT NULL AUTO_INCREMENT,
  `karyawanid` varchar(5) DEFAULT NULL,
  `namakaryawan` varchar(255) DEFAULT NULL,
  `fingerindex` int(2) DEFAULT NULL,
  `fingerimage` mediumtext DEFAULT NULL,
  `notes` varchar(255) DEFAULT NULL,
  `lasteditdate` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`autonum`)
);
```

### 4. Environment Configuration
Copy and configure the `.env` file:
```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_PORT=3306
DB_NAME=bc_zen

# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=fingerprint_attendance_secret_key_2024
JWT_EXPIRES_IN=24h
```

### 5. Fingerprint SDK Setup
1. Install DigitalPersona U.areU SDK
2. Copy the SDK files to the client public directory:
   - `fingerprint.sdk.min.js`
   - `websdk.client.bundle.min.js`
3. Ensure the fingerprint SDK is accessible via the web server

### 6. Start the Application

#### Development Mode
```bash
# Start both backend and frontend
npm run dev

# Or start individually
npm run server  # Backend server on port 3000
npm run client  # Frontend on port 8080
```

#### Production Mode
```bash
# Build frontend
npm run build

# Start production server
npm start
```

## Usage

### 1. Register Employee Fingerprints
1. Open the application in your browser
2. Search for an employee by name or ID
3. Select the employee from the search results
4. Click "Start Fingerprint Registration"
5. Select which finger to register (available fingers will be highlighted)
6. Place finger on scanner and complete 4 scans for best quality
7. Save the fingerprint to the database
8. Repeat for additional fingers if needed

### 2. Fingerprint Scanning Process
- **Quality Assessment**: The system provides real-time quality feedback
- **Multiple Scans**: 3-4 scans per finger ensure optimal data quality
- **Visual Feedback**: See fingerprint scans in real-time
- **Data Validation**: Automatic validation of fingerprint data before saving

## API Endpoints

### Employee Management
- `POST /api/search-employee` - Search employees
- `GET /api/employee/:id` - Get employee details
- `GET /api/employee/:id/fingerprints` - Get registered fingerprints

### Fingerprint Registration
- `POST /api/register-fingerprint` - Register new fingerprint
- `PUT /api/fingerprint/:id` - Update fingerprint
- `DELETE /api/fingerprint/:id` - Delete fingerprint

### System
- `GET /api/test-connection` - Test database connection

## Project Structure

```
fingerprint-attendance-vue/
├── server.js                 # Express.js backend server
├── package.json             # Backend dependencies
├── .env                     # Environment configuration
├── client/                  # Vue.js frontend application
│   ├── src/
│   │   ├── components/      # Vue components
│   │   ├── views/          # Vue pages
│   │   ├── services/       # API and business logic
│   │   ├── store/          # Vuex state management
│   │   ├── router/         # Vue Router configuration
│   │   ├── App.vue         # Root component
│   │   └── main.js         # Application entry point
│   ├── public/             # Static assets
│   ├── package.json        # Frontend dependencies
│   └── vue.config.js       # Vue CLI configuration
└── README.md               # This file
```

## Browser Compatibility

- Chrome (Recommended)
- Firefox
- Microsoft Edge
- Safari (Limited support)

## Security Considerations

- Fingerprint data is stored securely in MySQL database
- Input validation and sanitization
- CORS configuration for API security
- Environment variables for sensitive configuration

## Troubleshooting

### Common Issues

1. **Fingerprint SDK Not Loading**
   - Ensure SDK files are properly placed in `client/public/`
   - Check browser console for SDK loading errors

2. **Database Connection Issues**
   - Verify MySQL server is running
   - Check database credentials in `.env` file
   - Ensure database `bc_zen` exists

3. **Fingerprint Scanner Not Detected**
   - Ensure scanner is properly connected
   - Install required drivers
   - Check DigitalPersona SDK installation

4. **API Connection Issues**
   - Ensure backend server is running on port 3000
   - Check CORS configuration
   - Verify API endpoints are accessible

## Development Notes

### Fingerprint SDK Integration
The application integrates with DigitalPersona U.areU Web SDK for fingerprint capture. The SDK provides:
- Device enumeration and management
- Real-time fingerprint capture
- Quality assessment
- Multiple format support (PNG, RAW, WSQ, Intermediate)

### Database Design
The system uses two main tables:
1. `ben_hrd_karyawan_info`: Employee master data
2. `karyawanfpreg`: Fingerprint registration data

The design supports:
- Multiple fingerprints per employee (up to 10 fingers)
- Fingerprint quality tracking
- Audit trail with timestamps

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For technical support or questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Create an issue in the repository

---

**Note**: This application requires compatible fingerprint hardware and proper SDK installation for full functionality.