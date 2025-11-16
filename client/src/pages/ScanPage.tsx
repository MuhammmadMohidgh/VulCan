import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Search, Globe, Shield, Clock, AlertCircle, CheckCircle, XCircle, Loader2, Zap, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { apiService } from '@/services'

interface ScanResult {
  scan_id: string
  status: string
  message: string
  security_score?: number
  findings?: Array<{
    id: string
    title: string
    severity: string
    description: string
    recommendation: string
    owasp_category: string
  }>
}

const ScanPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [targetUrl, setTargetUrl] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [scanType, setScanType] = useState<'basic' | 'comprehensive' | 'enterprise'>('basic')
  const [debugInfo, setDebugInfo] = useState<string[]>([])

  // Get scan type from URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const type = params.get('type') as 'basic' | 'comprehensive' | 'enterprise'
    if (type && ['basic', 'comprehensive', 'enterprise'].includes(type)) {
      setScanType(type)
    }
  }, [location.search])

  const addDebugInfo = (info: string) => {
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${info}`])
  }

  const validateUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url)
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
    } catch {
      return false
    }
  }

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!targetUrl.trim()) {
      toast.error('Please enter a website URL')
      return
    }

    if (!validateUrl(targetUrl)) {
      toast.error('Please enter a valid HTTP or HTTPS URL')
      return
    }

    setIsScanning(true)
    setScanResult(null)
    setDebugInfo([])
    addDebugInfo('Starting scan process...')
    
    try {
      // Try authenticated scan first
      addDebugInfo('Attempting authenticated scan...')
      const response = await apiService.startVulnerabilityScan(targetUrl)
      
      if (response.scan_id) {
        addDebugInfo(`Authenticated scan started, scan_id: ${response.scan_id}`)
        toast.success('Scan started! This may take a few minutes.')
        // Poll for results
        pollScanResults(response.scan_id)
      } else {
        throw new Error('No scan ID received')
      }
    } catch (error: any) {
      addDebugInfo(`Authenticated scan failed: ${error.message}`)
      console.error('Authenticated scan failed, trying demo scan...', error)
      
      // If authentication failed, try demo scan
      if (error.response?.status === 401 || error.response?.status === 403) {
        addDebugInfo('Authentication failed, trying demo scan...')
        try {
          addDebugInfo('Calling demo scan endpoint...')
          const demoResponse = await apiService.demoVulnerabilityScan(targetUrl)
          
          addDebugInfo(`Demo scan response received: ${JSON.stringify(demoResponse, null, 2)}`)
          
          if (demoResponse.success) {
            addDebugInfo('Demo scan successful, processing results...')
            
            // Transform findings to match expected format
            const findings = (demoResponse.findings || []).map((finding: any) => ({
              id: finding.id,
              title: finding.title,
              severity: finding.severity,
              description: finding.description,
              recommendation: finding.remediation || finding.recommendation,
              owasp_category: finding.owasp_category
            }))
            
            addDebugInfo(`Transformed ${findings.length} findings`)
            
            // Use demo results directly since it's immediate
            const scanResult = {
              scan_id: demoResponse.scan?.id || 'demo-scan',
              status: 'completed' as const,
              message: 'Demo scan completed (limited functionality)',
              security_score: demoResponse.scan?.security_score,
              findings: findings
            }
            
            addDebugInfo('Setting scan result and stopping scanning...')
            setScanResult(scanResult)
            setIsScanning(false)
            toast.success('Demo scan completed!')
          } else {
            throw new Error('Demo scan also failed: ' + (demoResponse.error || 'Unknown error'))
          }
        } catch (demoError: any) {
          addDebugInfo(`Demo scan also failed: ${demoError.message}`)
          console.error('Demo scan also failed:', demoError)
          
          let errorMessage = 'Failed to start scan. Please try again.'
          if (demoError.response?.data?.error) {
            errorMessage = demoError.response.data.error
          } else if (demoError.message) {
            errorMessage = demoError.message
          }
          
          toast.error(errorMessage)
          setIsScanning(false)
        }
      } else {
        // For other errors, show the original error
        let errorMessage = 'Failed to start scan. Please try again.'
        if (error.response?.data?.error) {
          errorMessage = error.response.data.error
        } else if (error.response?.status >= 500) {
          errorMessage = 'Server error. Please try again later.'
        } else if (error.message) {
          errorMessage = error.message
        }
        
        toast.error(errorMessage)
        setIsScanning(false)
      }
    }
  }

  const pollScanResults = async (scanId: string) => {
    const maxAttempts = 60 // 5 minutes with 5-second intervals
    let attempts = 0
    addDebugInfo(`Starting to poll for scan results: ${scanId}`)
    
    const poll = async () => {
      try {
        attempts++
        addDebugInfo(`Polling attempt ${attempts} for scan ${scanId}`)
        const result = await apiService.getScanResults(scanId)
        addDebugInfo(`Poll result: ${JSON.stringify(result, null, 2)}`)
        
        if (result.status === 'completed') {
          addDebugInfo('Scan completed successfully!')
          setScanResult(result)
          setIsScanning(false)
          toast.success('Scan completed successfully!')
        } else if (result.status === 'failed') {
          addDebugInfo(`Scan failed: ${result.message}`)
          setScanResult(result)
          setIsScanning(false)
          toast.error(result.message || 'Scan failed')
        } else if (attempts >= maxAttempts) {
          addDebugInfo('Scan timeout after maximum attempts')
          setIsScanning(false)
          toast.error('Scan timeout. Please try again.')
        } else {
          addDebugInfo(`Scan still ${result.status}, continuing polling...`)
          // Continue polling
          setTimeout(poll, 5000)
        }
      } catch (error: any) {
        addDebugInfo(`Poll error on attempt ${attempts}: ${error.message}`)
        console.error(`Poll error on attempt ${attempts}:`, error)
        
        if (attempts >= maxAttempts) {
          setIsScanning(false)
          toast.error('Scan timeout. Please try again.')
        } else {
          setTimeout(poll, 5000)
        }
      }
    }
    
    poll()
  }

  const getSeverityColor = (severity: string): string => {
    switch (severity.toLowerCase()) {
      case 'high':
      case 'critical':
        return 'text-red-600 bg-red-100'
      case 'medium':
        return 'text-yellow-600 bg-yellow-100'
      case 'low':
        return 'text-blue-600 bg-blue-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getSecurityScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    if (score >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  const getSecurityScoreBg = (score: number): string => {
    if (score >= 80) return 'bg-green-100'
    if (score >= 60) return 'bg-yellow-100'
    if (score >= 40) return 'bg-orange-100'
    return 'bg-red-100'
  }

  const scanTypes = [
    {
      id: 'basic',
      title: 'Basic Security Scan',
      description: 'Quick scan for common vulnerabilities',
      icon: <Shield className="w-6 h-6" />,
      duration: '2-3 minutes',
      color: 'blue'
    },
    {
      id: 'comprehensive',
      title: 'Comprehensive Vulnerability Scan',
      description: 'In-depth OWASP Top 10 analysis',
      icon: <Search className="w-6 h-6" />,
      duration: '5-8 minutes',
      color: 'purple'
    },
    {
      id: 'enterprise',
      title: 'Enterprise Security Audit',
      description: 'Complete security assessment',
      icon: <Globe className="w-6 h-6" />,
      duration: '10-15 minutes',
      color: 'indigo'
    }
  ]

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Vulnerability Scanner</h1>
          </div>
          <p className="text-gray-600">
            Enter a website URL to perform a comprehensive security scan and identify potential vulnerabilities.
          </p>
        </div>

        {/* Debug Info */}
        {debugInfo.length > 0 && (
          <div className="mb-6 bg-gray-100 border border-gray-300 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Debug Information:</h3>
            <div className="text-xs text-gray-600 font-mono max-h-40 overflow-y-auto">
              {debugInfo.map((info, index) => (
                <div key={index}>{info}</div>
              ))}
            </div>
          </div>
        )}

        {/* Scan Type Selector */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Scan Type</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {scanTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setScanType(type.id as any)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                  scanType === type.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 bg-white'
                }`}
              >
                <div className="flex items-center mb-2">
                  <div className={`w-12 h-12 bg-${type.color}-100 rounded-lg flex items-center justify-center mr-3`}>
                    <div className={`text-${type.color}-600`}>{type.icon}</div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{type.title}</h3>
                    <p className="text-sm text-gray-600">{type.duration}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{type.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Scan Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <form onSubmit={handleScan} className="space-y-6">
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                Website URL
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Globe className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="url"
                  name="url"
                  type="url"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 bg-white text-gray-900"
                  placeholder="https://example.com"
                  required
                  disabled={isScanning}
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Enter a valid HTTP or HTTPS URL to scan
              </p>
            </div>

            <button
              type="submit"
              disabled={isScanning}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
            >
              {isScanning ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 mr-2" />
                  Start Security Scan
                </>
              )}
            </button>
          </form>
        </div>

        {/* Scan Results */}
        {scanResult && (
          <div className="bg-white/5 rounded-xl shadow-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Scan Results</h2>
              <div className="flex items-center space-x-4">
                {scanResult.status === 'completed' && scanResult.security_score && (
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getSecurityScoreBg(scanResult.security_score)} ${getSecurityScoreColor(scanResult.security_score)}`}>
                    Security Score: {Math.round(scanResult.security_score)}/100
                  </div>
                )}
                <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  scanResult.status === 'completed' ? 'bg-green-100 text-green-800' :
                  scanResult.status === 'failed' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {scanResult.status === 'completed' && <CheckCircle className="w-4 h-4 mr-1" />}
                  {scanResult.status === 'failed' && <XCircle className="w-4 h-4 mr-1" />}
                  {scanResult.status === 'running' && <Clock className="w-4 h-4 mr-1" />}
                  {scanResult.status}
                </div>
              </div>
            </div>

            {scanResult.message && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800">{scanResult.message}</p>
              </div>
            )}

            {scanResult.findings && scanResult.findings.length > 0 && (
                <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">Security Findings</h3>
                {scanResult.findings.map((finding, index) => (
                    <div key={index} className="border border-white/10 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-white">{finding.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(finding.severity)}`}>
                        {finding.severity}
                      </span>
                    </div>
                      <p className="text-white/70 text-sm mb-3">{finding.description}</p>
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-sm font-medium text-white mb-1">Recommendation:</p>
                      <p className="text-sm text-white/70">{finding.recommendation}</p>
                    </div>
                    {finding.owasp_category && (
                      <div className="mt-2">
                        <span className="text-xs text-gray-500">OWASP: {finding.owasp_category}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {scanResult.findings && scanResult.findings.length === 0 && scanResult.status === 'completed' && (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No vulnerabilities found!</h3>
                <p className="text-gray-600">Your website appears to be secure based on our scan.</p>
              </div>
            )}

            <div className="mt-6 flex justify-between">
              <button
                onClick={() => {
                  setScanResult(null)
                  setTargetUrl('')
                  setDebugInfo([])
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Scan Another Site
              </button>
              {scanResult.scan_id && (
                <Link
                  to={`/results/${scanResult.scan_id}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  View Detailed Report
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Security Notice */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-blue-900 mb-2">Security Notice</h3>
              <p className="text-sm text-blue-800">
                Our vulnerability scanner performs safe, read-only tests on your website. We do not attempt to exploit vulnerabilities or cause any harm to your systems. The scan may take several minutes depending on the size and complexity of your website.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ScanPage