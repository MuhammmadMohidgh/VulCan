import jwt
import os
from fastapi import Request, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from models.user_model import UserModel


class AuthMiddleware:
    def __init__(self):
        self.jwt_secret = os.getenv('JWT_SECRET')
        self.user_model = UserModel()

    async def verify_token(
        self,
        authorization: Optional[str] = None,
        db: AsyncSession = None
    ) -> dict:
        """Verify JWT token and return user data"""
        
        if not authorization:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={'error': 'Authorization token missing'}
            )

        # Extract token from "Bearer <token>" format
        parts = authorization.split(' ')
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={'error': 'Authorization token is invalid'}
            )

        token = parts[1]

        if not token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={'error': 'Authorization token is invalid'}
            )

        try:
            # Verify JWT token
            decoded = jwt.decode(token, self.jwt_secret, algorithms=['HS256'])
            
            # Find user in database
            user = await self.user_model.find_by_id(decoded['userId'])
            
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail={'error': 'User not found'}
                )

            if not user['is_verified']:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail={'error': 'Your account is not yet verified. Please complete the verification process to proceed.'}
                )

            return user

        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={'error': 'Token has expired'}
            )
        except jwt.InvalidTokenError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={'error': 'Invalid or expired token'}
            )
        except Exception as error:
            print(f"Auth middleware error: {error}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={'error': 'Invalid or expired token'}
            )


# Bearer token security scheme for FastAPI
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = None,
    db: AsyncSession = None
) -> dict:
    """Dependency to get current authenticated user"""
    auth_middleware = AuthMiddleware()
    
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={'error': 'Authorization token missing'}
        )
    
    authorization = f"Bearer {credentials.credentials}"
    user = await auth_middleware.verify_token(authorization=authorization, db=db)
    return user
