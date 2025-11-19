# VulCan - Website Vulnerability Scanner

<div align="center">

![VulCan Logo](https://img.shields.io/badge/VulCan-Security%20Scanner-blue?style=for-the-badge)

A comprehensive web application vulnerability scanner built with FastAPI and React that performs OWASP Top 10 security assessments. **Now available as both a web app and browser extension!**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-green.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue.svg)](https://www.typescriptlang.org/)

</div>

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Browser Extension](#browser-extension)
- [Security Checks](#security-checks)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### 🔒 Security Scanning
- **OWASP Top 10 Detection** - Comprehensive vulnerability assessment
- **SSL/TLS Certificate Analysis** - Check certificate validity and expiration
- **Security Headers Inspection** - Analyze HTTP security headers
- **DNS Security Checks** - Subdomain enumeration and DNS configuration
- **Information Disclosure Detection** - Identify exposed sensitive files
- **Input Validation Testing** - Test for injection vulnerabilities

### 📊 Reporting & Analytics
- **Real-time Scanning** - Live scan progress with status updates
- **Security Score Calculation** - 0-100 rating based on findings
- **Detailed Vulnerability Reports** - CVSS scores and OWASP categorization
- **Export Functionality** - Download scan results as JSON
- **Historical Scan Tracking** - View and compare past scans

### 👤 User Management
- **JWT Authentication** - Secure token-based authentication
- **Email Verification** - OTP-based email verification system
- **Password Reset** - Secure password recovery flow
- **User Profiles** - Manage account settings and preferences
- **Multi-tenant Support** - Users can only access their own scans

### 🎨 Modern UI/UX
- **Responsive Design** - Works seamlessly on desktop and mobile
- **Dark Mode Support** - Eye-friendly interface
- **Interactive Dashboard** - Visual analytics and statistics
- **Real-time Updates** - Live scan status with polling
- **Toast Notifications** - User-friendly feedback system

### 🧩 Browser Extension (NEW!)
- **One-Click Scanning** - Scan any webpage instantly from your browser
- **Context Menu Integration** - Right-click to scan pages and links
- **Lightweight & Fast** - Minimal resource usage
- **Seamless Sync** - Uses same account and backend as web app
- **Quick Results** - View security scores without leaving your browser

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **PostgreSQL** - Robust relational database
- **SQLAlchemy** - ORM with async support
- **asyncpg** - Async PostgreSQL driver
- **Pydantic** - Data validation
- **PyJWT** - JWT token handling
- **httpx** - Async HTTP client for scanning
- **dnspython** - DNS resolution

### Frontend (Web App)
- **React 18** - Modern UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool
- **TailwindCSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Zustand** - State management
- **Axios** - HTTP client
- **Sonner** - Toast notifications
- **Lucide React** - Icon library

### Browser Extension
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Chrome Manifest V3** - Latest extension standard
- **Vite** - Build tool
- **Chrome Storage API** - Secure token storage
- **Chrome Tabs API** - Current page detection
- **Chrome Context Menus** - Right-click integration

## 🏗️ Architecture

```
VulCan/
├── client/                 # React frontend (Web App)
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service layer
│   │   ├── stores/        # State management
│   │   └── main.tsx       # Entry point
│   └── package.json
│
├── browser-extension/     # Chrome Extension (NEW!)
│   ├── src/
│   │   ├── popup/        # Extension popup UI
│   │   ├── background/   # Service worker
│   │   ├── content/      # Content scripts
│   │   └── shared/       # Shared utilities (API client)
│   ├── public/
│   │   ├── manifest.json # Extension manifest
│   │   └── icons/        # Extension icons
│   ├── SETUP.md          # Extension setup guide
│   └── package.json
│
├── server/                # FastAPI backend (Shared by both)
│   ├── controllers/       # Business logic
│   ├── routes/           # API endpoints
│   ├── services/         # Core services (scanner, email)
│   ├── database/         # Database models and config
│   ├── middleware/       # Auth and security middleware
│   ├── models/           # User models
│   ├── utils/            # Helper utilities
│   └── main.py           # Application entry
│
└── README.md
```

## 📦 Prerequisites

- **Python 3.9+**
- **Node.js 18+**
- **PostgreSQL 13+**
- **Git**

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/MuhammmadMohidgh/VulCan.git
cd VulCan
```

### 2. Backend Setup

```bash
# Navigate to server directory
cd server

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
.\venv\Scripts\Activate.ps1
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file (see Configuration section)
cp .env.example .env

# Run database migrations
python scripts/setup_db.py

# Start the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend Setup

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:8000/api" > .env

# Start development server
npm run dev
```

## ⚙️ Configuration

### Backend Environment Variables (.env)

```env
# Database Configuration
DATABASE_URL=

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRATION=86400

# Email Configuration (for OTP verification)
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=your-email@ethereal.email
SMTP_PASSWORD=your-password
FROM_EMAIL=noreply@vulnerability-scanner.com
FROM_NAME=Vulnerability Scanner

# Application Configuration
APP_NAME=Vulnerability Scanner
APP_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Scan Configuration
DEFAULT_SCAN_TIMEOUT=30
MAX_CONCURRENT_SCANS=3
SCAN_RESULT_RETENTION_DAYS=90
```

### Frontend Environment Variables (.env)

```env
VITE_API_URL=http://localhost:8000/api
```

## 📖 Usage

### Starting the Application

1. **Start PostgreSQL** database
2. **Start Backend Server**:
   ```bash
   cd server
   uvicorn main:app --reload
   ```
3. **Start Frontend Dev Server**:
   ```bash
   cd client
   npm run dev
   ```
4. **Access the application** at `http://localhost:5173`

## 🧩 Browser Extension

VulCan is now available as a lightweight Chrome extension for instant website scanning!

### Features

- ✅ **One-click scanning** of any webpage
- ✅ **Right-click context menu** for quick scans
- ✅ **Security scores** displayed instantly
- ✅ **Scan history** synced with web app
- ✅ **Same authentication** as web app

### Installation

1. **Navigate to extension folder**:
   ```bash
   cd browser-extension
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Build the extension**:
   ```bash
   npm run build
   ```

4. **Load in Chrome**:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `browser-extension/dist` folder

5. **Login and scan!**

For detailed setup instructions, see [browser-extension/SETUP.md](browser-extension/SETUP.md)

### Usage

**Method 1: Current Page Scan**
1. Click the VulCan icon in your toolbar
2. Click "Scan This Page"

**Method 2: Context Menu**
1. Right-click anywhere on a page
2. Select "Scan this page with VulCan"

**Method 3: Link Scanning**
1. Right-click any hyperlink
2. Select "Scan this link with VulCan"

## 📖 Web App Usage

### Running a Scan

1. **Sign up** for a new account
2. **Verify your email** using the OTP sent
3. **Log in** to your dashboard
4. **Choose a scan type**:
   - Basic Security Scan (2-3 minutes)
   - Comprehensive Vulnerability Scan (5-8 minutes)
   - Enterprise Security Audit (10-15 minutes)
5. **Enter target URL** and click "Start Security Scan"
6. **Wait for results** - scans complete within the specified timeframe
7. **View detailed findings** with recommendations

### Viewing Results

- Navigate to the **Results page** to see all your scans
- Click on any scan card to view detailed findings
- Export reports as JSON for further analysis
- Rescan sites to track improvements over time

### Key Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-email` - Verify email with OTP
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `GET /api/auth/me` - Get current user profile

#### Vulnerability Scanning
- `POST /api/vulnerability/scan` - Start new scan
- `GET /api/vulnerability/scans` - Get user's scans
- `GET /api/vulnerability/scan/{scan_id}` - Get scan details
- `DELETE /api/vulnerability/scan/{scan_id}` - Delete scan
- `GET /api/vulnerability/statistics` - Get user statistics

## 🔍 Security Checks

VulCan performs the following security assessments:

### 1. Security Headers Analysis
- Strict-Transport-Security (HSTS)
- X-Content-Type-Options
- X-Frame-Options
- X-XSS-Protection
- Content-Security-Policy
- Referrer-Policy

### 2. SSL/TLS Certificate Validation
- Certificate expiration check
- Certificate chain verification
- Protocol version detection
- Cipher suite analysis

### 3. OWASP Top 10 Detection
- **A01:2021** - Broken Access Control
- **A02:2021** - Cryptographic Failures
- **A03:2021** - Injection
- **A05:2021** - Security Misconfiguration
- And more...

### 4. Information Disclosure
- Exposed configuration files
- Sensitive file detection
- Directory listing
- API documentation exposure

### 5. DNS Security
- Subdomain enumeration
- DNSSEC validation
- DNS record analysis

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow PEP 8 for Python code
- Use ESLint and Prettier for TypeScript/React
- Write unit tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## 🐛 Known Issues

- Scan timeout may occur for very large websites (configurable)
- Some subdomain checks may trigger rate limiting

## 🔮 Roadmap

- [ ] Advanced threat detection algorithms
- [ ] Scheduled scans
- [ ] Compliance reporting (GDPR, PCI-DSS)
- [ ] REST API rate limiting per user
- [ ] Webhook notifications
- [ ] Multi-language support
- [ ] Docker containerization
- [ ] CI/CD pipeline integration

## 📄 License

This project is licensed under the MIT License.


## 🙏 Acknowledgments

- OWASP for security standards and guidelines
- FastAPI community for excellent documentation
- React and TypeScript communities


