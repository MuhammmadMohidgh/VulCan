#!/usr/bin/env python3
"""
Database Migration Script for Vulnerability Scanner
This script handles database initialization and migrations
"""

import asyncio
import sys
import os
from pathlib import Path

# Add the server directory to the Python path
server_dir = Path(__file__).parent.parent
sys.path.insert(0, str(server_dir))

from database import init_db, close_db


async def migrate_database():
    """Run database migrations"""
    try:
        print("🚀 Starting database migration...")
        
        # Initialize database (creates all tables)
        await init_db()
        print("✅ Database tables created successfully!")
        
        print("🎉 Database migration completed successfully!")
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        raise
    finally:
        await close_db()


async def main():
    """Main migration function"""
    await migrate_database()


if __name__ == "__main__":
    asyncio.run(main())