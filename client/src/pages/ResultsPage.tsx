import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  Shield, 
  Globe, 
  AlertTriangle, 
  CheckCircle, 
  // Clock, 
  ArrowLeft, 
  Download, 
  RefreshCw,
  Trash2,
  ExternalLink,
  Info,
  AlertCircle as AlertIcon
} from 'lucide-react'
import { toast } from 'sonner'
import { apiService } from '@/services'

interface ScanDetails {
  id: string
  target_url: string
  status: string
  security_score: number
  created_at: string
  updated_at: string
  findings: Array<{
    id: string
    title: string
    severity: string
    description: string
    recommendation: string
    owasp_category: string
    technical_details: string
    cvss_score: number
  }>
}

const ResultsPage: React.FC = () => {
  const { scanId } = useParams<{ scanId: string }>()
  const navigate = useNavigate()
  const [scan, setScan] = useState<ScanDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (scanId) {
      loadScanResults()
    }
  }, [scanId])

  const loadScanResults = async () => {
    try {
      setIsLoading(true)
      const result = await apiService.getScanResults(scanId!)
      setScan(result)
    } catch (error: any) {
      toast.error('Failed to load scan results')
      console.error('Scan results load error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this scan? This action cannot be undone.')) {
      return
    }

    try {
      setIsDeleting(true)
      await apiService.deleteScan(scanId!)
      toast.success('Scan deleted successfully')
      navigate('/dashboard')
    } catch (error: any) {
      toast.error('Failed to delete scan')
      console.error('Delete scan error:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleRescan = () => {
    if (scan) {
      navigate(`/scan?url=${encodeURIComponent(scan.target_url)}`)
    }
  }

  const getSeverityColor = (severity: string): string => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'text-red-700 bg-red-100 border-red-200'
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-red-600" />
      case 'medium':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      case 'low':
        return <Info className="w-5 h-5 text-blue-600" />
      default:
        return <Info className="w-5 h-5 text-gray-600" />
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

  const getOverallStatus = (score: number): string => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Poor'
  }

  const exportResults = () => {
    if (!scan) return

    const report = {
      scan_id: scan.id,
      target_url: scan.target_url,
      scan_date: scan.created_at,
      security_score: scan.security_score,
      overall_status: getOverallStatus(scan.security_score),
      total_findings: scan.findings.length,
      findings: scan.findings.map(finding => ({
        title: finding.title,
        severity: finding.severity,
        description: finding.description,
        recommendation: finding.recommendation,
        owasp_category: finding.owasp_category,
        cvss_score: finding.cvss_score
      }))
    }

    const dataStr = JSON.stringify(report, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `vulnerability-scan-${scan.id}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header Skeleton */}
          <div className="mb-8 animate-pulse">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-gray-200 rounded mr-4"></div>
              <div className="h-8 bg-gray-200 rounded w-64"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-96"></div>
          </div>

          {/* Results Grid Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="h-4 bg-gray-200 rounded w-48"></div>
                        <div className="w-16 h-6 bg-gray-200 rounded"></div>
                      </div>
                      <div className="h-3 bg-gray-200 rounded w-full mb-3"></div>
                      <div className="h-8 bg-gray-100 rounded w-full"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-24 mb-4"></div>
                <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-16 mx-auto"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!scan) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto text-center">
          <AlertIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Scan Not Found</h2>
          <p className="text-gray-600 mb-6">The scan you're looking for doesn't exist or you don't have access to it.</p>
          <Link
            to="/dashboard"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="mr-4 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Vulnerability Scan Results</h1>
                <p className="text-gray-600 mt-1">
                  Security assessment for <span className="font-medium">{scan.target_url}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={exportResults}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
              <button
                onClick={handleRescan}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Rescan
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors duration-200"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>

          {/* Scan Info */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Scan Date</p>
                <p className="text-gray-900">{new Date(scan.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Status</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  scan.status === 'completed' ? 'bg-green-100 text-green-800' :
                  scan.status === 'failed' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {scan.status}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Findings</p>
                <p className="text-gray-900">{scan.findings.length}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Security Score</p>
                <div className={`text-2xl font-bold ${getSecurityScoreColor(scan.security_score)}`}>
                  {Math.round(scan.security_score)}/100
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Findings List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Security Score Overview */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Security Score Overview</h2>
              <div className="flex items-center justify-center">
                <div className={`relative w-48 h-48 rounded-full ${getSecurityScoreBg(scan.security_score)} flex items-center justify-center`}>
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${getSecurityScoreColor(scan.security_score)}`}>
                      {Math.round(scan.security_score)}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">out of 100</div>
                    <div className={`text-sm font-medium mt-2 ${getSecurityScoreColor(scan.security_score)}`}>
                      {getOverallStatus(scan.security_score)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {scan.findings.filter(f => f.severity === 'high' || f.severity === 'critical').length}
                  </div>
                  <div className="text-xs text-gray-600">Critical</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {scan.findings.filter(f => f.severity === 'medium').length}
                  </div>
                  <div className="text-xs text-gray-600">Medium</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {scan.findings.filter(f => f.severity === 'low').length}
                  </div>
                  <div className="text-xs text-gray-600">Low</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {scan.findings.filter(f => f.severity === 'info').length}
                  </div>
                  <div className="text-xs text-gray-600">Info</div>
                </div>
              </div>
            </div>

            {/* Detailed Findings */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Detailed Findings</h2>
              {scan.findings.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Vulnerabilities Found!</h3>
                  <p className="text-gray-600">Your website appears to be secure based on our comprehensive scan.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {scan.findings.map((finding, index) => (
                    <div key={index} className={`border rounded-lg p-4 ${getSeverityColor(finding.severity)}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start">
                          {getSeverityIcon(finding.severity)}
                          <div className="ml-3">
                            <h3 className="font-medium text-gray-900">{finding.title}</h3>
                            {finding.owasp_category && (
                              <p className="text-xs text-gray-600 mt-1">OWASP: {finding.owasp_category}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(finding.severity)}`}>
                            {finding.severity.toUpperCase()}
                          </span>
                          {finding.cvss_score > 0 && (
                            <div className="text-sm font-medium text-gray-900 mt-1">
                              CVSS: {finding.cvss_score}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-gray-700 text-sm mb-3">{finding.description}</p>
                      
                      {finding.technical_details && (
                        <div className="bg-white rounded-lg p-3 mb-3">
                          <p className="text-xs font-medium text-gray-900 mb-1">Technical Details:</p>
                          <p className="text-xs text-gray-600 font-mono">{finding.technical_details}</p>
                        </div>
                      )}
                      
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-xs font-medium text-gray-900 mb-1">Recommendation:</p>
                        <p className="text-xs text-gray-700">{finding.recommendation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Target Information */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Target Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-600">URL</p>
                  <div className="flex items-center mt-1">
                    <Globe className="w-4 h-4 text-gray-400 mr-2" />
                    <a 
                      href={scan.target_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 truncate"
                    >
                      {scan.target_url}
                    </a>
                    <ExternalLink className="w-3 h-3 text-gray-400 ml-1" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Scan Date</p>
                  <p className="text-sm text-gray-900 mt-1">
                    {new Date(scan.created_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Duration</p>
                  <p className="text-sm text-gray-900 mt-1">
                    {Math.round((new Date(scan.updated_at).getTime() - new Date(scan.created_at).getTime()) / 1000)} seconds
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={handleRescan}
                  className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Rescan Site
                </button>
                <button
                  onClick={exportResults}
                  className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </button>
                <Link
                  to="/scan"
                  className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  New Scan
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResultsPage