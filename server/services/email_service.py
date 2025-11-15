import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, Any
from pathlib import Path
from jinja2 import Template


async def send_email(
    to: str,
    subject: str,
    file_name: str,
    options: Dict[str, Any]
) -> bool:
    """
    Send email with HTML template
    
    Args:
        to: Recipient email address
        subject: Email subject
        file_name: HTML template file name
        options: Variables to substitute in template
    
    Returns:
        True if email sent successfully
    """
    try:
        # Email configuration from environment variables
        smtp_host = os.getenv('SMTP_HOST', 'smtp.gmail.com')
        smtp_port = int(os.getenv('SMTP_PORT', '587'))
        smtp_user = os.getenv('SMTP_USER')
        smtp_password = os.getenv('SMTP_PASSWORD')
        from_email = os.getenv('FROM_EMAIL', smtp_user)
        
        if not smtp_user or not smtp_password:
            raise ValueError('SMTP credentials not configured')
        
        # Load and render HTML template
        template_path = Path(__file__).parent.parent / 'templates' / 'emails' / file_name
        
        if not template_path.exists():
            raise FileNotFoundError(f'Email template not found: {file_name}')
        
        with open(template_path, 'r', encoding='utf-8') as f:
            template_content = f.read()
        
        template = Template(template_content)
        html_content = template.render(**options)
        
        # Create email message
        message = MIMEMultipart('alternative')
        message['Subject'] = subject
        message['From'] = from_email
        message['To'] = to
        
        # Attach HTML content
        html_part = MIMEText(html_content, 'html')
        message.attach(html_part)
        
        # Send email
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.send_message(message)
        
        print(f'Email sent successfully to {to}')
        print(f'📧 Ethereal email preview: https://ethereal.email/message')
        print(f'🔑 Login with: {smtp_user} / {smtp_password}')
        
        # Extract and display OTP if present in options
        if 'OTP' in options:
            print(f'🔢 OTP Code: {options["OTP"]}')
            print(f'⚠️  If Ethereal preview shows "Error: Not Found", use the OTP code above for testing')
        
        return True
        
    except Exception as error:
        print(f'Failed to send email: {error}')
        raise error
