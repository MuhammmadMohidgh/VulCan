import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Lock, Eye, EyeOff, ArrowLeft, Loader2, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { apiService } from '@/services'
import { useAuthStore } from '@/stores'

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { setUser, setToken } = useAuthStore()
  
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<'verify' | 'reset'>('verify')
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([])

  // Get email from location state or query params
  useEffect(() => {
    const emailFromState = location.state?.email
    const emailFromParams = new URLSearchParams(location.search).get('email')
    const emailToUse = emailFromState || emailFromParams
    
    if (emailToUse) {
      setEmail(emailToUse)
    } else {
      // No email found, redirect to forgot password
      navigate('/auth/forgot-password')
    }
  }, [location.state, location.search, navigate])

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
    } else if (e.key === 'Enter' && step === 'verify') {
      handleVerifyOtp(e)
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

  // Validate password
  const validatePassword = (password: string): string[] => {
    const errors: string[] = []
    
    if (password.length < 6) {
      errors.push('at least 6 characters')
    }
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('lowercase letter')
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('uppercase letter')
    }
    if (!/(?=.*\d)/.test(password)) {
      errors.push('number')
    }
    
    return errors
  }

  // Handle OTP verification
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const otpCode = otp.join('')
    if (otpCode.length !== 6) {
      toast.error('Please enter a complete 6-digit code')
      return
    }

    setIsLoading(true)
    
    try {
      await apiService.verifyResetOtp({
        email,
        otp: otpCode
      })
      
      toast.success('Verification successful! Please enter your new password.')
      setStep('reset')
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

  // Handle password reset
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    
    const passwordErrors = validatePassword(newPassword)
    if (passwordErrors.length > 0) {
      setErrors({ newPassword: `Password must contain: ${passwordErrors.join(', ')}` })
      return
    }
    
    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' })
      return
    }

    setIsLoading(true)
    
    try {
      const otpCode = otp.join('')
      const response = await apiService.resetPassword({
        token: otpCode,
        new_password: newPassword
      })
      
      if (response.success) {
        toast.success('Password reset successful! You can now login with your new password.')
        
        // Auto-login user
        setUser(response.user)
        setToken(response.access_token)
        
        // Navigate to dashboard
        navigate('/dashboard')
      }
    } catch (error: any) {
      if (error.response?.data?.error) {
        toast.error(error.response.data.error)
      } else {
        toast.error('Password reset failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const passwordStrength = newPassword ? validatePassword(newPassword).length === 0 : null

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-md w-full mx-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {step === 'verify' ? 'Verify Reset Code' : 'Reset Password'}
          </h1>
          <p className="text-gray-600">
            {step === 'verify' 
              ? 'Enter the 6-digit code sent to your email'
              : 'Create a strong new password'
            }
          </p>
          <p className="text-gray-900 font-medium mt-1">{email}</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 backdrop-blur-sm bg-white/95">
          {step === 'verify' ? (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
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
                  'Verify Code'
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-6">
              {/* New Password */}
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                      errors.newPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter new password"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-sm text-red-600 mt-1">{errors.newPassword}</p>
                )}
                {passwordStrength === true && (
                  <p className="text-sm text-green-600 mt-1 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Strong password
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Must contain: uppercase, lowercase, number, and be at least 6 characters
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Confirm new password"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600 mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || !passwordStrength || newPassword !== confirmPassword}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          )}

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link
              to="/auth/login"
              className="inline-flex items-center text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Link>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            For security reasons, this reset link expires in 1 hour.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ResetPasswordPage