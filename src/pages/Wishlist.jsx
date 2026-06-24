import { useWishlistStore } from '../store/useWishlistStore'
import { useCartStore } from '../store/useCartStore'
import { Heart, ShoppingBag, Trash2, ArrowLeft, Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

const WishlistPage = () => {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlistStore()
  const { addToCart } = useCartStore()
  const navigate = useNavigate()
  const [addingToCart, setAddingToCart] = useState(null)
  const [refresh, setRefresh] = useState(0) // Force refresh

  // Force re-render when component mounts
  useEffect(() => {
    console.log('WishlistPage mounted')
    console.log('Current wishlist:', wishlist)
    console.log('Wishlist length:', wishlist.length)
    
    // Check localStorage directly
    const stored = localStorage.getItem('wishlist-storage')
    console.log('Raw localStorage:', stored)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        console.log('Parsed localStorage:', parsed)
      } catch (e) {
        console.error('Error parsing localStorage:', e)
      }
    }
    
    setRefresh(prev => prev + 1)
  }, [])

  // Listen for storage changes (in case of multiple tabs)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'wishlist-storage') {
        console.log('Storage changed, refreshing...')
        setRefresh(prev => prev + 1)
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const handleAddToCart = async (product, e) => {
    e.stopPropagation()
    setAddingToCart(product._id?.toString())
    try {
      await addToCart({
        _id: product._id,
        quantity: 1,
        size: 'M',
        color: 'Black'
      })
      setTimeout(() => setAddingToCart(null), 1000)
    } catch (error) {
      console.error('Add to cart failed:', error)
      setAddingToCart(null)
    }
  }

  const handleRemoveFromWishlist = (productId, e) => {
    e.stopPropagation()
    removeFromWishlist(productId)
    // Force refresh after removal
    setTimeout(() => setRefresh(prev => prev + 1), 100)
  }

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`)
  }

  const handleClearWishlist = () => {
    if (window.confirm('Are you sure you want to clear your wishlist?')) {
      clearWishlist()
      setRefresh(prev => prev + 1)
    }
  }

  const getDiscountPrice = (product) => {
    const discountPercent = product.discount || 0
    return product.price - (product.price * discountPercent / 100)
  }

  // Debug display
  console.log('Rendering WishlistPage with wishlist:', wishlist)

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-linear-to-br from-purple-50 via-white to-pink-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-white/60 rounded-xl transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Heart className="w-6 h-6 fill-red-500 text-red-500" />
              My Wishlist
            </h1>
          </div>

         

          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-linear-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center">
                <Heart className="w-12 h-12 text-red-400" />
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Save your favorite items here and shop them later!
            </p>
            <button
              onClick={() => navigate('/products')}
              className="inline-flex items-center gap-2 bg-linear-to-r from-purple-600 to-purple-700 text-white px-8 py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-lg shadow-purple-200 hover:shadow-xl"
            >
              <ShoppingBag className="w-5 h-5" />
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 via-white to-pink-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-white/60 rounded-xl transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Heart className="w-6 h-6 fill-red-500 text-red-500" />
              My Wishlist
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({wishlist.length} {wishlist.length === 1 ? 'item' : 'items'})
              </span>
            </h1>
          </div>
          
          <button
            onClick={handleClearWishlist}
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all duration-300"
          >
            <Trash2 className="w-4 h-4" />
            Clear Wishlist
          </button>
        </div>


        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map((product) => {
            const discountPercent = product.discount || 0
            const discountPrice = getDiscountPrice(product)
            const savings = product.price - discountPrice
            const productId = product._id?.toString() || product.id?.toString()

            return (
              <div
                key={productId}
                onClick={() => handleProductClick(productId)}
                className="group relative bg-white rounded-2xl border border-gray-100 hover:border-purple-100 transition-all duration-300 hover:shadow-xl hover:shadow-purple-100/50 overflow-hidden cursor-pointer"
              >
                <div className="relative h-48 bg-linear-to-br from-purple-50 via-white to-pink-50 overflow-hidden">
                  <img
                    src={product.images?.[0] || '/api/placeholder/400/400'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 mix-blend-multiply"
                    onError={(e) => {
                      e.target.src = '/api/placeholder/400/400'
                    }}
                  />

                  {discountPercent > 0 && (
                    <div className="absolute top-2 left-2 bg-linear-to-r from-orange-500 to-pink-500 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg z-10">
                      {discountPercent}% OFF
                    </div>
                  )}

                  <button
                    onClick={(e) => handleRemoveFromWishlist(productId, e)}
                    className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg flex items-center justify-center hover:bg-white transition-all duration-300 z-20 group/remove"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4 text-gray-600 group-hover/remove:text-red-500 group-hover/remove:scale-110 transition-all" />
                  </button>

                  <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-white/90 backdrop-blur-sm text-gray-900 px-2 py-1 rounded-lg text-xs font-semibold shadow-lg border border-white/50 z-10">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    {product.rating || 4.5}
                  </div>
                </div>

                <div className="p-3 space-y-2">
                  <h3 className="font-medium text-sm text-gray-900 line-clamp-1 group-hover:text-purple-600 transition-colors">
                    {product.name}
                  </h3>

                  <div className="space-y-1">
                    {discountPercent > 0 ? (
                      <>
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-bold text-gray-900">
                            ₹{discountPrice.toFixed(0)}
                          </span>
                          <span className="text-sm text-gray-400 line-through">
                            ₹{product.price}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                            Save ₹{savings.toFixed(0)}
                          </span>
                        </div>
                      </>
                    ) : (
                      <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
                    )}
                  </div>

                  <button
                    onClick={(e) => handleAddToCart(product, e)}
                    disabled={addingToCart === productId}
                    className="w-full bg-linear-to-r from-purple-600 to-purple-700 text-white py-2 px-3 rounded-lg text-xs font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-lg shadow-purple-200 hover:shadow-xl flex items-center justify-center gap-1 group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingBag className={`w-3.5 h-3.5 ${addingToCart === productId ? 'animate-bounce' : 'group-hover:rotate-12'} transition-transform`} />
                    {addingToCart === productId ? 'Adding...' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={() => navigate('/products')}
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  )
}

export default WishlistPage