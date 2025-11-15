import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Mail, Loader2, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { apiService } from '@/services'
import { useAuthStore } from '@/stores/authStore'

const VerifyEmailPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { setUser, setToken } = useAuthStore()
  
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([])

  // Get email from location state or localStorage
  useEffect(() => {
    const emailFromState = location.state?.email
    const emailFromStorage = localStorage.getItem('pendingEmail')
    const emailToUse = emailFromState || emailFromStorage
    
    if (emailToUse) {
      setEmail(emailToUse)
      if (emailFromState) {
        localStorage.setItem('pendingEmail', emailFromState)
      }
    } else {
      // No email found, redirect to signup
      navigate('/auth/signup')
    }
  }, [location.state, navigate])

  // Handle OTP input changes
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return // Only allow single character
    if (value && !/^[0-9]$/.test(value)) return // Only allow numbers
    
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    
    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  // Handle backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Move focus to previous input
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'Enter') {
      handleSubmit(e)
    }
  }

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text')
    const digits = pastedData.replace(/\D/g, '').slice(0, 6)
    
    if (digits.length === 6) {
      const newOtp = digits.split('')
      setOtp(newOtp)
      inputRefs.current[5]?.focus()
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const otpCode = otp.join('')
    if (otpCode.length !== 6) {
      toast.error('Please enter a complete 6-digit code')
      return
    }

    setIsLoading(true)
    
    try {
      const response = await apiService.verifyEmail({
        email,
        otp: otpCode
      })
      
      if (response.token) {
        toast.success('Email verified successfully!')
        
        // Update user in store
        setUser(response.user)
        setToken(response.token)
        
        // Clean up
        localStorage.removeItem('pendingEmail')
        
        // Navigate to dashboard
        navigate('/dashboard')
      }
    } catch (error: any) {
      if (error.response?.data?.error) {
        toast.error(error.response.data.error)
      } else {
        toast.error('Verification failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Handle resend verification
  const handleResend = async () => {
    if (countdown > 0) return
    
    setResendLoading(true)
    
    try {
      await apiService.resendVerification({ email })
      toast.success('Verification code sent to your email!')
      
      // Start countdown
      setCountdown(60)
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
      })
      }, 1000)
    } catch (error: any) {
      if (error.response?.data?.error) {
        toast.error(error.response.data.error)
      } else {
        toast.error('Failed to resend verification code.')
      }
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-md w-full mx-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Verify Your Email
          </h1>
          <p className="text-gray-600">
            We've sent a 6-digit verification code to
          </p>
          <p className="text-gray-900 font-medium mt-1">{email}</p>
        </div>

        {/* Verification Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 backdrop-blur-sm bg-white/95">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Enter verification code
              </label>
              <div className="flex justify-center space-x-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-12 h-12 text-center text-xl font-semibold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors duration-200"
                    disabled={isLoading}
                    autoComplete="one-time-code"
                  />
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || otp.join('').length !== 6}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Email'
              )}
            </button>
          </form>

          {/* Resend Code */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 mb-4">
              Didn't receive the code?{' '}
              <button
                onClick={handleResend}
                disabled={resendLoading || countdown > 0}
                className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {resendLoading ? (
                  'Sending...'
                ) : countdown > 0 ? (
                  `Resend in ${countdown}s`
                ) : (
                  'Resend Code'
                )}
              </button>
            </p>

            {/* Back to Signup */}
            <button
              onClick={() => navigate('/auth/signup')}
              className="inline-flex items-center text-gray-500 hover:text-gray-700 font-medium transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sign Up
            </button>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            This verification code expires in 10 minutes for security purposes.
          </p>
        </div>
      </div>
    </div>
  )
}

export default VerifyEmailPage