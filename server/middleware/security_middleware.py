import re
import jwt
import os
from datetime import datetime, timedelta
from typing import Dict, Any


def validate_email(email: str) -> bool:
    """Validate email format"""
    email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(email_regex, email))


def validate_password(password: str) -> Dict[str, Any]:
    """
    Validate password strength
    Requirements:
    - At least 8 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one number
    - At least one special character
    """
    if len(password) < 8:
        return {
            'valid': False,
            'message': 'Password must be at least 8 characters long'
        }
    
    if not re.search(r'[A-Z]', password):
        return {
            'valid': False,
            'message': 'Password must contain at least one uppercase letter'
        }
    
    if not re.search(r'[a-z]', password):
        return {
            'valid': False,
            'message': 'Password must contain at least one lowercase letter'
        }
    
    if not re.search(r'\d', password):
        return {
            'valid': False,
            'message': 'Password must contain at least one number'
        }
    
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return {
            'valid': False,
            'message': 'Password must contain at least one special character'
        }
    
    return {
        'valid': True,
        'message': 'Password is valid'
    }


def create_token(payload: Dict[str, Any], expires_in: str) -> str:
    """
    Create JWT token
    
    Args:
        payload: Data to encode in token
        expires_in: Expiration time (e.g., '24h', '5m', '7d')
    
    Returns:
        JWT token string
    """
    jwt_secret = os.getenv('JWT_SECRET')
    
    if not jwt_secret:
        raise ValueError('JWT_SECRET environment variable is not set')
    
    # Parse expiration time
    expiration_delta = parse_time_string(expires_in)
    expiration = datetime.utcnow() + expiration_delta
    
    # Add expiration to payload
    token_payload = {
        **payload,
        'exp': expiration,
        'iat': datetime.utcnow()
    }
    
    # Create token
    token = jwt.encode(token_payload, jwt_secret, algorithm='HS256')
    
    return token


def parse_time_string(time_str: str) -> timedelta:
    """
    Parse time string to timedelta
    
    Args:
        time_str: Time string (e.g., '24h', '5m', '7d')
    
    Returns:
        timedelta object
    """
    unit = time_str[-1]
    value = int(time_str[:-1])
    
    if unit == 'h':
        return timedelta(hours=value)
    elif unit == 'm':
        return timedelta(minutes=value)
    elif unit == 'd':
        return timedelta(days=value)
    elif unit == 's':
        return timedelta(seconds=value)
    else:
        raise ValueError(f'Invalid time unit: {unit}')


def verify_token(token: str) -> Dict[str, Any]:
    """
    Verify and decode JWT token
    
    Args:
        token: JWT token string
    
    Returns:
        Decoded payload
    """
    jwt_secret = os.getenv('JWT_SECRET')
    
    if not jwt_secret:
        raise ValueError('JWT_SECRET environment variable is not set')
    
    try:
        payload = jwt.decode(token, jwt_secret, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        raise ValueError('Token has expired')
    except jwt.InvalidTokenError:
        raise ValueError('Invalid token')
