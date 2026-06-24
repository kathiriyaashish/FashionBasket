import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../services/api'
import { toast } from 'react-hot-toast'

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      totalAmount: 0,
      totalItems: 0,
      isLoading: false,

      // ✅ Auto-fetch cart on init
      initializeCart: async () => {
        const { getCart } = get()
        await getCart()
      },

      // ✅ FIXED: Update Quantity API call
      updateCartQuantity: async (itemId, newQuantity) => {
        set({ isLoading: true })
        try {
          // ✅ FIRST: Get current cart to check item details
          const { data: cartData } = await api.get('/cart')
          const item = cartData.cart.items.find(item => item._id === itemId)

          if (!item) {
            toast.error('Item not found in cart')
            return
          }

          // ✅ VALIDATE STOCK - Don't allow more than available
          if (item.stock !== undefined && newQuantity > item.stock) {
            toast.error(`Only ${item.stock} items available in stock`)
            return
          }

          if (newQuantity < 1) {
            toast.error('Minimum quantity is 1')
            return
          }

          // ✅ UPDATE API CALL - Backend handles stock check too
          await api.put(`/cart/${itemId}/quantity`, {
            quantity: newQuantity
          })

          // ✅ REFRESH cart from backend (includes updated totals)
          const { data } = await api.get('/cart')
          set({
            items: data.cart.items || [],
            totalAmount: data.cart.totalAmount || 0,
            totalItems: data.cart.totalItems || data.cart.items?.length || 0
          })

          toast.success('Cart updated!')

        } catch (error) {
          // ✅ Backend will also return stock errors
          const errorMsg = error.response?.data?.message || 'Failed to update quantity'
          toast.error(errorMsg)
          throw error
        } finally {
          set({ isLoading: false })
        }
      },


      addToCart: async (productData) => {
        set({ isLoading: true })
        try {
          const { data } = await api.post('/cart', {
            productId: productData._id,
            quantity: productData.quantity || 1,
            size: productData.size || 'M',
            color: productData.color || 'Black'
          })

          set({
            items: data.cart.items,
            totalAmount: data.cart.totalAmount,
            totalItems: data.cart.totalItems || data.cart.items.length
          })
          toast.success('Added to cart!')
        } catch (error) {
          toast.error(error.response?.data?.message || 'Failed to add to cart')
        } finally {
          set({ isLoading: false })
        }
      },

      getCart: async () => {
        set({ isLoading: true })
        try {
          const { data } = await api.get('/cart')
          set({
            items: data.cart.items || [],
            totalAmount: data.cart.totalAmount || 0,
            totalItems: data.cart.totalItems || data.cart.items?.length || 0
          })
        } catch (error) {
          console.error('Failed to fetch cart:', error)
          set({ items: [], totalAmount: 0, totalItems: 0 })
        } finally {
          set({ isLoading: false })
        }
      },

      removeFromCart: async (itemId) => {
        set({ isLoading: true })
        try {
          await api.delete(`/cart/${itemId}`)
          await get().getCart() // Refresh cart
          toast.success('Removed from cart!')
        } catch (error) {
          toast.error('Failed to remove item')
        } finally {
          set({ isLoading: false })
        }
      },

      // ✅ BONUS: Clear entire cart
      clearCart: async () => {
        set({ isLoading: true })
        try {
          await api.delete('/cart')
          set({ items: [], totalAmount: 0, totalItems: 0 })
          toast.success('Cart cleared!')
        } catch (error) {
          toast.error('Failed to clear cart')
        } finally {
          set({ isLoading: false })
        }
      }
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items, totalAmount: state.totalAmount })
    }
  )
)
