import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      wishlist: [],
      
      addToWishlist: (product) => {
        console.log('Adding to wishlist - original product:', product)
        
        let productImages = product.images || []
        if (product.image && !productImages.length) {
          productImages = [product.image]
        }
        if (productImages.length === 0) {
          productImages = ['/api/placeholder/400/400']
        }
        
        const normalizedProduct = {
          _id: product._id || product.id,
          name: product.name,
          price: product.price,
          discount: product.discount || 0,
          rating: product.rating || 4.5,
          images: productImages, 
          description: product.description || '',
          category: product.category || null,
          image: product.image || productImages[0]
        }
        
        console.log('Normalized product:', normalizedProduct)
        
        set((state) => {
          const exists = state.wishlist.some(item => 
            item._id?.toString() === normalizedProduct._id?.toString()
          )
          
          if (!exists) {
            console.log('Adding to wishlist state')
            return { wishlist: [...state.wishlist, normalizedProduct] }
          }
          console.log('Product already exists')
          return state
        })
      },
      
      removeFromWishlist: (productId) => {
        console.log('Removing from wishlist:', productId)
        set((state) => ({
          wishlist: state.wishlist.filter(item => 
            item._id?.toString() !== productId?.toString()
          )
        }))
      },
      
      clearWishlist: () => set({ wishlist: [] }),
      
      isInWishlist: (productId) => {
        return get().wishlist.some(item => 
          item._id?.toString() === productId?.toString()
        )
      }
    }),
    {
      name: 'wishlist-storage',
    }
  )
)