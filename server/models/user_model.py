from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update, delete
from typing import Optional, Dict, Any, List
from database import get_db, async_session_maker
from database.models import User


class UserModel:
    """User model for database operations"""

    async def get_all_users(self, db: AsyncSession) -> List[Dict[str, Any]]:
        """Get all users"""
        result = await db.execute(select(User))
        users = result.scalars().all()
        return [self._user_to_dict(user) for user in users]

    async def find_by_id(self, user_id: str, db: AsyncSession = None) -> Optional[Dict[str, Any]]:
        """Find user by ID"""
        if db is None:
            async with async_session_maker() as session:
                result = await session.execute(select(User).where(User.id == user_id))
                user = result.scalar_one_or_none()
                
                if user:
                    return self._user_to_dict(user)
                return None
        else:
            result = await db.execute(select(User).where(User.id == user_id))
            user = result.scalar_one_or_none()
            
            if user:
                return self._user_to_dict(user)
            return None

    async def find_by_email(self, email: str, db: AsyncSession = None) -> Optional[Dict[str, Any]]:
        """Find user by email"""
        if db is None:
            async with async_session_maker() as session:
                result = await session.execute(select(User).where(User.email == email))
                user = result.scalar_one_or_none()
                
                if user:
                    return self._user_to_dict(user)
                return None
        else:
            result = await db.execute(select(User).where(User.email == email))
            user = result.scalar_one_or_none()
            
            if user:
                return self._user_to_dict(user)
            return None

    async def create_user(self, data: Dict[str, Any], db: AsyncSession = None) -> Dict[str, Any]:
        """Create a new user"""
        if db is None:
            async with async_session_maker() as session:
                user = User(**data)
                session.add(user)
                await session.commit()
                await session.refresh(user)
                
                return self._user_to_dict(user)
        else:
            user = User(**data)
            db.add(user)
            await db.commit()
            await db.refresh(user)
            
            return self._user_to_dict(user)

    async def update_user(
        self,
        where: Dict[str, Any],
        data: Dict[str, Any],
        db: AsyncSession = None
    ) -> Optional[Dict[str, Any]]:
        """Update user"""
        if db is None:
            async with async_session_maker() as session:
                # Build where clause
                query = select(User)
                for key, value in where.items():
                    query = query.where(getattr(User, key) == value)
                
                result = await session.execute(query)
                user = result.scalar_one_or_none()
                
                if not user:
                    return None
                
                # Update fields
                for key, value in data.items():
                    setattr(user, key, value)
                
                await session.commit()
                await session.refresh(user)
                
                return self._user_to_dict(user)
        else:
            # Build where clause
            query = select(User)
            for key, value in where.items():
                query = query.where(getattr(User, key) == value)
            
            result = await db.execute(query)
            user = result.scalar_one_or_none()
            
            if not user:
                return None
            
            # Update fields
            for key, value in data.items():
                setattr(user, key, value)
            
            await db.commit()
            await db.refresh(user)
            
            return self._user_to_dict(user)

    async def delete_user(self, user_id: str, db: AsyncSession = None) -> bool:
        """Delete user by ID"""
        if db is None:
            async with async_session_maker() as session:
                result = await session.execute(select(User).where(User.id == user_id))
                user = result.scalar_one_or_none()
                
                if not user:
                    return False
                
                await session.delete(user)
                await session.commit()
                
                return True
        else:
            result = await db.execute(select(User).where(User.id == user_id))
            user = result.scalar_one_or_none()
            
            if not user:
                return False
            
            await db.delete(user)
            await db.commit()
            
            return True

    def _user_to_dict(self, user: User) -> Dict[str, Any]:
        """Convert User model to dictionary"""
        return {
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'password': user.password,
            'role': user.role,
            'is_verified': user.is_verified,
            'otp': user.otp,
            'otp_expires_at': user.otp_expires_at,
            'created_at': user.created_at,
            'updated_at': user.updated_at
        }
