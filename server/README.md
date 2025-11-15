# Website Vulnerability Scanner - Backend

FastAPI backend for a Website Vulnerability Scanner using OWASP methodology and PostgreSQL.

## Features

- ✅ User Authentication (Register, Login, Email Verification)
- ✅ Password Reset Flow
- ✅ JWT Token-based Authentication
- ✅ Email Service with OTP
- ✅ PostgreSQL Database with SQLAlchemy
- ✅ Async/Await Support

## Tech Stack

- **FastAPI** - Modern Python web framework
- **PostgreSQL** - Database
- **SQLAlchemy** - ORM with async support
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing
- **Jinja2** - Email templates

## Project Structure

```
server/
├── controllers/
│   └── auth_controller.py       # Authentication business logic
├── middleware/
│   ├── auth_middleware.py       # JWT verification middleware
│   └── security_middleware.py   # Password validation, token creation
├── models/
│   └── user_model.py            # User database operations
├── routes/
│   └── auth_routes.py           # API endpoints
├── services/
│   └── email_service.py         # Email sending functionality
├── utils/
│   └── otp_util.py              # OTP generation
├── database/
│   ├── __init__.py              # Database configuration
│   └── models.py                # SQLAlchemy models
├── templates/
│   └── emails/
│       └── otpEmail.html        # Email template
├── main.py                      # FastAPI application
├── requirements.txt             # Python dependencies
└── .env.example                 # Environment variables example
```

## Installation

1. **Clone the repository**
```bash
cd server
```

2. **Create virtual environment**
```bash
python -m venv venv
```

3. **Activate virtual environment**
```bash
# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

4. **Install dependencies**
```bash
pip install -r requirements.txt
```

5. **Setup environment variables**
```bash
cp .env.example .env
```

Edit `.env` file with your configuration:
- Database URL
- JWT Secret
- SMTP credentials

6. **Setup PostgreSQL Database**
```bash
# Create database
createdb vulnerability_scanner

# Or using psql
psql -U postgres
CREATE DATABASE vulnerability_scanner;
```

## Running the Application

```bash
# Development mode with auto-reload
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Or using Python
python main.py
```

The API will be available at: `http://localhost:8000`

API Documentation: `http://localhost:8000/docs`

## API Endpoints

### Public Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify-email` - Verify email with OTP
- `POST /api/auth/resend-verification` - Resend verification email
- `POST /api/auth/forgot-password` - Send password reset OTP
- `POST /api/auth/verify-reset-otp` - Verify reset OTP
- `POST /api/auth/reset-password` - Reset password with token

### Protected Endpoints (Requires Authentication)

- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/change-password` - Change password

## Authentication

Use Bearer token in Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Environment Variables

See `.env.example` for required environment variables.

## Database Models

### User Model
- `id` - UUID primary key
- `name` - User's full name
- `email` - Unique email address
- `password` - Hashed password
- `role` - User role (default: USER)
- `is_verified` - Email verification status
- `otp` - One-time password for verification
- `otp_expires_at` - OTP expiration timestamp
- `created_at` - Account creation timestamp
- `updated_at` - Last update timestamp

## Security Features

- Password strength validation (min 8 chars, uppercase, lowercase, number, special char)
- Email format validation
- JWT token-based authentication
- Bcrypt password hashing (12 rounds)
- OTP expiration (10 minutes)
- Token expiration handling

## Development

### Running Tests
```bash
pytest
```

### Code Style
Follow PEP 8 guidelines for Python code.

## License

MIT License
