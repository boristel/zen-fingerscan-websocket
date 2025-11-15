# MySQL CLI Tool

Simple command-line interface for MySQL database management and fingerprint attendance system.

## Installation

```bash
cd database-tools
npm install
```

## Usage

### Basic Commands

```bash
# Show help
node mysql-cli.js --help

# Test database connection
node mysql-cli.js --test

# List all tables
node mysql-cli.js --tables

# Show database statistics
node mysql-cli.js --stats
```

### Table Operations

```bash
# Describe table structure
node mysql-cli.js --describe karyawanfpreg

# Show table data (limited to 10 records)
node mysql-cli.js --show karyawanfpreg

# Show table data with custom limit
node mysql-cli.js --show karyawanfpreg 5
```

### Fingerprint Data

```bash
# Show fingerprint analysis
node mysql-cli.js --fingerprints
```

### Custom Queries

```bash
# Execute custom query
node mysql-cli.js --query "SELECT COUNT(*) FROM ben_hrd_karyawan_info WHERE active = ?" "Y"

# Simple query without parameters
node mysql-cli.js --query "SELECT * FROM karyawanfpreg LIMIT 3"
```

## NPM Scripts

```bash
npm test          # Test database connection
npm tables        # List all tables
npm fingerprints   # Show fingerprint data
npm stats          # Show database statistics
```

## Configuration

The tool reads database connection parameters from the `.env` file in the parent directory:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_PORT=3306
DB_NAME=bc_zen
```

## Features

- **Connection Testing**: Verify database connectivity
- **Table Operations**: List tables, describe structure, show data
- **Custom Queries**: Execute SQL with parameters
- **Fingerprint Analytics**: Specialized fingerprint data analysis
- **Database Statistics**: Size, record counts, and performance metrics