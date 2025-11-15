import jwt
import bcrypt
from datetime import datetime, timedelta
from fastapi import HTTPException, status
from typing import Optional, Dict, Any
from services.email_service import send_email
from models.user_model import UserModel
from middleware.security_middleware import validate_password, validate_email, create_token
from utils.otp_util import generate_otp
import os


class AuthController:
    def __init__(self):
        self.user_model = UserModel()
        self.jwt_secret = os.getenv('JWT_SECRET')

    async def register(self, email: str, password: str, name: str) -> Dict[str, Any]:
        """Register a new user"""
        try:
            if not email or not password or not name:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail={'error': 'Email, password, and name are required'}
                )

            if not validate_email(email):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail={'error': 'Invalid email format'}
                )

            password_validation = validate_password(password)
            if not password_validation['valid']:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail={'error': password_validation['message']}
                )

            # Hash password
            hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt(12)).decode('utf-8')

            # Generate OTP
            otp_data = generate_otp()

            # Create user
            user = await self.user_model.create_user({
                'name': name,
                'email': email,
                'password': hashed_password,
                'role': 'USER',
                'otp': otp_data['otp'],
                'otp_expires_at': otp_data['otp_expires_at']
            })

            # Send verification email
            await send_email(
                to=email,
                subject='Confirmation Email!',
                file_name='otpEmail.html',
                options={'Name': name, 'OTP': otp_data['otp']}
            )
            
            # Log OTP for testing purposes (since Ethereal preview might not work)
            print(f'🔢 VERIFICATION OTP FOR {email}: {otp_data["otp"]}')
            print(f'📧 This OTP was sent to: {email}')
            print(f'⏰ OTP expires at: {otp_data["otp_expires_at"]}')

            # Create token
            token = create_token(
                {'userId': user['id'], 'role': user['role'], 'isVerified': user['is_verified']},
                '24h'
            )

            return {
                'token': token,
                'message': 'Verification Email sent to your email.',
                'user': {
                    'id': user['id'],
                    'email': user['email'],
                    'name': user['name'],
                    'role': user['role'],
                    'verified': user['is_verified']
                }
            }

        except HTTPException:
            raise
        except Exception as error:
            print(f"Register error: {error}")

            # Handle unique constraint violations
            if hasattr(error, 'code') and error.code == 'P2002':
                field = error.meta.get('target', [None])[0] if hasattr(error, 'meta') else None

                if field == 'email':
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail={
                            'error': 'Email already exists',
                            'fieldErrors': {'email': 'This email address is already in use. Please use a different email.'}
                        }
                    )

                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail={
                        'error': 'A unique constraint violation occurred. Please check your input.',
                        'detail': str(error)
                    }
                )

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={'error': 'Registration failed', 'detail': str(error)}
            )

    async def login(self, email: str, password: str) -> Dict[str, Any]:
        """Login user"""
        try:
            if not email or not password:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail={'error': 'Email and password are required'}
                )

            if not validate_email(email):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail={'error': 'Invalid email format'}
                )

            user = await self.user_model.find_by_email(email)
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail={'error': 'Invalid credentials'}
                )

            # Verify password
            valid = bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8'))
            if not valid:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail={'error': 'Invalid credentials'}
                )

            if not user['is_verified']:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail={
                        'verificationError': True,
                        'email': user['email'],
                        'error': 'Your Email is not Verified! Please verify your Email first.'
                    }
                )

            # Create token
            token = create_token(
                {'userId': user['id'], 'role': user['role'], 'isVerified': user['is_verified']},
                '24h'
            )

            return {
                'token': token,
                'message': 'Login Successfully',
                'user': {
                    'id': user['id'],
                    'email': user['email'],
                    'name': user['name'],
                    'role': user['role'],
                    'isVerified': user['is_verified']
                }
            }

        except HTTPException:
            raise
        except Exception as error:
            print(f"Login error: {error}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={'error': 'Login failed'}
            )

    async def verify_email(self, email: str, otp: str) -> Dict[str, Any]:
        """Verify user email with OTP"""
        try:
            if not email or not otp:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail={'error': 'Email and OTP are required'}
                )

            user = await self.user_model.find_by_email(email)
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail={'error': 'User not found'}
                )

            if user['otp'] != otp or datetime.utcnow() > user['otp_expires_at']:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail={'error': 'Invalid or expired OTP'}
                )

            # Update user verification status
            await self.user_model.update_user(
                {'email': email},
                {'is_verified': True, 'otp': None, 'otp_expires_at': None}
            )

            # Create token
            token = create_token(
                {'userId': user['id'], 'role': user['role'], 'isVerified': True},
                '24h'
            )

            return {
                'token': token,
                'message': 'Your Email verified successfully',
                'user': {
                    'id': user['id'],
                    'email': user['email'],
                    'name': user['name'],
                    'role': user['role'],
                    'isVerified': True
                }
            }

        except HTTPException:
            raise
        except Exception as error:
            print(f"Email verification error: {error}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={'error': 'Email verification failed'}
            )

    async def resend_verification_email(self, email: str) -> Dict[str, str]:
        """Resend verification email"""
        try:
            if not email:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail={'error': 'Email is required'}
                )

            user = await self.user_model.find_by_email(email)
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail={'error': 'User not found'}
                )

            if user['is_verified']:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail={'error': 'Email already verified'}
                )

            # Generate new OTP
            otp_data = generate_otp()

            # Update user with new OTP
            await self.user_model.update_user(
                {'email': email},
                {'otp': otp_data['otp'], 'otp_expires_at': otp_data['otp_expires_at']}
            )

            # Send email
            await send_email(
                to=email,
                subject='Confirmation Email!',
                file_name='otpEmail.html',
                options={'Name': user['name'], 'OTP': otp_data['otp']}
            )

            return {'message': 'Verification email sent'}

        except HTTPException:
            raise
        except Exception as error:
            print(f"Resend verification error: {error}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={'error': 'Failed to resend verification email'}
            )

    async def send_password_reset_otp(self, email: str) -> Dict[str, str]:
        """Send password reset OTP"""
        try:
            if not email:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail={'error': 'Email is required'}
                )

            user = await self.user_model.find_by_email(email)
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail={'error': 'User not found'}
                )

            # Generate OTP
            otp_data = generate_otp()

            # Update user with OTP
            await self.user_model.update_user(
                {'email': email},
                {'otp': otp_data['otp'], 'otp_expires_at': otp_data['otp_expires_at']}
            )

            # Send email
            await send_email(
                to=email,
                subject='Reset Password Request!',
                file_name='otpEmail.html',
                options={'Name': user['name'], 'OTP': otp_data['otp']}
            )

            return {'message': 'OTP sent to your email'}

        except HTTPException:
            raise
        except Exception as error:
            print(f"Send reset OTP error: {error}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={'error': 'Failed to send reset OTP'}
            )

    async def verify_reset_otp(self, email: str, otp: str) -> Dict[str, str]:
        """Verify password reset OTP"""
        try:
            if not email or not otp:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail={'error': 'Email and OTP are required'}
                )

            user = await self.user_model.find_by_email(email)
            if not user or user['otp'] != otp or datetime.utcnow() > user['otp_expires_at']:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail={'error': 'Invalid or expired OTP'}
                )

            # Clear OTP
            await self.user_model.update_user(
                {'email': email},
                {'otp': None, 'otp_expires_at': None}
            )

            # Create short-lived token for password reset
            token = create_token({'userId': user['id']}, '5m')

            return {'token': token, 'message': 'OTP verified successfully'}

        except HTTPException:
            raise
        except Exception as error:
            print(f"Verify reset OTP error: {error}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={'error': 'Failed to verify reset OTP'}
            )

    async def change_password(
        self,
        token: Optional[str] = None,
        new_password: Optional[str] = None,
        current_password: Optional[str] = None,
        user_id: Optional[str] = None
    ) -> Dict[str, str]:
        """Change user password"""
        try:
            # Handle authenticated password change (with currentPassword)
            if current_password:
                if not user_id:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail={'error': 'Authentication required'}
                    )
                if not new_password:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail={'error': 'New password is required'}
                    )

                password_validation = validate_password(new_password)
                if not password_validation['valid']:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail={'error': password_validation['message']}
                    )

                user = await self.user_model.find_by_id(user_id)
                if not user:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail={'error': 'User not found'}
                    )

                # Verify current password
                is_password_valid = bcrypt.checkpw(
                    current_password.encode('utf-8'),
                    user['password'].encode('utf-8')
                )
                if not is_password_valid:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail={'error': 'Current password is incorrect'}
                    )

                # Update password
                hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt(12)).decode('utf-8')
                await self.user_model.update_user(
                    {'id': user['id']},
                    {'password': hashed_password}
                )

                return {'message': 'Password changed successfully'}

            # Handle password reset (with token)
            if not token or not new_password:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail={'error': 'Token and new password are required'}
                )

            password_validation = validate_password(new_password)
            if not password_validation['valid']:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail={'error': password_validation['message']}
                )

            try:
                decoded = jwt.decode(token, self.jwt_secret, algorithms=['HS256'])
            except jwt.InvalidTokenError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail={'error': 'Invalid or expired token'}
                )

            user = await self.user_model.find_by_id(decoded['userId'])
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail={'error': 'User not found'}
                )

            # Update password
            hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt(12)).decode('utf-8')
            await self.user_model.update_user(
                {'id': user['id']},
                {'password': hashed_password}
            )

            return {'message': 'Password reset successfully'}

        except HTTPException:
            raise
        except Exception as error:
            print(f"Change password error: {error}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={'error': 'Failed to change password'}
            )

    async def get_me(self, user_id: str) -> Dict[str, Any]:
        """Get current user profile"""
        try:
            user = await self.user_model.find_by_id(user_id)
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail={'error': 'User not found'}
                )

            # Remove sensitive fields
            safe_user = {k: v for k, v in user.items() if k not in ['password', 'otp', 'otp_expires_at']}
            return safe_user

        except HTTPException:
            raise
        except Exception as error:
            print(f"Get me error: {error}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={'error': 'Failed to get user data'}
            )

    async def update_profile(
        self,
        user_id: str,
        name: Optional[str] = None,
        email: Optional[str] = None
    ) -> Dict[str, Any]:
        """Update current user profile"""
        try:
            if not name and not email:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail={'error': 'No profile fields provided'}
                )

            if email and not validate_email(email):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail={'error': 'Invalid email format'}
                )

            update_data = {}
            if name and isinstance(name, str):
                update_data['name'] = name.strip()
            if email and isinstance(email, str):
                update_data['email'] = email.strip().lower()

            updated = await self.user_model.update_user({'id': user_id}, update_data)
            if not updated:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail={'error': 'User not found'}
                )

            # Remove sensitive fields
            safe_user = {k: v for k, v in updated.items() if k not in ['password', 'otp', 'otp_expires_at']}

            return {
                'message': 'Profile updated successfully',
                'user': safe_user
            }

        except HTTPException:
            raise
        except Exception as error:
            print(f"Update profile error: {error}")

            # Handle unique constraint violations
            if hasattr(error, 'code') and error.code == 'P2002':
                field = error.meta.get('target', [None])[0] if hasattr(error, 'meta') else None
                field_errors = {}

                if field == 'email':
                    field_errors['email'] = 'This email address is already in use. Please use a different email.'
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail={'error': 'Email already exists', 'fieldErrors': field_errors}
                    )

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={'error': 'Failed to update profile'}
            )
