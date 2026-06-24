import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../store/useCartStore";
import { useAuthStore } from "../store/useAuthStore";
import api from "../services/api";
import { toast } from "react-hot-toast";
import {
  ChevronLeft,
  MapPin,
  CreditCard,
  Truck,
  Package,
  ShoppingCart,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";

const Checkout = () => {
  const navigate = useNavigate();
  const { items: rawCartItems, getCart, clearCart } = useCartStore();
  const cartItems = rawCartItems || [];
  const { user } = useAuthStore();

  // ✅ NEW STATES for Razorpay
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [razorpayOrderId, setRazorpayOrderId] = useState('');

  const [orderData, setOrderData] = useState({
    address: {
      street: user?.address?.street || "",
      city: user?.address?.city || "",
      state: user?.address?.state || "",
      pincode: user?.address?.pincode || "",
      landmark: user?.address?.landmark || "",
    },
    paymentMethod: "razorpay", // ✅ Default to Razorpay
    cardDetails: { 
      name: "",
      cardNumber: "", 
      expiry: "", 
      cvv: "" 
    },
  });

  // ✅ FIXED: Proper GST calculation
  const subtotal = (cartItems || []).reduce(
    (sum, item) => sum + Number(item?.discountedPrice || 0) * Number(item?.quantity || 0),
    0
  );
  const gstAmount = Math.round(subtotal * 0.05); // 5% GST
  const totalAmountWithGst = subtotal + gstAmount;

  useEffect(() => {
    if (!user) {
      toast.error("Please login to checkout");
      navigate("/login");
      return;
    }
    fetchCart();
  }, [user, navigate]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      await getCart();
    } catch (error) {
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  // Card handlers
  const handleCardChange = useCallback((field, value) => {
    setOrderData((prev) => ({
      ...prev,
      cardDetails: { ...prev.cardDetails, [field]: value },
    }));
  }, []);

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').slice(0, 16);
    return v.match(/.{1,4}/g)?.join(' ') || v;
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\D/g, '').slice(0, 4);
    if (v.length >= 2) {
      return `${v.slice(0, 2)}/${v.slice(2, 4)}`;
    }
    return v;
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setOrderData({
      ...orderData,
      address: { ...orderData.address, [name]: value },
    });
  };

  const handlePaymentMethodChange = (method) => {
    setOrderData({ ...orderData, paymentMethod: method });
  };

  const validateAddress = () => {
    const { street, city, state, pincode } = orderData.address;
    if (!street.trim() || !city.trim() || !state.trim() || !pincode) {
      toast.error("Please fill all required address fields");
      return false;
    }
    if (pincode.toString().trim().length !== 6) {
      toast.error("Pincode must be 6 digits");
      return false;
    }
    return true;
  };

  const validateCard = () => {
    const { name, cardNumber, expiry, cvv } = orderData.cardDetails;
    if (!name.trim() || !cardNumber.replace(/\s/g, '').length || 
        !expiry || !cvv || cvv.length !== 3) {
      toast.error("Please complete all card details correctly");
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!validateAddress()) return;
      setStep(2);
    }
  };

  const handleBackStep = () => {
    setStep(1);
  };

const handleRazorpayPayment = async () => {
  if (!validateAddress()) {
    setStep(1);
    return;
  }

  setPaymentLoading(true);

  try {
    // ✅ DYNAMICALLY LOAD RAZORPAY
    const res = await loadRazorpayScript();
    if (!res) {
      toast.error('Razorpay failed to load! Check internet connection');
      return;
    }

    const { data } = await api.post('/payments/create', {
      shippingAddress: orderData.address,
        totalAmount: totalAmountWithGst  
    });

    if (!data.success) {
      throw new Error(data.message || 'Payment creation failed');
    }

    const options = {
      key: data.payment.key,
      amount: data.payment.amount * 100,
      currency: data.payment.currency,
      name: data.payment.name,
      order_id: data.payment.razorpayOrderId,
      handler: async (response) => {
        try {
          const verifyRes = await api.post('/payments/verify', {
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            shippingAddress: orderData.address,
            totalAmount: totalAmountWithGst,
            paymentMethod: response.method 
          });

          if (verifyRes.data.success) {
            toast.success('✅ Payment successful! Order confirmed!');
            clearCart();
            navigate("/order-confirmation", { 
              state: { 
                orderId: verifyRes.data.order.id,
                amount: totalAmountWithGst 
              } 
            });
          }
        } catch (verifyError) {
          toast.error('Payment verification failed!');
          console.error(verifyError);
        }
      },
      modal: {
        ondismiss: () => {
          toast.info('Payment cancelled');
        }
      },
      prefill: {
        name: user.name || '',
        email: user.email || '',
        contact: user.phone || ''
      },
      theme: { color: '#10b981' }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();

  } catch (error) {
    toast.error(error.response?.data?.message || 'Payment failed!');
    console.error('Payment error:', error);
  } finally {
    setPaymentLoading(false);
  }
};


// ✅ TOP par ye function add kar (Checkout.jsx ma)
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
    } else {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    }
  });
};

  // ✅ COD Flow (keep existing)
  const handleCODOrder = async () => {
    if (!validateAddress()) {
      setStep(1);
      return;
    }

    try {
      setPaymentLoading(true);
      const orderDataToSend = {
        items: cartItems.map(item => ({
          product: item.product._id || item.product,
          quantity: item.quantity,
          price: item.price,
          discountedPrice: item.discountedPrice,
          size: item.size,
          color: item.color
        })),
        shippingAddress: orderData.address,
        paymentMethod: 'cod',
        totalAmount: totalAmountWithGst,
        subtotal,
        gstAmount
      };

      const response = await api.post("/orders", orderDataToSend);
      toast.success("Order placed successfully! 🚚");
      getCart();
      navigate("/order-confirmation", {
        state: { orderId: response.data.orderId || response.data.order._id },
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Order failed!");
    } finally {
      setPaymentLoading(false);
    }
  };

  const handlePlaceOrder = () => {
    if (orderData.paymentMethod === 'razorpay') {
      handleRazorpayPayment();
    } else {
      handleCODOrder();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="max-w-4xl mx-auto p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-16 bg-white rounded-xl shadow-lg"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-32 bg-white rounded-2xl p-6"></div>
                <div className="h-32 bg-white rounded-2xl p-6"></div>
              </div>
              <div className="space-y-6">
                <div className="h-64 bg-white rounded-2xl p-6"></div>
                <div className="h-20 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col items-center justify-center p-8">
        <ShoppingCart className="w-24 h-24 text-gray-400 mb-6" />
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
        <p className="text-xl text-gray-600 mb-8 text-center max-w-md">
          Looks like you haven't added anything to your cart yet.
        </p>
        <button
          onClick={() => navigate("/products")}
          className="px-12 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex items-center gap-3"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full -ml-1">
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="font-bold text-xl">Checkout</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="pt-20 lg:pt-8 max-w-6xl mx-auto px-4 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-x-8">
          {/* LEFT: Address & Payment (2/3) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Step Indicator */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                step >= 1 ? "bg-orange-500 text-white shadow-md" : "bg-green-500 text-white shadow-md"
              }`}>
                1
              </div>
              <div className="w-24 h-px bg-orange-300" />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                step >= 2 ? "bg-orange-500 text-white shadow-md" : "bg-gray-300 text-white"
              }`}>
                2
              </div>
            </div>

            {/* STEP 1: Address */}
            <div className={step === 1 ? "block" : "hidden"}>
              {/* Your existing address form - unchanged */}
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <MapPin className="w-6 h-6 text-orange-500" />
                  <h2 className="text-2xl font-bold text-gray-900">Shipping Address</h2>
                </div>
                {/* Address inputs - same as before */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Street Address *</label>
                    <input
                      type="text" name="street" value={orderData.address.street}
                      onChange={handleAddressChange}
                      className="w-full p-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                      placeholder="House number, street name" required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Landmark (Optional)</label>
                    <input
                      type="text" name="landmark" value={orderData.address.landmark}
                      onChange={handleAddressChange}
                      className="w-full p-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                      placeholder="Near XYZ Mall"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                    <input
                      type="text" name="city" value={orderData.address.city}
                      onChange={handleAddressChange}
                      className="w-full p-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                    <input
                      type="text" name="state" value={orderData.address.state}
                      onChange={handleAddressChange}
                      className="w-full p-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pincode *</label>
                    <input
                      type="number" name="pincode" value={orderData.address.pincode}
                      onChange={handleAddressChange}
                      className="w-full p-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                      placeholder="400001" maxLength="6" required
                    />
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Package className="w-6 h-6 text-orange-500" />
                  Order Summary
                </h3>
                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item._id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <img
                        src={item.product.images?.[0] || "/api/placeholder/80/80"}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 line-clamp-1 mb-1">{item.product.name}</h4>
                        <p className="text-sm text-gray-600">₹{item.discountedPrice?.toLocaleString()} x {item.quantity}</p>
                        <span className="text-sm text-gray-500 line-through">₹{item.price?.toLocaleString()}</span>
                      </div>
                      <span className="font-bold text-lg text-gray-900 whitespace-nowrap">
                        ₹{(item.discountedPrice * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold text-gray-900 mb-2">
                    Total (incl. GST): ₹{totalAmountWithGst.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleNextStep}
                  disabled={cartItems.length === 0}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-4 px-8 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue to Payment
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* STEP 2: Payment */}
            <div className={step === 2 ? "block" : "hidden"}>
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <CreditCard className="w-6 h-6 text-orange-500" />
                  <h2 className="text-2xl font-bold text-gray-900">Payment Method</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {/* COD */}
                  <button
                    type="button"
                    onClick={() => handlePaymentMethodChange("cod")}
                    className={`p-6 border-2 rounded-2xl transition-all hover:shadow-xl group relative overflow-hidden ${
                      orderData.paymentMethod === "cod"
                        ? "border-orange-500 bg-orange-50 ring-2 ring-orange-500/30 shadow-md"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-lg">Cash on Delivery</span>
                      {orderData.paymentMethod === "cod" && <Truck className="w-6 h-6 text-orange-500" />}
                    </div>
                    <p className="text-sm text-gray-600">Pay when you receive your order</p>
                  </button>

                  {/* Razorpay */}
                  <button
                    type="button"
                    onClick={() => handlePaymentMethodChange("razorpay")}
                    className={`p-6 border-2 rounded-2xl transition-all hover:shadow-xl group relative overflow-hidden md:col-span-2 ${
                      orderData.paymentMethod === "razorpay"
                        ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/30 shadow-md"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="font-bold text-lg">💳 Razorpay (Recommended)</span>
                        <p className="text-sm text-gray-600 mt-1">Cards • UPI • Wallets • Netbanking</p>
                      </div>
                      {orderData.paymentMethod === "razorpay" && (
                        <CheckCircle className="w-6 h-6 text-emerald-500" />
                      )}
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Order Summary (1/3) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 sticky top-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Package className="w-6 h-6 text-orange-500" />
                Order Summary
              </h3>

              <div className="space-y-4 mb-6">
                {cartItems.slice(0, 3).map((item) => (
                  <div key={item._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <img
                      src={item.product.images?.[0] || "/api/placeholder/60/60"}
                      alt={item.product.name}
                      className="w-12 h-12 object-cover rounded-lg shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm text-gray-900 line-clamp-1">{item.product.name}</h4>
                      <p className="text-xs text-gray-600">₹{item.discountedPrice} x {item.quantity}</p>
                    </div>
                    <span className="font-bold text-sm whitespace-nowrap">
                      ₹{(item.discountedPrice * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
                {cartItems.length > 3 && (
                  <div className="text-center py-4 bg-gray-50 rounded-xl">
                    <span className="text-sm text-gray-600">+{cartItems.length - 3} more items</span>
                  </div>
                )}
              </div>

              <div className="space-y-3 mb-6 p-4 bg-blue-50 rounded-xl">
                <div className="flex justify-between text-sm text-blue-900">
                  <span>Subtotal ({cartItems.length} items):</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-blue-900">
                  <span>Shipping:</span>
                  <span className="font-medium text-green-600">FREE</span>
                </div>
                <div className="flex justify-between text-sm text-blue-900">
                  <span className="text-gray-600">GST (5%):</span>
                  <span className="font-semibold text-gray-600">+₹{gstAmount.toLocaleString()}</span>
                </div>
                <div className="h-px bg-blue-200" />
                <div className="flex justify-between text-xl font-bold text-gray-900">
                  <span>Total:</span>
                  <span>₹{totalAmountWithGst.toLocaleString()}</span>
                </div>
              </div>

              {step === 1 && (
                <button
                  onClick={handleNextStep}
                  disabled={cartItems.length === 0}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-4 px-6 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue to Payment
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <button
                    onClick={handleBackStep}
                    className="w-full border-2 border-gray-300 text-gray-700 py-4 px-6 rounded-2xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-300"
                  >
                    <ArrowLeft className="w-5 h-5 inline mr-2" />
                    Back to Address
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={cartItems.length === 0 || paymentLoading}
                    className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-4 px-6 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                  >
                    {paymentLoading ? (
                      <>
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5" />
                        {orderData.paymentMethod === 'cod' ? 'Place COD Order' : 'Pay Now Securely'}
                        <span className="text-sm font-normal ml-2">₹{totalAmountWithGst.toLocaleString()}</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Security */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-emerald-200">
              <div className="flex items-center gap-3 text-sm text-emerald-800">
                <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                </svg>
                <span>🔒 Secure checkout • Razorpay verified • Money back guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default Checkout;
