from sqlalchemy import Column, String, Boolean, DateTime, Text, Float, Integer, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import uuid

Base = declarative_base()


class User(Base):
    """User database model"""
    __tablename__ = 'users'
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)
    role = Column(String(50), default='USER', nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    otp = Column(String(10), nullable=True)
    otp_expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    scans = relationship("VulnerabilityScan", back_populates="user")
    
    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, name={self.name})>"


class VulnerabilityScan(Base):
    """Vulnerability scan results model"""
    __tablename__ = 'vulnerability_scans'
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey('users.id'), nullable=False)
    target_url = Column(String(500), nullable=False)
    scan_status = Column(String(50), default='pending', nullable=False)  # pending, running, completed, failed
    security_score = Column(Float, nullable=True)
    total_vulnerabilities = Column(Integer, default=0, nullable=False)
    high_risk_count = Column(Integer, default=0, nullable=False)
    medium_risk_count = Column(Integer, default=0, nullable=False)
    low_risk_count = Column(Integer, default=0, nullable=False)
    scan_metadata = Column(JSON, nullable=True)  # Store additional scan info
    scan_results = Column(JSON, nullable=True)  # Store detailed results
    started_at = Column(DateTime, server_default=func.now(), nullable=False)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="scans")
    findings = relationship("VulnerabilityFinding", back_populates="scan")
    
    def __repr__(self):
        return f"<VulnerabilityScan(id={self.id}, url={self.target_url}, score={self.security_score})>"


class VulnerabilityFinding(Base):
    """Individual vulnerability findings model"""
    __tablename__ = 'vulnerability_findings'
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    scan_id = Column(String(36), ForeignKey('vulnerability_scans.id'), nullable=False)
    vulnerability_type = Column(String(100), nullable=False)  # OWASP category
    severity = Column(String(20), nullable=False)  # high, medium, low, info
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    remediation = Column(Text, nullable=True)
    technical_details = Column(JSON, nullable=True)  # Store technical info like headers, etc.
    cvss_score = Column(Float, nullable=True)
    cwe_id = Column(String(20), nullable=True)
    found_at = Column(DateTime, server_default=func.now(), nullable=False)
    
    # Relationships
    scan = relationship("VulnerabilityScan", back_populates="findings")
    
    def __repr__(self):
        return f"<VulnerabilityFinding(id={self.id}, type={self.vulnerability_type}, severity={self.severity})>"
