import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  Loader, 
  LogIn, 
  LogOut, 
  User,
  ExternalLink
} from 'lucide-react';
import {
  getStoredToken,
  getStoredUser,
  setStoredToken,
  setStoredUser,
  clearStorage,
  login,
  startScan,
  getScanResult,
  getUserScans,
  type ScanResult
} from '../shared/api';
import './popup.css';

type View = 'login' | 'scanning' | 'results';

const PopupContent: React.FC = () => {
  const [view, setView] = useState<View>('login');
  const [user, setUser] = useState<any>(null);
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const verificationBlocked = user && (user.is_verified === false || user.isVerified === false);
  
  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Scan state
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState('');
  const [currentScan, setCurrentScan] = useState<ScanResult | null>(null);
  const [scanError, setScanError] = useState('');

  // History state
  const [recentScans, setRecentScans] = useState<ScanResult[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState('');

  useEffect(() => {
    initializePopup();
  }, []);

  const initializePopup = async () => {
    const token = await getStoredToken();
    const storedUser = await getStoredUser();
    
    if (token && storedUser) {
      setUser(storedUser);
      setView('scanning');
      loadRecentScans();
    }

    try {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs: chrome.tabs.Tab[]) => {
        if (tabs[0]?.url) setCurrentUrl(tabs[0].url);
      });
    } catch (error) {
      console.error('Error getting current tab:', error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      const response = await login(email, password);
      const token = response.token || response.access_token;
      if (!token) throw new Error('Token missing in response');
      await setStoredToken(token);
      await setStoredUser(response.user);
      setUser(response.user);
      setView('scanning');
      loadRecentScans();
    } catch (error: any) {
      setLoginError(error.message || 'Login failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await clearStorage();
    setUser(null);
    setView('login');
    setCurrentScan(null);
    setRecentScans([]);
  };

  const handleScanCurrentPage = async () => {
    if (!currentUrl) {
      setScanError('No URL detected');
      return;
    }

    setIsScanning(true);
    setScanError('');
    setScanProgress('Initiating scan...');

    try {
      const response = await startScan(currentUrl);
      setScanProgress('Scanning in progress...');
      const scanId = response.scan_id;
      await pollScanResult(scanId);
    } catch (error: any) {
      setScanError(error.message || 'Scan failed');
      setIsScanning(false);
    }
  };

  const pollScanResult = async (scanId: string) => {
    const maxAttempts = 60;
    let attempts = 0;

    const poll = async () => {
      try {
        const result = await getScanResult(scanId);
        if (result.scan_status === 'completed') {
          setCurrentScan(result);
          setView('results');
          setIsScanning(false);
          loadRecentScans();
          return;
        }
        if (result.scan_status === 'failed') {
          setScanError('Scan failed');
          setIsScanning(false);
          return;
        }
        attempts++;
        if (attempts >= maxAttempts) {
          setScanError('Scan timeout');
          setIsScanning(false);
          return;
        }
        setScanProgress(`Scanning... (${result.scan_status})`);
        setTimeout(poll, 2000);
      } catch (error: any) {
        setScanError(error.message || 'Failed to get scan results');
        setIsScanning(false);
      }
    };

    poll();
  };

  const loadRecentScans = async () => {
    setIsLoadingHistory(true);
    setHistoryError('');
    try {
      const scans = await getUserScans();
      setRecentScans(scans);
    } catch (error: any) {
      const msg = error.message || 'Failed to load scans';
      console.error('Failed to load history:', msg);
      // Handle auth-related issues: force logout and show message
      if (/Authorization token|Invalid or expired token|Token has expired|Your account is not yet verified/i.test(msg)) {
        setHistoryError(msg);
        await clearStorage();
        setUser(null);
        setView('login');
        setLoginError(msg.includes('verified') ? msg : 'Please login again. ' + msg);
      } else {
        setHistoryError(msg);
      }
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const viewScanDetails = (scan: ScanResult) => {
    setCurrentScan(scan);
    setView('results');
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
      case 'high': return '#ef4444';
      case 'medium': return '#f97316';
      case 'low': return '#eab308';
      default: return '#6b7280';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#eab308';
    if (score >= 40) return '#f97316';
    return '#ef4444';
  };

  if (view === 'login') {
    return (
      <div className="container">
        <div className="header">
          <Shield size={32} />
          <h1>VulCan Scanner</h1>
        </div>
        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          {loginError && (
            <div className="error-message">
              <AlertTriangle size={16} /> {loginError}
            </div>
          )}
          <button type="submit" className="btn btn-primary" disabled={isLoggingIn}>
            {isLoggingIn ? (<><Loader className="spin" size={16} /> Logging in...</>) : (<><LogIn size={16} /> Login</>)}
          </button>
        </form>
        <div className="footer-text">Use your VulCan web app credentials</div>
      </div>
    );
  }

  if (view === 'scanning') {
    return (
      <div className="container">
        <div className="header-small">
          <div className="user-info"><User size={20} /> <span>{user?.name}</span></div>
          <button onClick={handleLogout} className="btn-icon" title="Logout"><LogOut size={18} /></button>
        </div>
        <div className="scan-section">
          <div className="current-url">
            <h2>Current Page</h2>
            <div className="url-display">{currentUrl ? currentUrl : <span className="text-muted">No URL detected</span>}</div>
          </div>
          {verificationBlocked && (<div className="error-message"><AlertTriangle size={16} /> Account not verified. Please verify your email before scanning.</div>)}
          {scanError && (<div className="error-message"><AlertTriangle size={16} /> {scanError}</div>)}
          <button onClick={handleScanCurrentPage} className="btn btn-primary btn-large" disabled={verificationBlocked || isScanning || !currentUrl}>
            {isScanning ? (<><Loader className="spin" size={20} /> {scanProgress}</>) : (<><Shield size={20} /> Scan This Page</>)}
          </button>
          <div className="divider">Recent Scans</div>
          {historyError && (<div className="error-message"><AlertTriangle size={16} /> {historyError}</div>)}
          {isLoadingHistory ? (
            <div className="loading-state"><Loader className="spin" size={24} /></div>
          ) : recentScans.length > 0 ? (
            <div className="scan-list">
              {recentScans.slice(0,5).map(scan => (
                <div key={scan.id} className="scan-item" onClick={() => viewScanDetails(scan)}>
                  <div className="scan-item-header">
                    <span className="scan-url">{new URL(scan.target_url).hostname}</span>
                    {scan.security_score !== null && (
                      <span className="score-badge" style={{ backgroundColor: getScoreColor(scan.security_score) }}>
                        {scan.security_score}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state"><Shield size={32} /><p>No scans yet</p></div>
          )}
        </div>
      </div>
    );
  }

  if (view === 'results' && currentScan) {
    const findings = currentScan.scan_results?.findings || [];
    return (
      <div className="container">
        <div className="header-small">
          <button onClick={() => setView('scanning')} className="btn-text">← Back</button>
          <button onClick={handleLogout} className="btn-icon" title="Logout"><LogOut size={18} /></button>
        </div>
        <div className="results-section">
          <div className="result-header">
            <h2>Scan Results</h2>
            <div className="result-url">{new URL(currentScan.target_url).hostname}</div>
          </div>
          <div className="score-card">
            {currentScan.security_score !== null ? (
              <>
                <div className="score-circle" style={{ borderColor: getScoreColor(currentScan.security_score) }}>
                  <span className="score-value">{currentScan.security_score}</span>
                  <span className="score-label">Security Score</span>
                </div>
                <div className="vulnerability-stats">
                  <div className="stat-item"><span className="stat-value critical">{currentScan.high_risk_count}</span><span className="stat-label">High</span></div>
                  <div className="stat-item"><span className="stat-value medium">{currentScan.medium_risk_count}</span><span className="stat-label">Medium</span></div>
                  <div className="stat-item"><span className="stat-value low">{currentScan.low_risk_count}</span><span className="stat-label">Low</span></div>
                </div>
              </>
            ) : (
              <div className="loading-state"><Loader className="spin" size={32} /><p>Processing results...</p></div>
            )}
          </div>
          {findings.length > 0 && (
            <div className="findings-list">
              <h3>Vulnerabilities Found</h3>
              {findings.slice(0,5).map((finding: any, index: number) => (
                <div key={index} className="finding-item">
                  <div className="finding-header">
                    <span className="severity-badge" style={{ backgroundColor: getSeverityColor(finding.severity) }}>{finding.severity}</span>
                    <span className="finding-title">{finding.title}</span>
                  </div>
                  <p className="finding-description">{finding.description}</p>
                </div>
              ))}
              {findings.length > 5 && <div className="more-findings">+{findings.length - 5} more vulnerabilities</div>}
            </div>
          )}
          <button className="btn btn-secondary" onClick={() => chrome.tabs.create({ url: `http://localhost:5173/results?scan=${currentScan.id}` })}>
            <ExternalLink size={16} /> View Full Report
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default PopupContent;
