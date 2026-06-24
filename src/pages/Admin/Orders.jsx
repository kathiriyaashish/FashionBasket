import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import api from "../../services/api";
import { toast } from "react-hot-toast";
import {
  Edit3,
  Truck,
  UserCheck,
  X,
  Plus,
  Download,
  Filter,
  Package,
  MapPin,
  CreditCard,
  Clock,
  Calendar,
} from "lucide-react";

const Orders = () => {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [deletingOrder, setDeletingOrder] = useState(null); 

  // Filter states
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchCustomer, setSearchCustomer] = useState("");
  const [searchOrderId, setSearchOrderId] = useState("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [partnerForm, setPartnerForm] = useState({
    name: "",
    id: "",
    phone: "",
    link: "",
  });

  // Fetch real orders from backend
  useEffect(() => {
    if (!user) return;
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get("/orders");
      setOrders(response.data.orders || []);
    } catch (error) {
      toast.error("Failed to fetch orders");
      console.error("Fetch orders error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Update order status
  const updateStatus = async (orderId, newStatus) => {
    try {
      setUpdatingOrder(orderId);
      await api.put(`/orders/${orderId}`, { status: newStatus });

      setOrders(
        orders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order,
        ),
      );

      toast.success(`Order ${newStatus.toLowerCase()} successfully!`);
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setUpdatingOrder(null);
    }
  };

  const deleteOrder = async (orderId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this order? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      setDeletingOrder(orderId);
      await api.delete(`/orders/${orderId}`);

      setOrders(orders.filter((order) => order._id !== orderId));
      toast.success("Order deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete order");
      console.error("Delete error:", error);
    } finally {
      setDeletingOrder(null);
    }
  };

  
  const filteredOrders = orders.filter((order) => {
    const statusMatch = filterStatus === "all" || order.status === filterStatus;
    const customerMatch =
      order.shippingAddress?.street
        ?.toLowerCase()
        .includes(searchCustomer.toLowerCase()) ||
      `${order.user?.name || "Customer"}`
        .toLowerCase()
        .includes(searchCustomer.toLowerCase());
    const orderIdMatch = order._id?.includes(searchOrderId);
    return statusMatch && customerMatch && orderIdMatch;
  });

  const openPartnerModal = (orderId) => {
    setEditingOrderId(orderId);
    const order = orders.find((o) => o._id === orderId);
    setPartnerForm(
      order?.deliveryPartner || { name: "", id: "", phone: "", link: "" },
    );
    setIsModalOpen(true);
  };

  const saveDeliveryPartner = async () => {
    try {
      await api.put(`/orders/${editingOrderId}`, {
        deliveryPartner: partnerForm,
      });
      setOrders(
        orders.map((order) =>
          order._id === editingOrderId
            ? { ...order, deliveryPartner: partnerForm }
            : order,
        ),
      );
      setIsModalOpen(false);
      toast.success("Delivery partner assigned!");
    } catch (error) {
      toast.error("Failed to assign partner");
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      "Order ID",
      "Customer",
      "Amount",
      "Status",
      "Date",
      "Payment Method",
      "Partner",
    ];
    const csvContent = [
      headers.join(","),
      ...filteredOrders.map((order) =>
        [
          order._id,
          `"${order.user?.name || "Customer"}"`,
          `₹${order.totalAmount?.toLocaleString()}`,
          order.status,
          new Date(order.createdAt).toLocaleDateString(),
          order.paymentMethod,
          order.deliveryPartner ? `"${order.deliveryPartner.name}"` : "None",
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fashion-basket-orders-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "shipped":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "processing":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "confirmed":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-white rounded-xl w-64"></div>
            <div className="bg-white rounded-2xl p-8 space-y-4">
              <div className="h-64 bg-gray-100 rounded-xl"></div>
              <div className="h-24 bg-gray-100 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
        <div>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Order Management
          </h2>
          <p className="text-gray-600">
            Manage all orders for Fashion Basket ({orders.length} total)
          </p>
        </div>

        {/* Filter & Export */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Search Order ID */}
          <div className="relative w-48">
            <input
              type="text"
              value={searchOrderId}
              onChange={(e) => setSearchOrderId(e.target.value)}
              placeholder="Search Order ID..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Search Customer */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <input
              type="text"
              value={searchCustomer}
              onChange={(e) => setSearchCustomer(e.target.value)}
              placeholder="Search customers..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Export Button */}
          <button
            onClick={exportToCSV}
            disabled={filteredOrders.length === 0}
            className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg"
          >
            <Download className="w-4 h-4" />
            Export CSV ({filteredOrders.length})
          </button>

          {/* Refresh Button */}
          <button
            onClick={fetchOrders}
            disabled={loading}
            className="px-4 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
          >
            <svg
              className="w-4 h-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 mb-8 shadow-sm border">
        <p className="text-sm text-gray-600">
          Showing{" "}
          <span className="font-bold text-purple-600">
            {filteredOrders.length}
          </span>{" "}
          of <span className="font-bold">{orders.length}</span> orders
          {filteredOrders.length !== orders.length && (
            <button
              onClick={() => {
                setFilterStatus("all");
                setSearchCustomer("");
                setSearchOrderId("");
              }}
              className="ml-4 text-purple-600 hover:text-purple-700 font-medium text-sm"
            >
              Clear filters
            </button>
          )}
        </p>
      </div>

<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
  {filteredOrders.map((order) => (
    <article
      key={order._id}
      className="group bg-white shadow-lg hover:shadow-2xl border border-gray-100 rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:border-indigo-200 backdrop-blur-sm h-auto flex flex-col"
    >
      {/* 1️⃣ HEADER - Order Info */}
      <header className="bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 p-6 border-b border-gray-100">
        <div className="flex items-start justify-between gap-4">
          {/* Left: ID + Customer */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
              <span className="font-mono text-white font-bold text-sm leading-none">
                #{order._id?.slice(-6)?.toUpperCase()}
              </span>
            </div>
            <div className="min-w-0 flex-1 pt-1">
              <h3 className="font-bold text-lg text-gray-900 leading-tight truncate mb-1">
                {order.user?.name || "Anonymous Customer"}
              </h3>
              <p className="text-sm text-gray-500 truncate leading-tight">
                {order.shippingAddress?.city || "N/A"}, {order.shippingAddress?.pincode || ""}
              </p>
            </div>
          </div>

          {/* Right: Amount */}
          <div className="text-right shrink-0">
            <div className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-purple-700 bg-clip-text text-transparent drop-shadow-sm">
              ₹{order.totalAmount?.toLocaleString('en-IN') || 0}
            </div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">Total Amount</p>
          </div>
        </div>
      </header>

      {/* 2️⃣ BODY - Status & Key Info */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        {/* Status Row */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Order Status</span>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1.5 text-xs font-bold shadow-sm border rounded-full ${getStatusColor(order.status)} leading-none`}>
              {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
            </span>
            <select
              value={order.status}
              onChange={(e) => updateStatus(order._id, e.target.value)}
              disabled={updatingOrder === order._id}
              className="px-2.5 py-1.5 text-xs border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500 bg-white/80 shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Payment Info */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Payment</span>
          <span className={`px-3 py-1.5 text-xs font-bold shadow-sm rounded-xl ${
            order.paymentMethod === "cod"
              ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white"
              : "bg-gradient-to-r from-emerald-400 to-teal-500 text-white"
          }`}>
            {order.paymentMethod?.toUpperCase() || "N/A"}
          </span>
        </div>

        {/* Payment Status */}
        {order.paymentStatus && (
          <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-l-4 border-blue-400 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">Payment Status</span>
              <span className={`px-2.5 py-1 text-xs font-bold shadow-sm border rounded-full ${getStatusColor(order.paymentStatus)}`}>
                {order.paymentStatus}
              </span>
            </div>
          </div>
        )}

        {/* 3️⃣ DELIVERY PARTNER SECTION */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Delivery Partner</span>
          {order.deliveryPartner && order.deliveryPartner.name ? (
            <div className="group/delivery p-3 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-200 shadow-inner hover:shadow-md transition-all max-h-20 overflow-hidden">
              <div className="font-semibold text-sm text-emerald-900 mb-1 truncate">
                {order.deliveryPartner.name}
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-emerald-700 font-medium">
                <span>ID: <span className="font-mono">{order.deliveryPartner.id}</span></span>
                {order.deliveryPartner.phone && (
                  <span>📞 {order.deliveryPartner.phone}</span>
                )}
              </div>
              {order.deliveryPartner.link && (
                <a 
                  href={order.deliveryPartner.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 bg-white/60 hover:bg-white border border-emerald-300 text-emerald-700 rounded-lg text-xs font-bold shadow-sm hover:shadow-md hover:scale-105 transition-all group-hover/delivery:translate-x-1"
                >
                  📦 Track <span className="group-hover/delivery:hidden">→</span>
                  <svg className="w-3 h-3 group-hover/delivery:block hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              )}
            </div>
          ) : (
            <button
              onClick={() => openPartnerModal(order._id)}
              disabled={order.status === "delivered" || order.status === "cancelled"}
              className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-sm rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-lg flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Assign Partner
            </button>
          )}
        </div>
      </div>

      {/* 4️⃣ FOOTER - Actions + Date */}
      <footer className="p-5 pt-0 border-t border-gray-100 bg-gradient-to-t from-slate-50/50">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            {new Date(order.createdAt).toLocaleDateString('en-IN')}
          </span>
          <span className="text-xs text-gray-400 font-mono">
            {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
          </span>
        </div>
        
        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => window.open(`/admin/order/${order._id}`, "_blank")}
            className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-xs rounded-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all group"
            title="View Order Details"
          >
            <Package className="w-4 h-4 mx-auto group-hover:rotate-12" />
            <span className="block mt-1 leading-none">View</span>
          </button>
          
          <button
            onClick={() => updateStatus(order._id, "delivered")}
            disabled={order.status === "delivered" || updatingOrder === order._id}
            className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-xs rounded-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:shadow-md group"
            title="Mark as Delivered"
          >
            <UserCheck className="w-4 h-4 mx-auto group-hover:scale-110" />
            <span className="block mt-1 leading-none">Deliver</span>
          </button>
          
          <button
            onClick={() => deleteOrder(order._id)}
            disabled={deletingOrder === order._id || order.status === "delivered"}
            className="p-3 bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold text-xs rounded-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:shadow-md group"
            title="Delete Order"
          >
            {deletingOrder === order._id ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
            ) : (
              <X className="w-4 h-4 mx-auto group-hover:scale-110" />
            )}
            <span className="block mt-1 leading-none">Delete</span>
          </button>
        </div>
      </footer>
    </article>
  ))}
</div>


      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
            <div className="p-8 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Truck className="w-7 h-7 text-emerald-600" />
                Assign Delivery Partner
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-2xl transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 space-y-5">
              <input
                type="text"
                value={partnerForm.name}
                onChange={(e) =>
                  setPartnerForm({ ...partnerForm, name: e.target.value })
                }
                placeholder="Partner Name *"
                className="w-full px-4 py-3.5 border border-gray-300 rounded-2xl focus:ring-3 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
              />
              <input
                type="text"
                value={partnerForm.id}
                onChange={(e) =>
                  setPartnerForm({ ...partnerForm, id: e.target.value })
                }
                placeholder="Partner ID *"
                className="w-full px-4 py-3.5 border border-gray-300 rounded-2xl focus:ring-3 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
              />
              <input
                type="tel"
                value={partnerForm.phone}
                onChange={(e) =>
                  setPartnerForm({ ...partnerForm, phone: e.target.value })
                }
                placeholder="Phone Number"
                className="w-full px-4 py-3.5 border border-gray-300 rounded-2xl focus:ring-3 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
              />
              <input
                type="url"
                value={partnerForm.link}
                onChange={(e) =>
                  setPartnerForm({ ...partnerForm, link: e.target.value })
                }
                placeholder="Tracking Link"
                className="w-full px-4 py-3.5 border border-gray-300 rounded-2xl focus:ring-3 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
              />
            </div>

            <div className="p-8 border-t bg-gradient-to-r from-gray-50 to-white flex gap-3 justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-8 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-2xl hover:bg-gray-100 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={saveDeliveryPartner}
                disabled={!partnerForm.name || !partnerForm.id}
                className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-2xl hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <Truck className="w-4 h-4" />
                Assign Partner
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Orders;
