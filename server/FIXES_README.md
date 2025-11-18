# VulCan - Vulnerability Scanner Backend Fixes

## 🔧 Issues Fixed

### 1. **Vulnerability Scanner - Complete Rewrite**
The scanner had several critical issues that caused scans to hang and fail:

#### Problems Identified:
- Incorrect URL handling in `scan_url()` method
- Missing SSL verification bypass for scanning purposes
- No proper timeout handling causing indefinite hangs
- Lack of error recovery when individual checks failed
- Missing User-Agent headers in HTTP requests
- Duplicate/corrupted code blocks

#### Solutions Implemented:
- ✅ Proper URL normalization and validation
- ✅ SSL verification disabled for scanning (`verify=False`)
- ✅ Comprehensive timeout configuration for all HTTP requests
- ✅ Graceful error handling with `asyncio.gather(..., return_exceptions=True)`
- ✅ Consistent User-Agent headers across all requests
- ✅ Clean, well-structured code with proper exception handling
- ✅ Individual check timeouts to prevent one slow check from blocking others

### 2. **OWASP Integration**
Enhanced OWASP Top 10 2021 vulnerability detection:

- ✅ **A01:2021 - Broken Access Control**: Information disclosure checks
- ✅ **A02:2021 - Cryptographic Failures**: SSL/TLS certificate validation
- ✅ **A03:2021 - Injection**: SQL injection and XSS testing
- ✅ **A05:2021 - Security Misconfiguration**: Security headers analysis

### 3. **Security Headers Detection**
Comprehensive security header analysis:
- X-Content-Type-Options
- X-Frame-Options
- X-XSS-Protection
- Strict-Transport-Security (HSTS)
- Content-Security-Policy (CSP)
- Referrer-Policy

### 4. **SSL/TLS Certificate Analysis**
- Certificate validation
- Expiration date checking
- Issuer and subject information
- Warning for non-HTTPS connections

### 5. **DNS Security Checks**
- Subdomain discovery (admin, test, dev, staging, api, backup)
- DNS query optimization with timeouts

### 6. **Information Disclosure Detection**
Checks for exposed sensitive files:
- `/robots.txt`
- `/sitemap.xml`
- `/.git/config`
- `/.env`
- `/config.php`
- `/web.config`
- `/.htaccess`
- `/phpinfo.php`
- `/api/docs`
- `/swagger.json`

## 🚀 Quick Start

### Prerequisites
```bash
# Python 3.8+
# PostgreSQL database
```

### Installation

1. **Install dependencies:**
```powershell
cd server
pip install -r requirements.txt
```

2. **Configure environment variables:**
Create a `.env` file in the `server` directory:
```env
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/webChecker
JWT_SECRET_KEY=your-super-secret-jwt-key-change-this
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
DEFAULT_SCAN_TIMEOUT=60
```

3. **Initialize the database:**
```powershell
python scripts/setup_db.py
```

4. **Run the server:**
```powershell
python main.py
```

The API will be available at `http://localhost:8000`

## 📡 API Endpoints

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

#### Verify Email
```http
POST /api/auth/verify-email
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

### Vulnerability Scanning

#### Start Scan (Protected)
```http
POST /api/vulnerability/scan
Authorization: Bearer <token>
Content-Type: application/json

{
  "target_url": "https://example.com"
}
```

#### Get All Scans (Protected)
```http
GET /api/vulnerability/scans?limit=50&offset=0
Authorization: Bearer <token>
```

#### Get Scan Results (Protected)
```http
GET /api/vulnerability/scan/{scan_id}
Authorization: Bearer <token>
```

#### Get Statistics (Protected)
```http
GET /api/vulnerability/statistics
Authorization: Bearer <token>
```

#### Demo Scan (Public - No Auth Required)
```http
POST /api/vulnerability/scan-demo
Content-Type: application/json

{
  "target_url": "https://example.com"
}
```

## 🧪 Testing

### Test the Scanner Directly
```powershell
cd server
python test_scanner.py
```

This will run tests against example.com, google.com, and github.com to verify the scanner is working properly.

### Expected Output
```
Security Score: 60-80/100
Vulnerabilities Found: 5-10
- High severity: Missing security headers
- Medium severity: Configuration issues
- Low severity: Minor issues
```

## 📊 API Response Format

### Scan Results
```json
{
  "id": "scan-uuid",
  "target_url": "https://example.com",
  "status": "completed",
  "security_score": 75,
  "created_at": "2025-11-18T10:00:00",
  "updated_at": "2025-11-18T10:01:30",
  "findings": [
    {
      "id": "finding-uuid",
      "title": "Missing Strict-Transport-Security Header",
      "severity": "high",
      "description": "The Strict-Transport-Security header is missing from the HTTP response.",
      "recommendation": "Add the Strict-Transport-Security header to your HTTP responses.",
      "owasp_category": "A05:2021 - Security Misconfiguration",
      "technical_details": {
        "header": "Strict-Transport-Security",
        "owasp_category": "A05:2021 - Security Misconfiguration"
      },
      "cvss_score": 8.0
    }
  ]
}
```

## 🔒 Security Features

1. **JWT Authentication**: Secure token-based authentication
2. **Password Hashing**: Bcrypt for secure password storage
3. **OTP Verification**: Email-based two-factor verification
4. **Rate Limiting**: Built-in protection against abuse (configurable)
5. **CORS Configuration**: Secure cross-origin resource sharing
6. **SQL Injection Protection**: Parameterized queries via SQLAlchemy
7. **Input Validation**: Pydantic models for request validation

## 🛠️ Troubleshooting

### Scanner Hangs or Times Out
- Check your internet connection
- Verify the target URL is accessible
- Increase `DEFAULT_SCAN_TIMEOUT` in .env
- Check firewall settings

### Database Connection Issues
- Verify PostgreSQL is running
- Check DATABASE_URL in .env
- Ensure database exists: `createdb webChecker`
- Run migrations: `python scripts/setup_db.py`

### Import Errors
```powershell
pip install --upgrade -r requirements.txt
```

## 📝 Configuration Options

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql+asyncpg://...` |
| `JWT_SECRET_KEY` | Secret key for JWT tokens | Required |
| `JWT_ALGORITHM` | JWT algorithm | `HS256` |
| `JWT_EXPIRATION_HOURS` | Token expiration time | `24` |
| `DEFAULT_SCAN_TIMEOUT` | Scan timeout in seconds | `60` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `*` |
| `HOST` | Server host | `0.0.0.0` |
| `PORT` | Server port | `8000` |

## 📦 Postman Collection

Import `VulCan_Postman_Collection.json` into Postman to test all endpoints.

The collection includes:
- ✅ 18 pre-configured API requests
- ✅ Automatic token management
- ✅ Environment variables
- ✅ Sample request bodies
- ✅ Descriptions for each endpoint

## 🔄 Recent Changes

### November 18, 2025
- ✅ Complete rewrite of vulnerability scanner
- ✅ Fixed infinite hang issues
- ✅ Added proper OWASP category mappings
- ✅ Implemented comprehensive security header checks
- ✅ Added SSL/TLS certificate validation
- ✅ Improved error handling and recovery
- ✅ Added DNS security checks
- ✅ Implemented information disclosure detection
- ✅ Created test script for scanner validation
- ✅ Generated complete Postman collection

## 📚 Dependencies

Main dependencies:
- `fastapi`: Web framework
- `uvicorn`: ASGI server
- `sqlalchemy`: ORM and database toolkit
- `httpx`: Async HTTP client for scanning
- `dnspython`: DNS toolkit
- `pyjwt`: JWT token handling
- `bcrypt`: Password hashing
- `pydantic`: Data validation

## 🎯 Next Steps

1. Configure your `.env` file with actual credentials
2. Set up PostgreSQL database
3. Run database migrations
4. Start the server
5. Import Postman collection
6. Test the API endpoints
7. Start scanning!

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the test output from `test_scanner.py`
3. Check server logs for detailed error messages
4. Verify all environment variables are set correctly

## 📖 API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
