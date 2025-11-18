"""
Test script for vulnerability scanner
Run this to test the scanner independently
"""
import asyncio
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from services.vulnerability_scanner import VulnerabilityScanner


async def test_scanner():
    """Test the vulnerability scanner"""
    scanner = VulnerabilityScanner()
    
    # Test URLs
    test_urls = [
        "https://example.com",
        "https://google.com",
        "https://github.com",
    ]
    
    print("=" * 60)
    print("VULNERABILITY SCANNER TEST")
    print("=" * 60)
    
    for url in test_urls:
        print(f"\n{'='*60}")
        print(f"Testing: {url}")
        print(f"{'='*60}\n")
        
        try:
            results = await scanner.scan_url(url)
            
            print(f"Target URL: {results.get('target_url')}")
            print(f"Security Score: {results.get('security_score')}/100")
            print(f"Scan Timestamp: {results.get('scan_timestamp')}")
            
            if results.get('error'):
                print(f"ERROR: {results['error']}")
            
            # Headers analysis
            headers = results.get('headers_analysis', {})
            print(f"\nHeaders Analysis:")
            print(f"  Status Code: {headers.get('status_code', 'N/A')}")
            print(f"  Server: {headers.get('server_header', 'N/A')}")
            if headers.get('error'):
                print(f"  Error: {headers['error']}")
            
            # SSL analysis
            ssl_info = results.get('ssl_analysis', {})
            if ssl_info:
                print(f"\nSSL Analysis:")
                if ssl_info.get('error'):
                    print(f"  Error: {ssl_info['error']}")
                else:
                    print(f"  Subject: {ssl_info.get('subject', {})}")
                    print(f"  Issuer: {ssl_info.get('issuer', {})}")
            
            # Vulnerabilities
            vulnerabilities = results.get('vulnerabilities', [])
            print(f"\nVulnerabilities Found: {len(vulnerabilities)}")
            
            if vulnerabilities:
                # Group by severity
                by_severity = {}
                for vuln in vulnerabilities:
                    severity = vuln.get('severity', 'unknown')
                    if severity not in by_severity:
                        by_severity[severity] = []
                    by_severity[severity].append(vuln)
                
                for severity in ['critical', 'high', 'medium', 'low']:
                    if severity in by_severity:
                        print(f"\n  {severity.upper()} Severity ({len(by_severity[severity])}):")
                        for vuln in by_severity[severity]:
                            print(f"    - {vuln.get('title', 'Unknown')}")
                            print(f"      Type: {vuln.get('type', 'unknown')}")
                            print(f"      OWASP: {vuln.get('owasp_category', 'N/A')}")
            
            print("\n" + "="*60)
            
        except Exception as e:
            print(f"EXCEPTION: {str(e)}")
            import traceback
            traceback.print_exc()
        
        # Wait between tests
        await asyncio.sleep(1)
    
    print("\n" + "="*60)
    print("TEST COMPLETE")
    print("="*60)


if __name__ == "__main__":
    asyncio.run(test_scanner())
