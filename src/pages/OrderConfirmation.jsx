import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { CheckCircle, Package, MapPin, CreditCard, Clock, ArrowLeft, ShoppingBag } from "lucide-react";
import { toast } from "react-hot-toast";

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const { orderId, amount } = location.state || {};

  useEffect(() => {
    if (!orderId) {
      toast.error("No order found");
      navigate("/orders");
      return;
    }
    
    // Simulate loading
    setTimeout(() => {
      setOrder({
        id: orderId,
        amount: amount || 0,
        date: new Date().toLocaleDateString('en-IN'),
        status: "confirmed",
        paymentMethod: "card",
        shippingAddress: {
          street: "Prempara",
          city: "Junagadh", 
          state: "Gujarat",
          pincode: "390008",
          landmark: "Navrangpura"
        },
        items: [
          
        ]
      });
      setLoading(false);
    }, 1500);
  }, [orderId, amount, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-emerald-700">Confirming your order...</h2>
          <p className="text-emerald-600 mt-2">Finalizing payment details</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center p-8">
          <ShoppingBag className="w-24 h-24 text-gray-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">No Order Found</h2>
          <button
            onClick={() => navigate("/products")}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-2xl hover:shadow-2xl transition-all"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100">
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-emerald-200 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 hover:bg-emerald-50 rounded-full"
          >
            <ArrowLeft className="w-6 h-6 text-emerald-700" />
          </button>
          <h1 className="font-bold text-xl text-emerald-800">Order Confirmed</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="pt-20 lg:pt-8 max-w-6xl mx-auto px-4 lg:px-8 pb-12">
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <CheckCircle className="w-12 h-12" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-4">
            Order Confirmed!
          </h1>
          <p className="text-xl text-emerald-700 font-semibold">
            Thank you for your order, {user?.name || 'Het'}! 🎉
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Details Card */}
            <div className="bg-white rounded-3xl shadow-2xl border border-emerald-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Package className="w-8 h-8 text-emerald-500" />
                Order Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl">
                    <Clock className="w-5 h-5 text-emerald-500" />
                    <div>
                      <p className="text-sm text-emerald-700 font-medium">Order Date</p>
                      <p className="font-bold text-lg">{order.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl">
                    <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <span className="text-emerald-600 font-bold text-sm">#{order.id?.slice(-6)}</span>
                    </div>
                    <div>
                      <p className="text-sm text-emerald-700 font-medium">Order ID</p>
                      <p className="font-bold text-lg">{order.id}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl">
                    <div>
                      <p className="text-sm text-emerald-700 font-medium">Payment Method</p>
                      <p className="font-bold text-lg capitalize">{order.paymentMethod}</p>
                    </div>
                    <CreditCard className="w-10 h-10 text-emerald-500" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl">
                    <div>
                      <p className="text-sm text-blue-700 font-medium">Total Items</p>
                      <p className="font-bold text-xl text-blue-600">{totalItems}</p>
                    </div>
                    <Package className="w-10 h-10 text-blue-500" />
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-4 mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Order Items</h3>
                {order.items.map((item, index) => (
                  <div key={index} className="flex gap-4 p-6 bg-gray-50 rounded-2xl hover:shadow-md transition-all">
                    <img 
                      src={item.product.images?.[0] || "/api/placeholder/80/80"} 
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded-xl flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-lg text-gray-900 line-clamp-1 mb-1">
                        {item.product.name}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Qty: {item.quantity} × ₹{item.discountedPrice.toLocaleString()}
                      </p>
                      <p className="font-bold text-xl text-emerald-600">
                        ₹{(item.quantity * item.discountedPrice).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Shipping Address */}
              <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-blue-500" />
                  Shipping To
                </h3>
                <div className="space-y-1 text-gray-700">
                  <p>{order.shippingAddress.street}</p>
                  <p>{order.shippingAddress.landmark && `${order.shippingAddress.landmark}, `}{order.shippingAddress.city}</p>
                  <p>{order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Total Amount */}
            <div className="bg-gradient-to-br from-emerald-500 to-green-600 text-white p-8 rounded-3xl shadow-2xl sticky top-8">
              <div className="text-center">
                <p className="text-emerald-100 text-lg mb-2">Total Amount</p>
                <p className="text-3xl font-bold">₹{order.amount?.toLocaleString()}</p>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-white rounded-3xl shadow-xl border border-emerald-100 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">What happens next?</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-2xl">
                  <div className="w-8 h-8 bg-emerald-500 text-white rounded-xl flex items-center justify-center mt-1 font-bold text-sm flex-shrink-0">1</div>
                  <div>
                    <p className="font-semibold text-gray-900">Order Processing</p>
                    <p className="text-sm text-gray-600">We'll prepare your order within 24 hours</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-2xl">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-xl flex items-center justify-center mt-1 font-bold text-sm flex-shrink-0">2</div>
                  <div>
                    <p className="font-semibold text-gray-900">Shipping Update</p>
                    <p className="text-sm text-gray-600">You'll receive tracking details soon</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-2xl">
                  <div className="w-8 h-8 bg-purple-500 text-white rounded-xl flex items-center justify-center mt-1 font-bold text-sm flex-shrink-0">3</div>
                  <div>
                    <p className="font-semibold text-gray-900">Delivery</p>
                    <p className="text-sm text-gray-600">Estimated delivery: 3-5 business days</p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-4">
              <button
                onClick={() => navigate("/products")}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 px-6 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
              >
                <ShoppingBag className="w-5 h-5" />
                Continue Shopping
              </button>
            </div>
          </div>
        </div>

        {/* Security Footer */}
        <div className="mt-16 text-center p-8 bg-white/50 backdrop-blur-md rounded-3xl border border-emerald-200">
          <p className="text-lg text-emerald-800 font-semibold">
            🔒 Secure checkout • Razorpay verified • Money back guarantee
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
