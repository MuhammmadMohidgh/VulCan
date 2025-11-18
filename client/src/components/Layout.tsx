import React, { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  Shield, 
  Home, 
  Scan, 
  BarChart3, 
  User, 
  Settings, 
  LogOut,
  Menu,
  X,
  Activity
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { toast } from 'sonner'

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/auth/login')
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'New Scan', href: '/scan', icon: Scan },
    { name: 'Results', href: '/results', icon: BarChart3 },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  const isActive = (path: string) => {
    if (path === '/results') {
      return location.pathname.startsWith('/results')
    }
    return location.pathname === path
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 text-white">
      {/* Sidebar for mobile */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white/5 backdrop-blur-lg shadow-xl border-r border-white/20">
          <div className="flex h-16 items-center justify-between px-6 border-b pl-2 border-secondary-200">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-white" />
              <span className="text-xl font-bold text-white">VulCan</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg hover:bg-secondary-100"
            >
              <X className="h-5 w-5 text-secondary-500" />
            </button>
          </div>
          
          <div className="flex flex-1 flex-col overflow-y-auto p-4">
            <nav className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`sidebar-item ${
                    isActive(item.href) ? 'sidebar-item-active' : 'text-white/80 hover:bg-white/10'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="border-t border-white/20 p-4">
            <button
              onClick={handleLogout}
              className="flex w-full items-center px-4 py-3 text-sm font-medium text-white rounded-lg hover:bg-white/10"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar for desktop */}
      <div className={`hidden lg:flex lg:flex-col ${collapsed ? 'lg:w-20' : 'lg:w-64'}`}>
        <div className="flex h-16 items-center justify-center pl-4 border-b border-white/20 bg-white/5 backdrop-blur-lg">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-white" />
            {!collapsed && <span className="text-xl font-bold text-white">VulCan</span>}
          </div>
          {/* collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto mr-2 p-1 rounded hover:bg-white/5"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <Menu className="h-5 w-5 text-white" /> : <X className="h-5 w-5 text-white" />}
          </button>
        </div>
        
        <div className="flex flex-1 flex-col overflow-y-auto border-r border-white/20 bg-white/5 backdrop-blur-lg">
          <div className="p-4">
            <nav className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`sidebar-item ${
                    isActive(item.href) ? 'sidebar-item-active' : 'text-white/80 hover:bg-white/10'
                  } ${collapsed ? 'justify-center' : ''}`}
                  title={collapsed ? item.name : ''}
                >
                  <item.icon className={`h-5 w-5 ${!collapsed ? 'mr-3' : ''}`} />
                  {!collapsed && item.name}
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="mt-auto border-t border-white/20 p-4">
            <button
              onClick={handleLogout}
              className={`flex w-full items-center px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-600 hover:text-white ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? 'Logout' : ''}
            >
              <LogOut className={`h-5 w-5  ${!collapsed ? 'mr-3' : ''}`} />
              {!collapsed && 'Logout'}
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex h-16 items-center justify-between border-b border-white/20 bg-white/5 backdrop-blur-lg px-6 lg:px-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-secondary-100 lg:hidden"
            >
              <Menu className="h-5 w-5 text-secondary-500" />
            </button>
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-white" />
              <h1 className="text-lg font-semibold text-white">
                {location.pathname === '/dashboard' && 'Dashboard'}
                {location.pathname === '/scan' && 'New Vulnerability Scan'}
                {location.pathname.startsWith('/results') && 'Scan Results'}
                {location.pathname === '/profile' && 'Profile'}
                {location.pathname === '/settings' && 'Settings'}
              </h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden lg:block text-right">
              <p className="text-sm font-medium text-white">{user?.name}</p>
              <p className="text-xs text-white/70">{user?.email}</p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
              <span className="text-sm font-medium text-white">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout