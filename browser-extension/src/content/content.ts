// Content script for VulCan extension
// This script runs on all pages and can analyze page content

console.log('VulCan content script loaded');

// Listen for messages from popup or background
chrome.runtime.onMessage.addListener((message: any, _sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
  if (message.type === 'GET_PAGE_INFO') {
    // Extract page information
    const pageInfo = {
      url: window.location.href,
      title: document.title,
      protocol: window.location.protocol,
      hostname: window.location.hostname,
      hasHttps: window.location.protocol === 'https:',
      headers: getResponseHeaders(),
      meta: getMetaTags(),
    };
    
    sendResponse(pageInfo);
    return true;
  }

  if (message.type === 'ANALYZE_SECURITY_HEADERS') {
    // Analyze security headers from the page
    const headers = getResponseHeaders();
    const analysis = analyzeHeaders(headers);
    sendResponse(analysis);
    return true;
  }
});

// Helper function to get response headers (limited in content scripts)
function getResponseHeaders(): Record<string, string> {
  // Note: Content scripts can't directly access response headers
  // This would need to be done via webRequest API in background script
  return {};
}

// Helper function to get meta tags
function getMetaTags(): Record<string, string> {
  const metaTags: Record<string, string> = {};
  const metas = document.getElementsByTagName('meta');
  
  for (let i = 0; i < metas.length; i++) {
    const meta = metas[i];
    const name = meta.getAttribute('name') || meta.getAttribute('property');
    const content = meta.getAttribute('content');
    
    if (name && content) {
      metaTags[name] = content;
    }
  }
  
  return metaTags;
}

// Helper function to analyze headers
function analyzeHeaders(headers: Record<string, string>): any {
  const issues: Array<{header: string; status: string; severity: string}> = [];
  
  // Check for important security headers
  const securityHeaders = [
    'strict-transport-security',
    'x-content-type-options',
    'x-frame-options',
    'content-security-policy',
    'x-xss-protection',
    'referrer-policy',
  ];
  
  securityHeaders.forEach(header => {
    if (!headers[header]) {
      issues.push({
        header,
        status: 'missing',
        severity: 'medium',
      });
    }
  });
  
  return {
    headers,
    issues,
    hasHttps: window.location.protocol === 'https:',
  };
}

// Inject a badge or indicator on the page (optional)
// Commented out to avoid unused warning - uncomment if needed
/*
function injectSecurityIndicator(score: number) {
  const indicator = document.createElement('div');
  indicator.id = 'vulcan-security-indicator';
  indicator.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: ${score >= 80 ? '#10b981' : score >= 60 ? '#eab308' : '#ef4444'};
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 18px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 999999;
    cursor: pointer;
  `;
  indicator.textContent = score.toString();
  indicator.title = `Security Score: ${score}/100`;
  
  indicator.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'OPEN_POPUP' });
  });
  
  document.body.appendChild(indicator);
}
*/
