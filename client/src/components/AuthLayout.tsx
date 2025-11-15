import React from 'react'
import { Link } from 'react-router-dom'
import { Shield, ArrowLeft } from 'lucide-react'

interface AuthLayoutProps {
  children: React.ReactNode
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="bg-primary-100 p-3 rounded-full">
              <Shield className="h-12 w-12 text-primary-600" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-secondary-900">
            Vulnerability Scanner
          </h2>
          <p className="mt-2 text-sm text-secondary-600">
            CyberSecurity Course Project
          </p>
        </div>

        {/* Back to home link */}
        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-primary-600 hover:text-primary-500 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-lg border border-secondary-200 p-8">
          {children}
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-secondary-500">
          <p>© 2024 CyberSecurity Course - Website Vulnerability Checker</p>
        </div>
      </div>
    </div>
  )
}

export default AuthLayout