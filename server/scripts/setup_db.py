#!/usr/bin/env python3
"""
Database Setup Script for Vulnerability Scanner
This script handles database initialization with sample data
"""

import asyncio
import sys
import os
from pathlib import Path
from datetime import datetime, timedelta
import uuid

# Add the server directory to the Python path
server_dir = Path(__file__).parent.parent
sys.path.insert(0, str(server_dir))

from database import init_db, close_db, get_db
from database.models import User, VulnerabilityScan, VulnerabilityFinding
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select


async def create_sample_user(db: AsyncSession):
    """Create a sample user for testing"""
    # Check if user already exists
    result = await db.execute(select(User).where(User.email == "demo@example.com"))
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        print("ℹ️  Sample user already exists")
        return existing_user
    
    # Create sample user with hashed password
    import bcrypt
    password_hash = bcrypt.hashpw("demo123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    sample_user = User(
        id=str(uuid.uuid4()),
        name="Demo User",
        email="demo@example.com",
        password=password_hash,
        role="USER",
        is_verified=True,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    db.add(sample_user)
    await db.commit()
    print("✅ Sample user created: demo@example.com / demo123")
    return sample_user


async def create_sample_scans(db: AsyncSession, user_id: str):
    """Create sample vulnerability scans"""
    # Check if scans already exist
    result = await db.execute(select(VulnerabilityScan).where(VulnerabilityScan.user_id == user_id))
    existing_scans = result.scalars().all()
    
    if existing_scans:
        print(f"ℹ️  {len(existing_scans)} sample scans already exist")
        return
    
    # Create sample scans
    sample_scans = [
        VulnerabilityScan(
            id=str(uuid.uuid4()),
            user_id=user_id,
            target_url="https://example.com",
            scan_status="completed",
            security_score=85.5,
            total_vulnerabilities=3,
            high_risk_count=0,
            medium_risk_count=2,
            low_risk_count=1,
            scan_metadata={
                "scan_type": "comprehensive",
                "duration_seconds": 45,
                "ssl_enabled": True,
                "headers_analyzed": 15
            },
            scan_results={
                "summary": "Overall secure website with minor issues",
                "recommendations": [
                    "Update security headers",
                    "Implement CSP policy",
                    "Add X-Frame-Options header"
                ]
            },
            started_at=datetime.utcnow() - timedelta(minutes=30),
            completed_at=datetime.utcnow() - timedelta(minutes=29),
            created_at=datetime.utcnow() - timedelta(minutes=30)
        ),
        VulnerabilityScan(
            id=str(uuid.uuid4()),
            user_id=user_id,
            target_url="https://testsite.org",
            scan_status="completed",
            security_score=45.2,
            total_vulnerabilities=8,
            high_risk_count=2,
            medium_risk_count=4,
            low_risk_count=2,
            scan_metadata={
                "scan_type": "basic",
                "duration_seconds": 30,
                "ssl_enabled": False,
                "headers_analyzed": 8
            },
            scan_results={
                "summary": "Website has significant security vulnerabilities",
                "recommendations": [
                    "Enable SSL/TLS encryption",
                    "Fix SQL injection vulnerabilities",
                    "Update outdated software"
                ]
            },
            started_at=datetime.utcnow() - timedelta(hours=2),
            completed_at=datetime.utcnow() - timedelta(hours=1, minutes=55),
            created_at=datetime.utcnow() - timedelta(hours=2)
        )
    ]
    
    for scan in sample_scans:
        db.add(scan)
    
    await db.commit()
    print(f"✅ Created {len(sample_scans)} sample vulnerability scans")


async def create_sample_findings(db: AsyncSession, user_id: str):
    """Create sample vulnerability findings"""
    # Get the first scan
    result = await db.execute(select(VulnerabilityScan).where(VulnerabilityScan.user_id == user_id))
    scans = result.scalars().all()
    
    if not scans:
        print("ℹ️  No scans found for creating findings")
        return
    
    # Check if findings already exist
    result = await db.execute(select(VulnerabilityFinding).where(VulnerabilityFinding.scan_id == scans[0].id))
    existing_findings = result.scalars().all()
    
    if existing_findings:
        print(f"ℹ️  {len(existing_findings)} sample findings already exist")
        return
    
    # Create sample findings for the first scan
    sample_findings = [
        VulnerabilityFinding(
            id=str(uuid.uuid4()),
            scan_id=scans[0].id,
            vulnerability_type="Security Headers",
            severity="medium",
            title="Missing Content Security Policy (CSP)",
            description="The website does not implement a Content Security Policy header, which helps prevent XSS attacks.",
            remediation="Implement a Content Security Policy header with appropriate directives for your website.",
            technical_details={
                "current_headers": ["Content-Type", "Server"],
                "recommended_header": "Content-Security-Policy: default-src 'self'",
                "risk_level": "medium"
            },
            cvss_score=5.3,
            cwe_id="CWE-79",
            found_at=datetime.utcnow() - timedelta(minutes=25)
        ),
        VulnerabilityFinding(
            id=str(uuid.uuid4()),
            scan_id=scans[0].id,
            vulnerability_type="Information Disclosure",
            severity="low",
            title="Server Header Exposed",
            description="The HTTP Server header reveals the web server software version.",
            remediation="Configure the web server to not expose version information in the Server header.",
            technical_details={
                "current_header": "Server: Apache/2.4.41 (Ubuntu)",
                "recommended_header": "Server: Apache",
                "risk_level": "low"
            },
            cvss_score=2.3,
            cwe_id="CWE-200",
            found_at=datetime.utcnow() - timedelta(minutes=25)
        ),
        VulnerabilityFinding(
            id=str(uuid.uuid4()),
            scan_id=scans[1].id if len(scans) > 1 else scans[0].id,
            vulnerability_type="SSL/TLS",
            severity="high",
            title="SSL Certificate Not Found",
            description="The website does not use SSL/TLS encryption, exposing data in transit.",
            remediation="Obtain and install a valid SSL certificate from a trusted Certificate Authority.",
            technical_details={
                "current_protocol": "HTTP",
                "recommended_protocol": "HTTPS",
                "port_tested": 443,
                "certificate_status": "not_found"
            },
            cvss_score=8.2,
            cwe_id="CWE-319",
            found_at=datetime.utcnow() - timedelta(hours=1, minutes=50)
        )
    ]
    
    for finding in sample_findings:
        db.add(finding)
    
    await db.commit()
    print(f"✅ Created {len(sample_findings)} sample vulnerability findings")


async def setup_database():
    """Complete database setup with sample data"""
    try:
        print("🚀 Starting comprehensive database setup...")
        
        # Initialize database (create all tables)
        await init_db()
        print("✅ Database tables created successfully!")
        
        # Get database session
        async for db in get_db():
            # Create sample user
            user = await create_sample_user(db)
            
            # Create sample scans
            await create_sample_scans(db, user.id)
            
            # Create sample findings
            await create_sample_findings(db, user.id)
            
            break  # Only need one session
        
        print("\n🎉 Database setup completed successfully!")
        print("\n📋 Sample Data Summary:")
        print("   • Demo User: demo@example.com / demo123")
        print("   • Sample vulnerability scans with findings")
        print("   • Complete OWASP compliance data")
        print("\n🔧 You can now test the application with the demo credentials!")
        
    except Exception as e:
        print(f"❌ Database setup failed: {e}")
        import traceback
        traceback.print_exc()
        raise
    finally:
        await close_db()


async def main():
    """Main setup function"""
    await setup_database()


if __name__ == "__main__":
    asyncio.run(main())