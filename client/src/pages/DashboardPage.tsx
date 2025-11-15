import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Shield, Globe, AlertTriangle, CheckCircle, Clock, TrendingUp, Zap, Search, Lock, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { apiService } from '@/services'
import { useAuthStore } from '@/stores'

interface ScanStats {
  total_scans: number
  high_risk_scans: number
  medium_risk_scans: number
  low_risk_scans: number
  average_score: number
  recent_scans: Array<{
    id: string
    target_url: string
    security_score: number
    status: string
    created_at: string
    findings_count: number
  }>
}

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<ScanStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      const statsData = await apiService.getScanStatistics()
      setStats(statsData)
    } catch (error: any) {
      toast.error('Failed to load dashboard data')
      console.error('Dashboard data load error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getSecurityColor = (score: number): string => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    if (score >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  // const getSecurityBg = (score: number): string => {
  //   if (score >= 80) return 'bg-green-100'
  //   if (score >= 60) return 'bg-yellow-100'
  //   if (score >= 40) return 'bg-orange-100'
  //   return 'bg-red-100'
  // }

  const getSecurityIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="w-5 h-5" />
    if (score >= 60) return <AlertTriangle className="w-5 h-5" />
    if (score >= 40) return <AlertTriangle className="w-5 h-5" />
    return <AlertTriangle className="w-5 h-5" />
  }

  const scanningCards = [
    {
      id: 'basic',
      title: 'Basic Security Scan',
      description: 'Quick scan for common vulnerabilities and security headers',
      icon: <Shield className="w-8 h-8" />,
      features: [
        'SSL/TLS Certificate Check',
        'Security Headers Analysis',
        'Basic Information Disclosure',
        'DNS Security Check'
      ],
      duration: '2-3 minutes',
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      id: 'comprehensive',
      title: 'Comprehensive Vulnerability Scan',
      description: 'In-depth analysis covering OWASP Top 10 vulnerabilities',
      icon: <Search className="w-8 h-8" />,
      features: [
        'OWASP Top 10 Detection',
        'Input Validation Testing',
        'Authentication Bypass Tests',
        'Injection Attack Detection',
        'XSS & CSRF Vulnerability Scan'
      ],
      duration: '5-8 minutes',
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      id: 'enterprise',
      title: 'Enterprise Security Audit',
      description: 'Complete security assessment with detailed reporting',
      icon: <Lock className="w-8 h-8" />,
      features: [
        'Advanced Threat Detection',
        'Business Logic Testing',
        'Rate Limiting Analysis',
        'API Security Assessment',
        'Configuration Review',
        'Compliance Checking'
      ],
      duration: '10-15 minutes',
      color: 'indigo',
      gradient: 'from-indigo-500 to-indigo-600'
    }
  ]

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section Skeleton */}
          <div className="mb-8 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-96"></div>
          </div>

          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Scanning Cards Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                <div className="w-16 h-16 bg-gray-200 rounded-full mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                <div className="space-y-2 mb-6">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-3 bg-gray-200 rounded w-full"></div>
                  ))}
                </div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600">
            Monitor your website security and run vulnerability scans to keep your applications safe.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Scans</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.total_scans || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Risk</p>
                <p className="text-2xl font-bold text-red-600">{stats?.high_risk_scans || 0}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.average_score ? Math.round(stats.average_score) : 0}/100
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Secure Sites</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats?.low_risk_scans || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Scans */}
        {stats?.recent_scans && stats.recent_scans.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Recent Scans</h2>
              <Link
                to="/scan"
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
              >
                View all scans →
              </Link>
            </div>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        URL
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Security Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Findings
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stats.recent_scans.slice(0, 5).map((scan) => (
                      <tr key={scan.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Globe className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm font-medium text-gray-900 truncate max-w-xs">
                              {scan.target_url}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`flex items-center ${getSecurityColor(scan.security_score)}`}>
                            {getSecurityIcon(scan.security_score)}
                            <span className="ml-2 text-sm font-medium">
                              {Math.round(scan.security_score)}/100
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {scan.findings_count} findings
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            scan.status === 'completed' ? 'bg-green-100 text-green-800' :
                            scan.status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {scan.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {new Date(scan.created_at).toLocaleDateString()}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Scanning Cards */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose Your Security Scan</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {scanningCards.map((card) => (
              <div
                key={card.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 overflow-hidden group"
              >
                {/* Header */}
                <div className={`bg-gradient-to-r ${card.gradient} p-6 text-white`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      {card.icon}
                    </div>
                    <div className="text-right">
                      <div className="flex items-center text-sm opacity-90">
                        <Clock className="w-4 h-4 mr-1" />
                        {card.duration}
                      </div>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{card.title}</h3>
                  <p className="text-white/90 text-sm">{card.description}</p>
                </div>

                {/* Features */}
                <div className="p-6">
                  <div className="space-y-3 mb-6">
                    {card.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action Button */}
                  <Link
                    to={`/scan?type=${card.id}`}
                    className={`w-full bg-gradient-to-r ${card.gradient} text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${card.color}-500 transition-all duration-200 flex items-center justify-center group-hover:shadow-md`}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Start {card.title}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            to="/scan"
            className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200 group transform hover:-translate-y-1"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Quick Security Check</h3>
                <p className="text-blue-100 text-sm">Start a basic vulnerability scan</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <Search className="w-6 h-6" />
              </div>
            </div>
          </Link>

          <Link
            to="/profile"
            className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white hover:from-purple-600 hover:to-purple-700 transition-all duration-200 group transform hover:-translate-y-1"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Account Settings</h3>
                <p className="text-purple-100 text-sm">Manage your profile and preferences</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <Eye className="w-6 h-6" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage