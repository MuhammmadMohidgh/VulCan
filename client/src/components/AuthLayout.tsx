import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

interface AuthLayoutProps {
  children: React.ReactNode
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-800 to-primary-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-8 left-0 right-0 flex justify-center">
        <span className="text-white text-3xl font-extrabold tracking-wide">VulCan.</span>
      </div>
      <div className="max-w-md w-full mt-24">
        <div className="bg-white/80 backdrop-blur-md rounded-lg text-black shadow-xl border border-white/20 p-8">
          {children}
        </div>
      </div>
    </div>
  )
}

export default AuthLayout