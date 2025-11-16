import React, { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, ArrowLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { apiService } from '@/services'

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [resetToken, setResetToken] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast.error('Please enter your email address')
      return
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error('Please enter a valid email address')
      return
    }

    setIsLoading(true)
    
    try {
      await apiService.forgotPassword({ email })
      setIsSubmitted(true)
      toast.success('Password reset instructions have been sent to your email!')
    } catch (error: any) {
      if (error.response?.data?.error) {
        toast.error(error.response.data.error)
      } else {
        toast.error('Failed to send password reset email. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-800 rounded-full mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">Check Your Email</h1>
          <p className="text-secondary-600">We've sent password reset instructions to</p>
          <p className="text-secondary-900 font-medium mt-1">{email}</p>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8">
          <div className="text-center space-y-4">
            <p className="text-secondary-700">
              Follow the instructions in the email to reset your password. The reset link will expire in 1 hour for security purposes.
            </p>

            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <p className="text-sm text-primary-800">
                <strong>Didn't receive the email?</strong> Check your spam folder or wait a few minutes and try again.
              </p>
            </div>

            {/* OTP entry */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-secondary-700">Enter 6-digit code</label>
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
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, '')
                      const next = [...otp]
                      next[index] = v
                      setOtp(next)
                      if (v && index < 5) inputRefs.current[index + 1]?.focus()
                    }}
                    className="w-12 h-12 text-center text-xl font-semibold border-2 border-secondary-300 rounded-lg focus:border-primary-500 focus:outline-none"
                    disabled={isLoading}
                    autoComplete="one-time-code"
                  />
                ))}
              </div>
              <button
                onClick={async () => {
                  const code = otp.join('')
                  if (code.length !== 6) return
                  setIsLoading(true)
                  try {
                    const res = await apiService.verifyResetOtp({ email, otp: code })
                    if (res.token) {
                      setResetToken(res.token)
                      toast.success('Code verified. Please reset your password.')
                      navigate(`/auth/reset-password?email=${encodeURIComponent(email)}`, { state: { token: res.token, email } })
                    }
                  } catch (err: any) {
                    toast.error(err.response?.data?.error || 'Invalid or expired code')
                  } finally {
                    setIsLoading(false)
                  }
                }}
                className="w-full bg-primary-800 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700"
                disabled={isLoading}
              >
                Verify Code
              </button>
            </div>

            <div className="flex flex-col space-y-3">
              <button
                onClick={() => setIsSubmitted(false)}
                className="w-full bg-primary-800 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200"
              >
                Try Again
              </button>

              <Link
                to="/auth/login"
                className="inline-flex items-center justify-center text-secondary-600 hover:text-secondary-800 font-medium transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-800 rounded-full mb-4">
          <Mail className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-secondary-900 mb-2">Forgot Password?</h1>
        <p className="text-secondary-600">No worries! We'll send you reset instructions.</p>
      </div>

      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-2">Email address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-secondary-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-12 pr-3 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
                placeholder="Enter your email address"
                required
                disabled={isLoading}
                autoComplete="email"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary-800 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              'Send Reset Instructions'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/auth/login" className="inline-flex items-center text-secondary-600 hover:text-secondary-800 font-medium transition-colors duration-200">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Link>
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-secondary-500">For security reasons, reset links expire after 1 hour.</p>
      </div>
    </div>
  )
}

export default ForgotPasswordPage