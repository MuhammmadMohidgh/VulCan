// API Configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Storage keys
export const STORAGE_KEYS = {
  TOKEN: 'vulcan_token',
  USER: 'vulcan_user',
} as const;

// API Client
export interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  // Backend returns `token`; legacy code expected `access_token`
  token?: string;
  access_token?: string;
  message?: string;
  user: {
    id: string;
    name: string;
    email: string;
    // Server returns isVerified; some code used is_verified
    isVerified?: boolean;
    is_verified?: boolean;
  };
}

export interface ScanRequest {
  target_url: string;
}

export interface ScanResponse {
  scan_id: string;
  target_url: string;
  scan_status: string;
  message: string;
}

export interface ScanResult {
  id: string;
  target_url: string;
  scan_status: 'pending' | 'running' | 'completed' | 'failed';
  security_score: number | null;
  total_vulnerabilities: number;
  high_risk_count: number;
  medium_risk_count: number;
  low_risk_count: number;
  scan_results: any;
  started_at: string;
  completed_at: string | null;
}

// API Functions
export async function getStoredToken(): Promise<string | null> {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEYS.TOKEN], (result: { [key: string]: any }) => {
      resolve(result[STORAGE_KEYS.TOKEN] || null);
    });
  });
}

export async function setStoredToken(token: string): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [STORAGE_KEYS.TOKEN]: token }, () => {
      resolve();
    });
  });
}

export async function getStoredUser(): Promise<any | null> {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEYS.USER], (result: { [key: string]: any }) => {
      resolve(result[STORAGE_KEYS.USER] || null);
    });
  });
}

export async function setStoredUser(user: any): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [STORAGE_KEYS.USER]: user }, () => {
      resolve();
    });
  });
}

export async function clearStorage(): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.clear(() => {
      resolve();
    });
  });
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    let errorMessage = 'Login failed';
    try {
      const error = await response.json();
      // Possible shapes:
      // { detail: { error: '...' } }
      // { detail: { verificationError: true, error: 'Your Email is not Verified!...' } }
      // { detail: 'Invalid credentials' }
      // { error: 'Invalid credentials' }
      if (error) {
        if (typeof error.detail === 'string') errorMessage = error.detail;
        else if (error.detail && typeof error.detail === 'object') {
          if (error.detail.error) errorMessage = error.detail.error;
        } else if (error.error) errorMessage = error.error;
        if (error.detail && error.detail.verificationError) {
          errorMessage = error.detail.error || 'Email not verified';
        }
      }
    } catch (_) {}
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return data;
}

export async function startScan(targetUrl: string): Promise<ScanResponse> {
  const token = await getStoredToken();
  
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_URL}/vulnerability/scan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ target_url: targetUrl }),
  });

  if (!response.ok) {
    let errorMessage = 'Scan failed to start';
    try {
      const error = await response.json();
      // Backend sends { detail: { error: '...' } } or { detail: '...' }
      if (error) {
        if (typeof error.detail === 'string') errorMessage = error.detail;
        else if (error.detail && typeof error.detail === 'object' && error.detail.error) errorMessage = error.detail.error;
        else if (error.error) errorMessage = error.error;
        else if (error.message) errorMessage = error.message;
      }
    } catch (_) {
      // ignore JSON parsing errors
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export async function getScanResult(scanId: string): Promise<ScanResult> {
  const token = await getStoredToken();
  
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_URL}/vulnerability/scan/${scanId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    let errorMessage = 'Failed to fetch scan result';
    try {
      const error = await response.json();
      if (error) {
        if (typeof error.detail === 'string') errorMessage = error.detail;
        else if (error.detail && typeof error.detail === 'object' && error.detail.error) errorMessage = error.detail.error;
        else if (error.error) errorMessage = error.error;
        else if (error.message) errorMessage = error.message;
      }
    } catch (_) {}
    throw new Error(errorMessage);
  }

  return response.json();
}

export async function getUserScans(): Promise<ScanResult[]> {
  const token = await getStoredToken();
  
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_URL}/vulnerability/scans?limit=10`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    let errorMessage = 'Failed to fetch scans';
    try {
      const error = await response.json();
      if (error) {
        if (typeof error.detail === 'string') errorMessage = error.detail;
        else if (error.detail && typeof error.detail === 'object' && error.detail.error) errorMessage = error.detail.error;
        else if (error.error) errorMessage = error.error;
        else if (error.message) errorMessage = error.message;
      }
    } catch (_) {}
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return data.scans || [];
}
