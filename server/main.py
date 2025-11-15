from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

from database import init_db, close_db
from routes.auth_routes import router as auth_router
from routes.vulnerability_routes import router as vulnerability_router

# Load environment variables
load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events"""
    # Startup
    print("Starting up application...")
    await init_db()
    print("Database initialized")
    
    yield
    
    # Shutdown
    print("Shutting down application...")
    await close_db()
    print("Database connections closed")


# Create FastAPI app
app = FastAPI(
    title="Vulnerability Scanner API",
    description="API for Website Vulnerability Scanner using OWASP",
    version="1.0.0",
    lifespan=lifespan
)


# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv('ALLOWED_ORIGINS', '*').split(','),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers
app.include_router(auth_router)
app.include_router(vulnerability_router)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to Vulnerability Scanner API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Vulnerability Scanner API"
    }


if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv('PORT', 8000))
    host = os.getenv('HOST', '0.0.0.0')
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=True  # Set to False in production
    )
