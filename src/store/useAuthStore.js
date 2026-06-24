import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../services/api'
import { toast } from 'react-hot-toast'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      sendOTP: async (mobile) => {
        set({ isLoading: true })
        try {
          const { data } = await api.post('/auth/send-otp', { mobile })

          // ✅ Test OTP Support (Backend test mode)
          if (data.testOtp) {
            toast.success(`🎉 Test OTP: ${data.testOtp}`)
            return data.testOtp
          }

          toast.success('✅ OTP sent successfully!')
          return data

        } catch (error) {
          console.log(error.response)
          toast.error(error.response?.data?.message || 'Failed to send OTP')
          throw error
        } finally {
          set({ isLoading: false })
        }
      },

      verifyOTP: async (mobile, otp) => {
        set({ isLoading: true })
        try {
          const { data } = await api.post('/auth/verify-otp', { mobile, otp })

          set({
            user: data.user,
            token: data.token
          })

          localStorage.setItem('token', data.token)

          // ✅ Role-Based Auto Redirect
          toast.success('🎉 Login successful!')

          if (data.user.role === 'admin') {
            setTimeout(() => {
              window.location.href = '/admin/dashboard'
            }, 1500)
          } else {
            setTimeout(() => {
              window.location.href = '/'
            }, 1500)
          }

          return data

        } catch (error) {
          toast.error(error.response?.data?.message || 'Invalid OTP')
          throw error
        } finally {
          set({ isLoading: false })
        }
      },

      getProfile: async () => {
        try {
          const { data } = await api.get('/auth/profile')
          set({ user: data.user })
          return data.user
        } catch (error) {
          set({ user: null, token: null })
          localStorage.removeItem('token')
          return null
        }
      },

      updateProfile: async (profileData) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/update-profile', profileData);
          set({ user: data.user });
          toast.success('Profile updated successfully!');
          return data;
        } catch (error) {
          toast.error(error.response?.data?.message || 'Update failed');
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: () => {
        set({ user: null, token: null })
        localStorage.removeItem('token')
        toast.success('Logged out successfully!')
        window.location.href = '/login'
      },

      // Add to existing useAuthStore.js
      getCategories: async () => {
        set({ isLoading: true })
        try {
          const { data } = await api.get('/categories')
          return data.categories
        } catch (error) {
          toast.error('Categories load failed')
          throw error
        } finally {
          set({ isLoading: false })
        }
      },

      createCategory: async (categoryData) => {
        set({ isLoading: true })
        try {
          const { data } = await api.post('/categories', categoryData)
          toast.success('✅ Category created!')
          return data.category
        } catch (error) {
          toast.error(error.response?.data?.message || 'Failed')
          throw error
        } finally {
          set({ isLoading: false })
        }
      },

      updateCategory: async (id, categoryData) => {
        set({ isLoading: true })
        try {
          const { data } = await api.put(`/categories/${id}`, categoryData)
          toast.success('✅ Category updated!')
          return data.category
        } catch (error) {
          toast.error(error.response?.data?.message || 'Failed')
          throw error
        } finally {
          set({ isLoading: false })
        }
      },

      deleteCategory: async (id) => {
        set({ isLoading: true })
        try {
          await api.delete(`/categories/${id}`)
          toast.success('✅ Category deleted!')
        } catch (error) {
          toast.error(error.response?.data?.message || 'Failed')
          throw error
        } finally {
          set({ isLoading: false })
        }
      },


      // ✅ FIXED USER ROUTES (Match authRoutes.js)
      getUsers: async () => {
        set({ isLoading: true })
        try {
          const { data } = await api.get('/auth/users')  // ✅ FIXED: /auth/users
          return data.users
        } catch (error) {
          toast.error('Users load failed')
          throw error
        } finally {
          set({ isLoading: false })
        }
      },

      createUser: async (userData) => {
        set({ isLoading: true })
        try {
          const { data } = await api.post('/auth/users', userData)  // ✅ /auth/users
          toast.success('✅ User created!')
          return data.user
        } catch (error) {
          toast.error(error.response?.data?.message || 'Failed')
          throw error
        } finally {
          set({ isLoading: false })
        }
      },

      updateUser: async (id, userData) => {
        set({ isLoading: true })
        try {
          const { data } = await api.put(`/auth/users/${id}`, userData)  // ✅ FIXED
          toast.success('✅ User updated!')
          return data.user
        } catch (error) {
          toast.error(error.response?.data?.message || 'Failed')
          throw error
        } finally {
          set({ isLoading: false })
        }
      },

      deleteUser: async (id) => {
        set({ isLoading: true })
        try {
          await api.delete(`/auth/users/${id}`)  // ✅ FIXED
          toast.success('✅ User deactivated!')
        } catch (error) {
          toast.error(error.response?.data?.message || 'Failed')
          throw error
        } finally {
          set({ isLoading: false })
        }
      },

      toggleUserStatus: async (id) => {
        set({ isLoading: true })
        try {
          const { data } = await api.patch(`/auth/users/${id}/status`)  // ✅ FIXED
          toast.success('✅ Status updated!')
          return data.user
        } catch (error) {
          toast.error(error.response?.data?.message || 'Failed')
          throw error
        } finally {
          set({ isLoading: false })
        }
      },


      // ✅ Check if user is admin
      isAdmin: () => {
        const { user } = get()
        return user?.role === 'admin'
      }
    }),

    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token }) // Only persist user/token
    }
  )
)
