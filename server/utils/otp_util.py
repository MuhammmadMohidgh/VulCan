import random
from datetime import datetime, timedelta
from typing import Dict, Any


def generate_otp(length: int = 6, expiry_minutes: int = 10) -> Dict[str, Any]:
    """
    Generate OTP (One Time Password)
    
    Args:
        length: Length of OTP (default: 6)
        expiry_minutes: Expiry time in minutes (default: 10)
    
    Returns:
        Dictionary with 'otp' and 'otp_expires_at'
    """
    # Generate random OTP
    otp = ''.join([str(random.randint(0, 9)) for _ in range(length)])
    
    # Calculate expiration time
    otp_expires_at = datetime.utcnow() + timedelta(minutes=expiry_minutes)
    
    return {
        'otp': otp,
        'otp_expires_at': otp_expires_at
    }


def verify_otp(stored_otp: str, provided_otp: str, expires_at: datetime) -> bool:
    """
    Verify OTP
    
    Args:
        stored_otp: OTP stored in database
        provided_otp: OTP provided by user
        expires_at: Expiration datetime
    
    Returns:
        True if OTP is valid, False otherwise
    """
    if stored_otp != provided_otp:
        return False
    
    if datetime.utcnow() > expires_at:
        return False
    
    return True
