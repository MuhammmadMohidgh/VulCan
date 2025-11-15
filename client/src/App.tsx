// React is imported globally in Vite
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores'
import Layout from '@/components/Layout'
import AuthLayout from '@/components/AuthLayout'
import LoginPage from '@/pages/LoginPage'
import SignupPage from '@/pages/SignupPage'
import VerifyEmailPage from '@/pages/VerifyEmailPage'
import ForgotPasswordPage from '@/pages/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/ResetPasswordPage'
import DashboardPage from '@/pages/DashboardPage'
import ScanPage from '@/pages/ScanPage'
import ResultsPage from '@/pages/ResultsPage'
import ProfilePage from '@/pages/ProfilePage'
import SettingsPage from '@/pages/SettingsPage'
import NotFoundPage from '@/pages/NotFoundPage'

function App() {
  const { isAuthenticated, isVerified } = useAuthStore()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 font-inter">
      <Routes>
        {/* Public routes */}
        <Route 
          path="/auth/*" 
          element={
            !isAuthenticated ? (
              <AuthLayout>
                <Routes>
                  <Route path="login" element={<LoginPage />} />
                  <Route path="signup" element={<SignupPage />} />
                  <Route path="verify-email" element={<VerifyEmailPage />} />
                  <Route path="forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="reset-password" element={<ResetPasswordPage />} />
                  <Route path="*" element={<Navigate to="/auth/login" replace />} />
                </Routes>
              </AuthLayout>
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />

        {/* Protected routes */}
        <Route element={isAuthenticated ? (isVerified ? <Layout /> : <Navigate to="/auth/verify-email" replace />) : <Navigate to="/auth/login" replace />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="scan" element={<ScanPage />} />
          <Route path="results/:scanId" element={<ResultsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App