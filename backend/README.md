# Biometric Attendance Backend

Enterprise-grade backend API for biometric fingerprint attendance system with industry-standard security and architecture.

## Features

- 🔐 **Secure Biometric Verification**: Server-side fingerprint template processing
- 🏗️ **Enterprise Architecture**: Modular MVC design with proper separation of concerns
- 🔒 **Advanced Security**: AES-256 encryption, JWT authentication, audit logging
- 📊 **Comprehensive Analytics**: Detailed attendance tracking and reporting
- 🚀 **High Performance**: Connection pooling, caching, optimized queries
- 📝 **Audit Trail**: Complete audit logging for compliance
- 🛡️ **Rate Limiting**: Protection against abuse and attacks
- 📱 **RESTful API**: Clean, documented API endpoints

## Technology Stack

- **Runtime**: Node.js 16+
- **Framework**: Express.js 4.x
- **Database**: MySQL 8.0 with Sequelize ORM
- **Security**: JWT, bcryptjs, AES-256-GCM encryption
- **Logging**: Winston with daily rotation
- **Validation**: Joi, express-validator
- **Testing**: Jest, Supertest
- **Documentation**: Swagger/OpenAPI 3.0

## Quick Start

### Prerequisites

- Node.js 16.0 or higher
- MySQL 8.0 or higher
- npm 8.0 or higher

### Installation

1. **Clone and navigate to backend directory:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your database credentials and security keys
```

4. **Create database:**
```sql
CREATE DATABASE bc_zen CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

5. **Run database migrations:**
```bash
npm run migrate
```

6. **Seed initial data (optional):**
```bash
npm run seed
```

7. **Start development server:**
```bash
npm run dev
```

The API will be available at `http://localhost:3001`

## Configuration

### Environment Variables

Key configuration variables in `.env`:

```bash
# Server
NODE_ENV=development
PORT=3001

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=bc_zen

# Security
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
ENCRYPTION_KEY_PROD=your-32-character-encryption-key
```

### Security Configuration

- **Biometric Templates**: Encrypted with AES-256-GCM
- **API Authentication**: JWT with configurable expiration
- **Rate Limiting**: Tiered limits for different endpoint types
- **Audit Logging**: Comprehensive audit trail for all operations

## API Documentation

### Development Mode

With Swagger enabled in development:
- Interactive API docs: `http://localhost:3001/api-docs`
- OpenAPI JSON: `http://localhost:3001/api-docs.json`

### Key Endpoints

#### Authentication
```
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
GET    /api/auth/profile
```

#### Employees
```
GET    /api/employees
POST   /api/employees
GET    /api/employees/:id
PUT    /api/employees/:id
DELETE /api/employees/:id
GET    /api/employees/search
```

#### Biometric Templates
```
GET    /api/biometric/templates
POST   /api/biometric/templates
GET    /api/biometric/templates/:id
PUT    /api/biometric/templates/:id
DELETE /api/biometric/templates/:id
POST   /api/biometric/verify
```

#### Attendance
```
GET    /api/attendance
POST   /api/attendance
GET    /api/attendance/:employeeId
GET    /api/attendance/statistics
POST   /api/attendance/approve/:id
```

## Database Schema

### Core Tables

- **employees**: Employee master data
- **biometric_templates**: Encrypted fingerprint templates
- **attendance_records**: Attendance tracking with verification
- **audit_logs**: Comprehensive audit trail
- **users**: System user accounts
- **sessions**: User session management

### Relationships

```
employees (1) → (n) biometric_templates
employees (1) → (n) attendance_records
users (1) → (n) audit_logs
```

## Security Features

### Biometric Security
- **Template Encryption**: AES-256-GCM with per-template IVs
- **Integrity Verification**: SHA-256 checksums for all templates
- **Secure Transmission**: HTTPS required for production
- **Data Minimization**: Only necessary biometric data stored

### API Security
- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Tiered protection against abuse
- **Input Validation**: Comprehensive request validation
- **CORS Protection**: Configurable cross-origin policies
- **Security Headers**: OWASP recommended headers

### Audit & Compliance
- **Complete Audit Trail**: Every operation logged
- **Data Retention**: Configurable retention policies
- **Consent Management**: Biometric consent tracking
- **Privacy Controls**: GDPR-compliant data handling

## Development

### Project Structure

```
backend/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Route handlers
│   ├── middleware/     # Custom middleware
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   └── utils/          # Utility functions
├── tests/              # Test files
├── docs/               # API documentation
├── logs/               # Log files
└── migrations/         # Database migrations
```

### Scripts

```bash
# Development
npm run dev          # Start development server
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues

# Database
npm run migrate      # Run migrations
npm run migrate:undo # Rollback migrations
npm run seed         # Seed database

# Production
npm start           # Start production server
npm run build       # Build for production
```

### Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- tests/biometric.test.js
```

## Production Deployment

### Environment Setup

1. **Set production environment:**
```bash
export NODE_ENV=production
```

2. **Configure production variables:**
```bash
# Database
DB_HOST=your-production-db-host
DB_USER=your-production-user
DB_PASSWORD=your-production-password

# Security
JWT_SECRET=your-production-jwt-secret
ENCRYPTION_KEY_PROD=your-32-char-production-key

# CORS
CORS_ORIGIN=https://your-frontend-domain.com
```

3. **Install production dependencies:**
```bash
npm ci --only=production
```

4. **Run database migrations:**
```bash
npm run migrate
```

5. **Start production server:**
```bash
npm start
```

### Performance Optimization

- **Connection Pooling**: Configurable database connection pools
- **Query Optimization**: Indexed database queries
- **Caching**: Redis integration for session storage
- **Compression**: gzip response compression
- **Load Balancing**: Horizontal scaling support

## Monitoring & Maintenance

### Health Checks

```bash
# Application health
GET /health

# Database health
GET /health/database

# Biometric service health
GET /health/biometric
```

### Log Management

- **Application Logs**: Daily rotation, 30-day retention
- **Audit Logs**: Daily rotation, 365-day retention
- **Error Logs**: Immediate alerting
- **Performance Logs**: Query performance tracking

### Backup Strategy

- **Database Backups**: Daily automated backups
- **Template Backups**: Encrypted backup of biometric templates
- **Configuration Backups**: Version-controlled configuration
- **Log Archival**: Long-term log storage

## API Rate Limits

| Endpoint Type | Window | Requests |
|---------------|--------|----------|
| General API   | 15 min | 100      |
| Biometric     | 15 min | 20       |
| Authentication | 15 min | 10       |

## Support

For technical support:
- **Documentation**: Check the `/api-docs` endpoint
- **Logs**: Review application and audit logs
- **Health**: Monitor `/health` endpoints
- **Issues**: Create detailed bug reports with logs

## License

MIT License - see LICENSE file for details

## Security Considerations

⚠️ **Important Security Notes**:

1. **Never commit `.env` files** to version control
2. **Use strong, unique secrets** for all security keys
3. **Enable HTTPS** in production environments
4. **Regularly update dependencies** for security patches
5. **Monitor audit logs** for suspicious activity
6. **Implement proper backup** and recovery procedures
7. **Follow principle of least privilege** for database access
8. **Validate all inputs** and sanitize outputs
9. **Implement proper error handling** without information leakage
10. **Regular security audits** and penetration testing