import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { 
  Package, User, MapPin, CreditCard, Truck, Clock, 
  ShoppingBag, Tag, Phone, Mail, Download, Edit3, 
  X
} from 'lucide-react';

const OrderDetails = () => {
  const { id } = useParams();
  const { user } = useAuthStore();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Fetch order details
  useEffect(() => {
    if (!id) return;
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/orders/${id}`);
      setOrder(response.data.order);
    } catch (error) {
      toast.error('Failed to fetch order details');
      console.error('Order fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update status
  const updateStatus = async (newStatus) => {
    try {
      setUpdating(true);
      await api.put(`/orders/${id}`, { status: newStatus });
      setOrder(prev => ({ ...prev, status: newStatus }));
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  // Assign delivery partner
  const [partnerForm, setPartnerForm] = useState({ name: '', id: '', phone: '', link: '' });
  const [showPartnerModal, setShowPartnerModal] = useState(false);

  const openPartnerModal = () => setShowPartnerModal(true);
  const closePartnerModal = () => {
    setShowPartnerModal(false);
    setPartnerForm({ name: '', id: '', phone: '', link: '' });
  };

  const savePartner = async () => {
    try {
      await api.put(`/orders/${id}`, { deliveryPartner: partnerForm });
      setOrder(prev => ({ ...prev, deliveryPartner: partnerForm }));
      toast.success('Delivery partner assigned!');
      closePartnerModal();
    } catch (error) {
      toast.error('Failed to assign partner');
    }
  };

  // Export invoice
  const downloadInvoice = () => {
    const invoice = [
      `Fashion Basket - Invoice #${order?._id.slice(-8).toUpperCase()}`,
      `Date: ${new Date(order?.createdAt).toLocaleDateString()}`,
      `Customer: ${order?.user?.name || 'Customer'}`,
      `Email: ${order?.user?.email || 'N/A'}`,
      `Phone: ${order?.user?.phone || 'N/A'}`,
      '',
      'Items:',
      ...order?.items.map(item => 
        `  ${item.product?.name || 'Product'} (x${item.quantity}) - ₹${item.discountedPrice * item.quantity}`
      ),
      `Total: ₹${order?.totalAmount?.toLocaleString()}`,
      `Payment: ${order?.paymentMethod?.toUpperCase()}`,
      `Status: ${order?.status?.toUpperCase()}`,
      ...(order?.deliveryPartner && [
        '',
        `Delivery Partner: ${order.deliveryPartner.name}`,
        `Tracking: ${order.deliveryPartner.link}`
      ])
    ].join('\n');

    const blob = new Blob([invoice], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${order?._id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-white rounded-xl w-64 mx-auto"></div>
          <div className="bg-white rounded-2xl p-8 space-y-8 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="h-64 bg-gray-100 rounded-xl"></div>
              <div className="space-y-4">
                <div className="h-12 bg-gray-100 rounded-xl"></div>
                <div className="h-12 bg-gray-100 rounded-xl"></div>
                <div className="h-12 bg-gray-100 rounded-xl"></div>
              </div>
            </div>
            <div className="h-48 bg-gray-100 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-8">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-8">The order you're looking for doesn't exist.</p>
          <button 
            onClick={() => window.location.href = '/admin/orders'}
            className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:shadow-xl transition-all"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      delivered: 'bg-green-100 text-green-800 border-green-200',
      shipped: 'bg-blue-100 text-blue-800 border-blue-200',
      processing: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-purple-100 text-purple-800 border-purple-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl text-white shadow-xl">
              <Package className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                Order #{order._id.slice(-8).toUpperCase()}
              </h1>
              <p className="text-gray-600">Order Details - {new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={downloadInvoice}
            className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl hover:shadow-xl flex items-center gap-2 shadow-lg"
          >
            <Download className="w-4 h-4" />
            Download Invoice
          </button>
          <a 
            href="/admin/orders" 
            className="px-6 py-2.5 bg-gray-600 text-white font-bold rounded-xl hover:shadow-lg flex items-center gap-2 transition-all"
          >
            Back to Orders
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Left Column: Customer & Summary */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <User className="w-6 h-6 text-purple-600" />
            Customer Details
          </h3>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                {order.user?.name?.charAt(0) || 'C'}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-lg text-gray-900 truncate">
                  {order.user?.name || 'Customer'}
                </h4>
                <p className="text-gray-600">{order.user?.email || 'No email'}</p>
                <p className="text-gray-600">{order.user?.phone || 'No phone'}</p>
              </div>
            </div>

            <div>
              <h5 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gray-500" />
                Shipping Address
              </h5>
              <div className="bg-blue-50 p-5 rounded-xl space-y-2">
                <p className="font-medium">{order.shippingAddress?.street}</p>
                <p>{order.shippingAddress?.landmark && `${order.shippingAddress.landmark}, `}{order.shippingAddress?.city}</p>
                <p>{order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="text-center p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl">
                <div className="text-2xl font-bold">₹{order.totalAmount?.toLocaleString()}</div>
                <div className="text-sm opacity-90">Total Amount</div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Payment:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    order.paymentMethod === 'cod' 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {order.paymentMethod?.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Payment Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    order.paymentStatus === 'paid' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {order.paymentStatus?.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Status & Actions */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-xl p-8 border sticky top-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Clock className="w-6 h-6 text-blue-600" />
              Order Status
            </h3>
            
            <div className="space-y-6">
              {/* Current Status */}
              <div className="text-center p-8 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl border-4 border-dashed border-orange-200">
                <div className={`inline-flex px-4 py-2 rounded-full text-sm font-bold border-2 mx-auto mb-3 ${getStatusColor(order.status)}`}>
                  {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  ₹{order.totalAmount?.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Order Total</div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3">
                <select 
                  value={order.status}
                  onChange={(e) => updateStatus(e.target.value)}
                  disabled={updating}
                  className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 font-medium text-sm disabled:opacity-50"
                >
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                
                <button
                  onClick={openPartnerModal}
                  disabled={order.status === 'delivered' || order.status === 'cancelled'}
                  className="p-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium rounded-xl hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Truck className="w-4 h-4" />
                  {order.deliveryPartner ? 'Edit Partner' : 'Add Partner'}
                </button>
              </div>

              {/* Delivery Partner */}
              {order.deliveryPartner && (
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                  <h5 className="font-semibold text-emerald-800 mb-2 flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    Delivery Partner
                  </h5>
                  <div className="space-y-1 text-sm">
                    <div className="font-medium">{order.deliveryPartner.name}</div>
                    <div>ID: {order.deliveryPartner.id}</div>
                    <div>📞 {order.deliveryPartner.phone}</div>
                    <a href={order.deliveryPartner.link} className="text-emerald-600 hover:underline font-medium block" target="_blank" rel="noopener noreferrer">
                      Track Order →
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border">
        <div className="p-8 border-b bg-gradient-to-r from-gray-50 to-gray-100">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <ShoppingBag className="w-7 h-7 text-purple-600" />
            Order Items ({order.items?.length || 0})
          </h3>
        </div>
        
        <div className="divide-y divide-gray-100">
          {order.items?.map((item, index) => (
            <div key={index} className="p-8 hover:bg-gray-50">
              <div className="grid grid-cols-1 lg:grid-cols-12 items-start gap-6 lg:gap-8">
                <div className="lg:col-span-2">
                  <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 font-medium">
                    {item.product?.name?.charAt(0) || 'P'}
                  </div>
                </div>
                
                <div className="lg:col-span-7">
                  <h4 className="font-bold text-lg text-gray-900 mb-1 truncate">
                    {item.product?.name || 'Product'}
                  </h4>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2 flex-wrap">
                    <span>Qty: {item.quantity}</span>
                    <span>Size: {item.size || 'N/A'}</span>
                    <span>Color: <span className="w-4 h-4 rounded-full inline-block bg-gray-300" style={{backgroundColor: item.color?.toLowerCase()}}></span> {item.color || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                    <span>₹{item.discountedPrice?.toLocaleString()}</span>
                    <span className="text-gray-500 line-through">₹{item.price?.toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="lg:col-span-3 text-right lg:text-left">
                  <div className="text-2xl font-bold text-purple-600">
                    ₹{(item.discountedPrice * item.quantity)?.toLocaleString()}
                  </div>
                  <div className="text-sm font-bold text-amber-600 py-2 w-40 rounded-2xl bg-amber-200 text-center">per item: ₹{ item.price- item.discountedPrice } OFF</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Partner Modal */}
      {showPartnerModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
            <div className="p-8 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Truck className="w-7 h-7 text-emerald-600" />
                Delivery Partner
              </h3>
              <button onClick={closePartnerModal} className="p-2 hover:bg-gray-100 rounded-2xl">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-8 space-y-5">
              <input 
                type="text" 
                value={partnerForm.name} 
                onChange={(e) => setPartnerForm({...partnerForm, name: e.target.value})}
                placeholder="Partner Name *"
                className="w-full px-4 py-3.5 border border-gray-300 rounded-2xl focus:ring-3 focus:ring-emerald-500/20"
              />
              <input 
                type="text" 
                value={partnerForm.id} 
                onChange={(e) => setPartnerForm({...partnerForm, id: e.target.value})}
                placeholder="Partner ID *"
                className="w-full px-4 py-3.5 border border-gray-300 rounded-2xl focus:ring-3 focus:ring-emerald-500/20"
              />
              <input 
                type="tel" 
                value={partnerForm.phone} 
                onChange={(e) => setPartnerForm({...partnerForm, phone: e.target.value})}
                placeholder="Phone Number"
                className="w-full px-4 py-3.5 border border-gray-300 rounded-2xl focus:ring-3 focus:ring-emerald-500/20"
              />
              <input 
                type="url" 
                value={partnerForm.link} 
                onChange={(e) => setPartnerForm({...partnerForm, link: e.target.value})}
                placeholder="Tracking Link"
                className="w-full px-4 py-3.5 border border-gray-300 rounded-2xl focus:ring-3 focus:ring-emerald-500/20"
              />
            </div>
            
            <div className="p-8 border-t bg-gradient-to-r from-gray-50 to-white flex gap-3 justify-end">
              <button 
                onClick={closePartnerModal} 
                className="px-8 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-2xl hover:bg-gray-100"
              >
                Cancel
              </button>
              <button 
                onClick={savePartner} 
                disabled={!partnerForm.name || !partnerForm.id}
                className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-2xl hover:shadow-xl flex items-center gap-2 disabled:opacity-50"
              >
                <Truck className="w-4 h-4" />
                Assign Partner
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
