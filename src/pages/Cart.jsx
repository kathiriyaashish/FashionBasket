import { useState } from 'react'
import { useCartStore } from '../store/useCartStore'
import { toast } from 'react-hot-toast'
import { Trash2, Minus, Plus, ShoppingCart, CreditCard, Truck, ChevronLeft } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

const Cart = () => {
  const navigate = useNavigate()
  const { items, totalItems, totalAmount, removeFromCart, updateCartQuantity } = useCartStore()

  const updateQuantity = async (itemId, newQty) => {
    const item = items.find(i => i._id === itemId)
    if (!item) return

    if (newQty < 1) {
      toast.error('Minimum quantity is 1')
      return
    }

    if (item.stock !== undefined && newQty > item.stock) {
      toast.error(`Only ${item.stock} items available`)
      return
    }

    try {
      await updateCartQuantity(itemId, newQty)
    } catch (error) {
      console.error('Quantity update failed:', error)
    }
  }

  const getDisplayPrice = (item) => {
    const originalPrice = Number(item.price) || 0
    if (item.discount && item.discount > 0) {
      return item.discountedPrice;
    }
    return originalPrice
  }

  const getItemTotal = (item) => {
    const price = getDisplayPrice(item)
    return price * item.quantity
  }

  const handleCheckout = () => navigate('/checkout')
  const handleContinueShopping = () => navigate('/products')

  if (totalItems === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-xl p-5 flex items-center justify-center">
            <ShoppingCart className="w-10 h-10 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Your cart is empty</h1>
          <p className="text-base text-gray-600 mb-6">Add items to your cart to continue shopping</p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors text-sm"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="lg:hidden sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-gray-100">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="font-bold text-lg">Cart ({totalItems})</h1>
          <div className="w-8" />
        </div>
      </div>

      <div className="max-w-full mx-auto px-4 py-6 lg:py-8 lg:px-4">
        <div className="lg:grid lg:grid-cols-3 lg:gap-6">


          <div className="lg:col-span-2 space-y-3 mb-6 lg:mb-0">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 hidden lg:block">
              Shopping Cart
            </h1>

            {items.map((item) => {
              const displayPrice = getDisplayPrice(item)
              const itemTotal = getItemTotal(item)

              return (
                <div key={item._id} className="bg-white border border-gray-200 rounded-lg p-4 lg:p-5 hover:shadow-sm transition-all">
                  <div className="flex items-start gap-3 lg:gap-4">


                    <Link to={`/product/${item.product._id}`} className="w-16 h-16 lg:w-20 lg:h-20 shrink-0">
                      <img
                        src={item.product.images?.[0] || '/api/placeholder/100/100'}
                        alt={item.product.name}
                        className="w-full h-full object-cover rounded-md"
                      />
                    </Link>


                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/product/${item.product}`}
                        className="text-base lg:text-lg font-semibold text-gray-900 hover:text-orange-600 line-clamp-2 mb-1.5 block"
                        title={item.name}
                      >
                        {item.name}
                      </Link>


                      <div className="flex flex-wrap gap-1.5 mb-3 text-xs lg:text-sm text-gray-600">
                        {item.size && <span className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">Size: {item.size}</span>}
                        {item.color && <span className="px-1.5 py-0.5 bg-gray-100 rounded capitalize text-xs">Color: {item.color}</span>}
                      </div>

                      <div className="flex items-baseline gap-1.5 mb-3">
                        <span className="text-xl lg:text-2xl font-bold text-gray-900">
                          ₹{displayPrice.toLocaleString()}
                        </span>
                        {item.discountedPrice && item.price && displayPrice < item.price && (
                          <span className="text-lg text-gray-500 line-through">
                            ₹{item.price.toLocaleString()}
                          </span>
                        )}
                        {item.discount && item.discount > 0 && (
                          <span className="px-1.5 py-0.5 bg-orange-100 text-orange-800 text-xs font-bold rounded">
                            {item.discount}% OFF
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg p-0.5">
                          <button
                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="w-9 h-9 flex items-center justify-center rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Minus className="w-4 h-4 text-gray-600" />
                          </button>

                          <span className="w-12 px-2 py-2 text-center font-bold text-base bg-white border-l border-r border-gray-200 rounded">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                            disabled={item.stock && item.quantity >= item.stock}
                            className="w-9 h-9 flex items-center justify-center rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Plus className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>

                        <button
                          onClick={() => {
                            removeFromCart(item._id)
                            toast.success('Item removed')
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg font-medium text-xs transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Remove
                        </button>

                        {item.stock && item.quantity >= item.stock && (
                          <div className="ml-auto flex items-center gap-1 text-xs text-orange-600 font-medium bg-orange-50 px-2 py-0.5 rounded-full">
                            <div className="w-1 h-1 bg-orange-500 rounded-full animate-pulse" />
                            Only {item.stock} left
                          </div>
                        )}
                      </div>

                      <div className="lg:hidden mt-2 pt-2 border-t border-gray-100 flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-600">Subtotal</span>
                        <span className="text-lg font-bold text-gray-900">
                          ₹{itemTotal.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="hidden lg:block text-right min-w-25">
                      <div className="text-xl font-bold text-gray-900">
                        ₹{itemTotal.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg p-4 lg:p-6 sticky top-6 lg:top-20">
              <h2 className="text-lg lg:text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

              <div className="mb-4 pb-3 border-b border-gray-100">
                <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">Items ({totalItems})</div>
                {items.map((item, index) => (
                  <div key={item._id || index} className="flex justify-between items-center py-1 text-sm">
                    <span className="text-gray-900 truncate">{item.product?.name || item.name} <span className='text-gray-500'> x </span>  {item.quantity}</span>
                    <span className="font-semibold">₹{(item.discountedPrice * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
             
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm font-medium">
                  <span>Subtotal</span>
                  <span>₹{totalAmount.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center p-2 bg-green-50 border border-green-100 rounded-md text-sm">
                  <span className="flex items-center gap-1.5 text-xs text-green-800 font-medium">
                    <Truck className="w-3.5 h-3.5" />
                    Free shipping
                  </span>
                  <span className="font-bold text-green-800">₹0</span>
                </div>

                {items.some(item => item.discount > 0) && (
                  <div className="flex justify-between text-sm">
                    <span className="text-orange-600 font-medium">Discounts</span>
                    <span className="text-orange-600 font-medium">
                       -₹{((items || []).reduce((sum, item) => {
                        const originalPrice = item?.price || 0;
                        const discountedPrice = item?.discountedPrice || item?.price || 0;
                        const discountAmount = (originalPrice - discountedPrice) * (item?.quantity || 1);
                        return sum + discountAmount;
                      }, 0) || 0).toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-xs py-1.5 border-t border-gray-100">
                  <span className="text-gray-600">GST (5%)</span>
                  <span className="font-semibold">₹{Math.round(totalAmount * 0.05).toLocaleString()}</span>
                </div>

              </div>

              <div className="border-t border-gray-200 pt-4 mb-6"></div>

              <div className="flex justify-between items-baseline mb-4">
                <span className="text-sm text-gray-500 uppercase tracking-wide font-medium">Total Payable</span>
                <span className="text-xs text-gray-500">incl. GST | Free Shipping</span>
              </div>
             
              <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-3 mb-4">

                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Actual MRP</span>
                 <span>₹
                  {((items || []).reduce((sum, item) => {
                    const itemTotal = (item?.price || 0) * (item?.quantity || 1);
                    return sum + itemTotal ;
                  }, 0) || 0).toLocaleString()}
                </span>

                </div>
                {items.some(item => item.discount > 0) && (
                  <div className="flex justify-between text-xs text-orange-600">
                    <span>Discounted MRP</span>
                    <span>-₹{items.reduce((sum, item) => {
                      const discountAmount = (item.price - item.discountedPrice) * item.quantity;
                      return sum + discountAmount;
                    }, 0).toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-xs py-1.5 border-t border-gray-100">
                  <span className="text-gray-600">GST (5%)</span>
                  <span className="font-semibold text-gray-600">+₹{Math.round(totalAmount * 0.05).toLocaleString()}</span>
                </div>

                <div className="border-t border-orange-200 pt-1 mt-1" />
                <div className="flex justify-between items-center text-lg font-bold mt-2">
                  <span>Final Amount</span>
                  <span className="text-2xl text-orange-600">
                    ₹{(totalAmount * 1.05).toLocaleString()}
                  </span>
                </div>
              </div>

              

              
              <div className="space-y-2 mb-6">
                <button
                  onClick={handleCheckout}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-1.5 text-base shadow-sm hover:shadow-md"
                >
                  <CreditCard className="w-4 h-4" />
                  Pay ₹{(totalAmount * 1.05).toLocaleString()}
                </button>

                <button
                  onClick={handleContinueShopping}
                  className="w-full border border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-2.5 px-4 rounded-lg transition-colors hover:bg-gray-50 text-sm"
                >
                  Continue Shopping
                </button>
              </div>

              
              <div className="text-xs space-y-1 pt-4 border-t border-gray-100 text-center">
                <div className="flex items-center justify-center gap-1.5 text-green-700">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  <span>Free delivery tomorrow</span>
                </div>
                <div className="text-gray-600">30-day return policy</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Cart
