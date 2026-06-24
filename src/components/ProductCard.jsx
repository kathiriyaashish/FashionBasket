import { useCartStore } from '../store/useCartStore'
import { useWishlistStore } from '../store/useWishlistStore' // You'll need to create this store
import { Star, ShoppingBag, Heart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

const ProductCard = ({ product }) => {
  const { addToCart } = useCartStore()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore()
  const navigate = useNavigate()
  const [isWishlisted, setIsWishlisted] = useState(isInWishlist(product._id))

  const handleAddToCart = async (e) => {
    e.stopPropagation() 
    try {
      await addToCart({
        _id: product._id,
        quantity: 1,
        size: 'M',
        color: 'Black'
      })
    } catch (error) {
      console.error('Add to cart failed:', error)
    }
  }

  const handleWishlistToggle = (e) => {
    e.stopPropagation() 
    if (isWishlisted) {
      removeFromWishlist(product._id)
    } else {
      addToWishlist(product)
    }
    setIsWishlisted(!isWishlisted)
  }

  const handleCardClick = () => {
    navigate(`/product/${product._id}`)
  }

  // ✅ Discount calculations
  const discountPercent = product.discount || 0
  const discountPrice = product.price - (product.price * discountPercent / 100)
  const savings = product.price - discountPrice

  return (
    <div 
      onClick={handleCardClick}
      className="group relative bg-white rounded-xl border border-gray-100 hover:border-purple-100 transition-all duration-300 hover:shadow-lg hover:shadow-purple-100/50 overflow-hidden cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative h-48 bg-linear-to-br from-purple-50 via-white to-pink-50 overflow-hidden">
        <img 
          src={product.images?.[0] || '/api/placeholder/400/400'} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 mix-blend-multiply"
        />

        {/* Discount Badge */}
        {discountPercent > 0 && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-linear-to-r from-orange-500 to-pink-500 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg shadow-orange-200/50 z-10">
            <span>{discountPercent}% OFF</span>
          </div>
        )}

        {/* Rating Badge */}
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/90 backdrop-blur-sm text-gray-900 px-2 py-1 rounded-lg text-xs font-semibold shadow-lg border border-white/50 z-10">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          {product.rating}
        </div>

        {/* Wishlist Button - Now positioned in top-right corner of image */}
        <button
          onClick={handleWishlistToggle}
          className="absolute bottom-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg flex items-center justify-center hover:bg-white transition-all duration-300 group z-20"
        >
          <Heart 
            className={`w-4 h-4 transition-all duration-300 ${
              isWishlisted 
                ? 'fill-red-500 text-red-500 scale-110' 
                : 'text-gray-600 group-hover:text-red-500 group-hover:scale-110'
            }`} 
          />
        </button>
      </div>
      
      {/* Content Section */}
      <div className="p-3 space-y-2">
        {/* Product Title */}
        <h3 className="font-medium text-sm text-gray-900 line-clamp-1 group-hover:text-purple-600 transition-colors">
          {product.name}
        </h3>
        
        {/* Price Section */}
        <div className="space-y-1">
          {discountPercent > 0 ? (
            <>
              {/* Price Row */}
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-gray-900">
                  ₹{discountPrice.toFixed(0)}
                </span>
                <span className="text-sm text-gray-400 line-through">
                  ₹{product.price}
                </span>
              </div>
              {/* Savings Badge */}
              <div className="flex items-center gap-1">
                <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                  Save ₹{savings.toFixed(0)}
                </span>
                <span className="text-[10px] text-gray-400">on MRP</span>
              </div>
            </>
          ) : (
            <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
          )}
          
          {/* Rating Stars */}
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star 
                key={i} 
                className={`w-3.5 h-3.5 ${
                  i < Math.floor(product.rating) 
                    ? 'fill-yellow-400 text-yellow-400' 
                    : 'text-gray-200'
                }`} 
              />
            ))}
          </div>
        </div>
        
        {/* Add to Cart Button */}
        <div className="pt-1">
          <button 
            onClick={handleAddToCart}
            className="w-full bg-linear-to-r from-purple-600 to-purple-700 text-white py-2 px-3 rounded-lg text-xs font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-lg shadow-purple-200 hover:shadow-xl hover:shadow-purple-300 flex items-center justify-center gap-1 group"
          >
            <ShoppingBag className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard