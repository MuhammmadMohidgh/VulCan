from fastapi import APIRouter, Depends, Header, Body
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional, Annotated
from pydantic import BaseModel, EmailStr
from controllers.auth_controller import AuthController
from middleware.auth_middleware import get_current_user, security


router = APIRouter(prefix='/api/auth', tags=['Authentication'])
auth_controller = AuthController()


# Pydantic models for request/response validation
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class VerifyEmailRequest(BaseModel):
    email: EmailStr
    otp: str


class ResendVerificationRequest(BaseModel):
    email: EmailStr


class SendPasswordResetRequest(BaseModel):
    email: EmailStr


class VerifyResetOtpRequest(BaseModel):
    email: EmailStr
    otp: str


class ChangePasswordRequest(BaseModel):
    token: Optional[str] = None
    new_password: str
    current_password: Optional[str] = None


class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None


# Public routes (no authentication required)
@router.post('/register')
async def register(request: RegisterRequest):
    """Register a new user"""
    return await auth_controller.register(
        email=request.email,
        password=request.password,
        name=request.name
    )


@router.post('/login')
async def login(request: LoginRequest):
    """Login user"""
    return await auth_controller.login(
        email=request.email,
        password=request.password
    )


@router.post('/verify-email')
async def verify_email(request: VerifyEmailRequest):
    """Verify user email with OTP"""
    return await auth_controller.verify_email(
        email=request.email,
        otp=request.otp
    )


@router.post('/resend-verification')
async def resend_verification(request: ResendVerificationRequest):
    """Resend verification email"""
    return await auth_controller.resend_verification_email(email=request.email)


@router.post('/forgot-password')
async def send_password_reset_otp(request: SendPasswordResetRequest):
    """Send password reset OTP"""
    return await auth_controller.send_password_reset_otp(email=request.email)


@router.post('/verify-reset-otp')
async def verify_reset_otp(request: VerifyResetOtpRequest):
    """Verify password reset OTP"""
    return await auth_controller.verify_reset_otp(
        email=request.email,
        otp=request.otp
    )


@router.post('/reset-password')
async def reset_password(request: ChangePasswordRequest):
    """Reset password with token"""
    return await auth_controller.change_password(
        token=request.token,
        new_password=request.new_password
    )


# Protected routes (authentication required)
@router.get('/me')
async def get_me(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get current user profile"""
    user = await get_current_user(credentials=credentials)
    return await auth_controller.get_me(user_id=user['id'])


@router.put('/profile')
async def update_profile(
    request: UpdateProfileRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Update current user profile"""
    user = await get_current_user(credentials=credentials)
    return await auth_controller.update_profile(
        user_id=user['id'],
        name=request.name,
        email=request.email
    )


@router.post('/change-password')
async def change_password(
    request: ChangePasswordRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Change password for authenticated user"""
    user = await get_current_user(credentials=credentials)
    return await auth_controller.change_password(
        current_password=request.current_password,
        new_password=request.new_password,
        user_id=user['id']
    )
