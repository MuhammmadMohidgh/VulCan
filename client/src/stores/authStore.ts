import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  name: string
  email: string
  is_verified: boolean
  isVerified?: boolean
  role: string
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
  
  // Actions
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  logout: () => void
  
  // Computed
  isAuthenticated: boolean
  isVerified: boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      
      setUser: (user) => set((state) => {
        if (!user) {
          return {
            user: null,
            isAuthenticated: !!state.token && false,
            isVerified: false,
          }
        }
        const verified = (user as any)?.is_verified ?? (user as any)?.isVerified ?? false
        const normalizedUser = {
          ...user,
          // ensure both shapes exist for UI components
          is_verified: verified,
          isVerified: verified,
        } as typeof user & { is_verified: boolean; isVerified: boolean }
        return {
          user: normalizedUser,
          isAuthenticated: !!state.token && true,
          isVerified: verified,
        }
      }),
      setToken: (token) => set((state) => ({
        token,
        // update computed flags whenever we set a token
        isAuthenticated: !!token && !!state.user,
      })),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      
      logout: () => {
        set({ user: null, token: null, error: null, isAuthenticated: false, isVerified: false })
        localStorage.removeItem('auth-storage')
      },
      
      // reactive booleans updated via setUser/setToken
      isAuthenticated: false,
      isVerified: false,
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
)