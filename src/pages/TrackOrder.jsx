import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import api from "../services/api";
import { toast } from "react-hot-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  Package,
  MapPin,
  Truck,
  Clock,
  ShoppingBag,
  UserCheck,
  CreditCard,
  Download,
  ArrowLeft,
  ChevronRight,
  Phone,
  BarChart3,
  DollarSign,
  Users,
  ShoppingCart,
  Filter,
} from "lucide-react";

// 🛠️ DATE FUNCTIONS (SAFE)
const formatDateShort = (dateString) => {
  try {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  } catch {
    return "—";
  }
};

const formatDateFull = (dateString) => {
  try {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
};

// 🆕 PROFESSIONAL PDF INVOICE GENERATOR
const generatePDFInvoice = async (order, user) => {
  const invoiceHTML = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; background: white; line-height: 1.4;">
      <!-- HEADER -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; padding-bottom: 30px; border-bottom: 4px solid #232f3e;">
        <div>
          <h1 style="font-size: 36px; font-weight: 800; color: #232f3e; margin: 0;">Fashion Basket</h1>
          <p style="font-size: 16px; color: #565959; margin: 8px 0 0 0;">Online Fashion Store | Surat, Gujarat</p>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 14px; color: #565959; margin-bottom: 8px;">TAX INVOICE</div>
          <div style="font-size: 28px; font-weight: 800; color: #232f3e;">#${order._id?.slice(-8).toUpperCase()}</div>
          <div style="font-size: 12px; color: #565959;">Order ID: ${order._id}</div>
        </div>
      </div>

      <!-- BILLING & ORDER INFO -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px;">
        <div>
          <h3 style="font-size: 18px; font-weight: 700; color: #232f3e; margin-bottom: 16px;">Bill To:</h3>
          <div style="font-size: 14px; line-height: 1.6; color: #232f3e;">
            <strong>${user?.name || "Customer"}</strong><br/>
            ${user?.email || "N/A"}<br/>
            Ph: ${user?.phone || "N/A"}<br/><br/>
            <strong>DELIVERY ADDRESS:</strong><br/>
            ${order.shippingAddress?.street || ""}<br/>
            ${order.shippingAddress?.landmark ? order.shippingAddress.landmark + "," : ""}<br/>
            ${order.shippingAddress?.city || ""}, ${order.shippingAddress?.state || ""}<br/>
            PIN: <strong>${order.shippingAddress?.pincode || ""}</strong>
          </div>
        </div>
        
        <div>
          <h3 style="font-size: 18px; font-weight: 700; color: #232f3e; margin-bottom: 16px;">Order Details:</h3>
          <div style="font-size: 14px; line-height: 1.6; color: #232f3e;">
            <strong>Date:</strong> ${formatDateFull(order.createdAt)}<br/>
            <strong>Payment Method:</strong> 
            <span style="text-transform: uppercase; color: #1976d2; padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: 600;">
              ${order.paymentMethod || "N/A"}
            </span><br/>
            <strong>Status:</strong> 
            <span style="
                       color: ${order.status === "delivered" ? "#2e7d32" : "#ef6c00"}; 
                       padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-align: center">
              ${order.status?.replace("_", " ").toUpperCase() || "PENDING"}
            </span><br/>
            ${
              order.deliveryPartner
                ? `
              <strong>Delivery Partner:</strong> ${order.deliveryPartner.name}<br/>
              <strong>Tracking ID:</strong> ${order.deliveryPartner.id}<br/>
              <strong>Track:</strong> <a href="${order.deliveryPartner.link}" style="color: #1a73e8;">${order.deliveryPartner.link}</a>
            `
                : "<strong>Shipping:</strong> Standard Delivery"
            }
          </div>
        </div>
      </div>

      <!-- ITEMS TABLE -->
      <div style="margin-bottom: 40px;">
        <h3 style="font-size: 20px; font-weight: 700; color: #232f3e; margin-bottom: 24px;">Order Items:</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <thead>
            <tr style="background: linear-gradient(135deg, #f5f5f5 0%, #fafafa 100%); border-bottom: 3px solid #e0e0e0;">
              <th style="padding: 20px 16px; text-align: left; font-weight: 700; color: #232f3e;">DESCRIPTION</th>
              <th style="padding: 20px 16px; text-align: center; font-weight: 700; color: #232f3e;">QTY</th>
              <th style="padding: 20px 16px; text-align: right; font-weight: 700; color: #232f3e;">UNIT PRICE</th>
              <th style="padding: 20px 16px; text-align: right; font-weight: 700; color: #232f3e;">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            ${
              order.items
                ?.map(
                  (item, index) => `
              <tr style="border-bottom: 1px solid #e7e7e7;">
                <td style="padding: 20px 16px; vertical-align: top;">
                  <div style="font-weight: 700; color: #232f3e; font-size: 15px; margin-bottom: 8px;">
                    ${item.product?.name || "Product Name"}
                  </div>
                  <div style="font-size: 13px; color: #565959; background: #f8f9fa; padding: 8px 12px; border-radius: 6px; display: inline-block;">
                    <strong>Size:</strong> ${item.size || "N/A"} | 
                    <strong>Color:</strong> ${item.color || "N/A"} | 
                    <strong>Product ID:</strong> ${item.product?._id?.slice(-6) || "N/A"}
                  </div>
                </td>
                <td style="padding: 20px 16px; text-align: center; font-weight: 700; font-size: 16px; color: #232f3e;">
                  ${item.quantity}
                </td>
                <td style="padding: 20px 16px; text-align: right; font-size: 15px; color: #666;">
                  ₹${(item.discountedPrice || 0).toLocaleString("en-IN")}
                </td>
                <td style="padding: 20px 16px; text-align: right; font-weight: 800; font-size: 16px; color: #B12704;">
                  ₹${(item.discountedPrice * item.quantity || 0).toLocaleString("en-IN")}
                </td>
              </tr>
            `,
                )
                .join("") ||
              '<tr><td colspan="4" style="padding: 40px; text-align: center; color: #999;">No items found</td></tr>'
            }
          </tbody>
        </table>
      </div>

      <!-- TOTALS SECTION -->
      <div style="background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%); padding: 32px; border-radius: 12px; margin-bottom: 40px; border: 2px solid #e9ecef;">
        <div style="display: flex; justify-content: flex-end;">
          <div style="width: 350px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 16px; font-size: 16px; padding: 12px 0; border-bottom: 2px dashed #dee2e6;">
              <span style="font-weight: 700;">SUBTOTAL:</span>
              <span style="font-weight: 700; font-size: 20px;">₹${((order.totalAmount || 0) * 0.95).toLocaleString("en-IN")}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 16px; font-size: 14px; color: #666;">
              <span>GST (5%):</span>
              <span>₹${((order.totalAmount || 0) * 0.05).toLocaleString("en-IN")}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 20px 0; border-top: 3px solid #232f3e;">
              <span style="font-size: 18px; font-weight: 700;">TOTAL AMOUNT:</span>
              <span style="font-size: 28px; font-weight: 900; color: #B12704; letter-spacing: 1px;">
                ₹${(order.totalAmount || 0).toLocaleString("en-IN")}
              </span>
            </div>
            <div style="font-size: 12px; color: #6c757d; text-align: center; margin-top: 20px; padding-top: 16px; border-top: 1px solid #dee2e6;">
              ⭐ Price includes GST | Thank you for shopping with Fashion Basket! ⭐
            </div>
          </div>
        </div>
      </div>

      <!-- TERMS & FOOTER -->
      <div style="border-top: 2px solid #dee2e6; padding-top: 32px;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; font-size: 12px; color: #6c757d;">
          <div>
            <h4 style="font-weight: 700; color: #232f3e; margin-bottom: 12px;">Terms & Conditions:</h4>
            <div>✅ 7-day easy returns</div>
            <div>✅ Free shipping on orders above ₹999</div>
            <div>✅ Secure payment gateway</div>
            <div>✅ GST invoice provided</div>
          </div>
          <div style="text-align: right;">
            <h4 style="font-weight: 700; color: #232f3e; margin-bottom: 12px;">Contact Us:</h4>
            Fashion Basket<br/>
            Surat, Gujarat, India<br/>
            📧 support@fashionbasket.in<br/>
            📞 +91 98765 43210<br/>
            🌐 www.fashionbasket.in
          </div>
        </div>
      </div>
    </div>
  `;

  const pdf = new jsPDF("p", "mm", "a4");
  const element = document.createElement("div");
  element.innerHTML = invoiceHTML;
  element.style.position = "absolute";
  element.style.left = "-9999px";
  element.style.top = "-9999px";
  element.style.width = "794px";
  document.body.appendChild(element);

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      width: 794,
      height: 1123,
      logging: false,
    });

    const imgData = canvas.toDataURL("image/png");
    pdf.addImage(imgData, "PNG", 0, 0, 210, 297);
    pdf.save(`FashionBasket-Invoice-${order._id?.slice(-8).toUpperCase()}.pdf`);
    toast.success("✅ Professional PDF Invoice Downloaded!");
  } catch (error) {
    console.error("PDF Error:", error);
    toast.error("❌ Failed to generate PDF");
  } finally {
    document.body.removeChild(element);
  }
};

const TrackOrder = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [view, setView] = useState("dashboard");
  const [activeTab, setActiveTab] = useState("all");
  const [stats, setStats] = useState({
    confirmed: 0,
    totalOrders: 0,
    totalSpent: 0,
    delivered: 0,
    cancelled: 0,
  });

  useEffect(() => {
    if (user) {
      fetchUserOrders();
    }
  }, [user]);

  const fetchUserOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get("/orders/my-orders");
      const ordersData = response.data.orders || [];
      setOrders(ordersData);

      const totalSpent = ordersData.reduce(
        (sum, order) => sum + (order.totalAmount || 0),
        0,
      );
      setStats({
        totalOrders: ordersData.length,
        totalSpent,
        confirmed: ordersData.filter((o) => o.status === "confirmed").length,
        delivered: ordersData.filter((o) => o.status === "delivered").length,
        cancelled: ordersData.filter((o) => o.status === "cancelled").length,
      });

      if (ordersData.length > 0) {
        setSelectedOrder(ordersData[0]);
      }
    } catch (error) {
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const downloadAllInvoices = async () => {
    toast.loading("Generating invoices...", { id: "bulk-download" });
    for (let i = 0; i < orders.length; i++) {
      await generatePDFInvoice(orders[i], user);
      if (i < orders.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
    }
    toast.success(`✅ Downloaded ${orders.length} invoices!`, {
      id: "bulk-download",
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      delivered: "bg-green-100 text-green-800 border border-green-200",
      shipped: "bg-blue-100 text-blue-800 border border-blue-200",
      processing: "bg-yellow-100 text-yellow-800 border border-yellow-200",
      confirmed: "bg-purple-100 text-purple-800 border border-purple-200",
      pending: "bg-orange-100 text-orange-800 border border-orange-200",
      cancelled: "bg-red-100 text-red-800 border border-red-200",
    };
    return badges[status] || "bg-gray-100 text-gray-800 border border-gray-200";
  };

  const filteredOrders = orders.filter((order) =>
    activeTab === "all" ? true : order.status === activeTab,
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 font-medium">
            Loading Dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-12 text-center border border-gray-200">
          <Package className="w-24 h-24 text-gray-300 mx-auto mb-8" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Order Dashboard
          </h2>
          <p className="text-xl text-gray-600 mb-10">
            Sign in to access your complete order history and analytics
          </p>
          <button
            onClick={() => navigate("/login")}
            className="w-full bg-gradient-to-r from-gray-900 to-black text-white py-4 px-8 rounded-2xl font-bold text-lg hover:shadow-2xl hover:scale-[1.02] transition-all shadow-xl border border-gray-800"
          >
            Sign In Securely →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200 px-4 py-4 shadow-sm">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-1 rounded-xl hover:bg-gray-100 transition-all"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div className="flex-1 ml-4">
            <h1 className="text-xl font-bold text-gray-900">Order Dashboard</h1>
            <p className="text-sm text-gray-600">
              {stats.totalOrders} orders • ₹{stats.totalSpent?.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="pt-20 lg:pt-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Dashboard Header */}
        <div className="lg:flex lg:items-center lg:justify-between mb-12">
          <div>
            <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent mb-4">
              Order Dashboard
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl">
              Manage your {stats.totalOrders} orders • Total spent ₹
              {stats.totalSpent?.toLocaleString()} •{stats.delivered} delivered,{" "}
              {stats.cancelled} cancelled
            </p>
          </div>
          <div className="mt-8 lg:mt-0 flex flex-col sm:flex-row gap-4">
            <button
              onClick={downloadAllInvoices}
              disabled={orders.length === 0}
              className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-lg rounded-2xl hover:shadow-2xl hover:scale-[1.02] transition-all shadow-xl border border-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
            >
              <Download className="w-5 h-5" />
              Export All ({orders.length})
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="group bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50 hover:shadow-3xl hover:-translate-y-2 transition-all duration-300 hover:bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">
                  Total Orders
                </p>
                <p className="text-4xl lg:text-3xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {stats.totalOrders}
                </p>
              </div>
              <ShoppingCart className="w-16 h-16 text-blue-500 opacity-75 group-hover:scale-110 transition-transform" />
            </div>
          </div>

          <div className="group bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50 hover:shadow-3xl hover:-translate-y-2 transition-all duration-300 hover:bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">
                  Total Spent
                </p>
                <p className="text-4xl lg:text-3xl font-black text-emerald-600">
                  ₹{stats.totalSpent?.toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-16 h-16 text-emerald-500 opacity-75 group-hover:scale-110 transition-transform" />
            </div>
          </div>

          <div className="group bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50 hover:shadow-3xl hover:-translate-y-2 transition-all duration-300 hover:bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">
                  Delivered
                </p>
                <p className="text-4xl lg:text-3xl font-black text-green-600">
                  {stats.delivered}
                </p>
              </div>
              <Truck className="w-16 h-16 text-green-500 opacity-75 group-hover:scale-110 transition-transform" />
            </div>
          </div>

          <div className="group bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50 hover:shadow-3xl hover:-translate-y-2 transition-all duration-300 hover:bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">
                  Cancelled
                </p>
                <p className="text-4xl lg:text-3xl font-black text-red-600">
                  {stats.cancelled}
                </p>
              </div>
              <Clock className="w-16 h-16 text-red-500 opacity-75 group-hover:scale-110 transition-transform" />
            </div>
          </div>
        </div>

        {/* Filter & Orders Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 sticky top-32 lg:top-40 h-fit">
              <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                <BarChart3 className="w-7 h-7 text-blue-600" />
                Filter Orders
              </h3>
              <div className="space-y-3">
                {[
                  {
                    id: "all",
                    label: "All Orders",
                    count: stats.totalOrders,
                    color: "blue",
                  },
                  {
                    id: "confirmed",
                    label: "Confirmed",
                    count: stats.confirmed,
                    color: "blue",
                  },
                  {
                    id: "delivered",
                    label: "Delivered",
                    count: stats.delivered,
                    color: "green",
                  },
                  {
                    id: "processing",
                    label: "Processing",
                    count: orders.filter((o) => o.status === "processing")
                      .length,
                    color: "purple",
                  },
                  {
                    id: "shipped",
                    label: "Shipped",
                    count: orders.filter((o) => o.status === "shipped").length,
                    color: "blue",
                  },
                  {
                    id: "cancelled",
                    label: "Cancelled",
                    count: stats.cancelled,
                    color: "red",
                  },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center justify-between p-5 rounded-2xl transition-all group hover:shadow-xl ${
                      activeTab === tab.id
                        ? `bg-gradient-to-r from-${tab.color}-500 to-${tab.color}-600 text-white shadow-2xl scale-[1.02] border-2 border-${tab.color}-700`
                        : "hover:bg-gray-50 border-2 border-gray-200 text-gray-800 hover:border-gray-300"
                    }`}
                  >
                    <span className="font-semibold">{tab.label}</span>
                    <span
                      className={`px-4 py-2 rounded-xl text-sm font-bold ${
                        activeTab === tab.id
                          ? "bg-white/20 backdrop-blur-xl"
                          : "bg-gray-100"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Orders List */}
          <div className="lg:col-span-3 space-y-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 bg-white/50 backdrop-blur-xl rounded-3xl">
                <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mb-6"></div>
                <p className="text-2xl font-bold text-gray-700">
                  Loading your orders...
                </p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-24 bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-16 max-w-2xl mx-auto">
                <Package className="w-28 h-28 text-gray-300 mx-auto mb-8" />
                <h3 className="text-4xl font-bold text-gray-900 mb-6">
                  No orders found
                </h3>
                <p className="text-xl text-gray-600 mb-10 max-w-md mx-auto leading-relaxed">
                  {activeTab === "all"
                    ? "You haven't placed any orders yet. Start shopping to see your order history here!"
                    : `No ${activeTab} orders yet. Check other filters or place a new order.`}
                </p>
                <button
                  onClick={() => navigate("/")}
                  className="px-12 py-5 bg-gradient-to-r from-gray-900 to-black text-white font-bold text-xl rounded-3xl hover:shadow-2xl hover:scale-[1.02] transition-all shadow-2xl border border-gray-900"
                >
                  🛍️ Start Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredOrders.map((order) => (
                  <div
                    key={order._id}
                    className="group bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden cursor-pointer hover:bg-white p-6 lg:p-8"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="space-y-4">
                      {/* 🆕 COMPACT Order Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-1.5 rounded-xl text-white font-bold text-sm shadow-lg">
                            #{order._id?.slice(-8).toUpperCase()}
                          </div>
                          <div className="text-xs bg-gray-100 px-3 py-1.5 rounded-lg font-mono text-gray-700">
                            {formatDateShort(order.createdAt)}
                          </div>
                        </div>
                        <span
                          className={`px-4 py-2 text-xs font-bold rounded-xl shadow-md border ${getStatusBadge(order.status)}`}
                        >
                          {order.status?.replace("_", " ").toUpperCase()}
                        </span>
                      </div>

                      {/* 🆕 SUPER COMPACT Amazon Summary - 2 Column Mobile-First */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* 🆕 Compact Product Preview */}
                        <div className="space-y-3 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border">
                          <div className="flex items-center gap-2">
                            <ShoppingBag className="w-4 h-4 text-indigo-600" />
                            <span className="text-sm font-bold text-gray-900">
                              {order.items?.length || 0} Items
                            </span>
                          </div>

                          <div className="space-y-2 max-h-32 overflow-hidden">
                            {order.items?.slice(0, 2).map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-3 p-2 bg-white/70 rounded-lg text-xs group"
                              >
                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <span className="font-bold text-indigo-600 text-xs">
                                    {item.product?.name
                                      ?.charAt(0)
                                      ?.toUpperCase() || "P"}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-gray-900 truncate text-xs">
                                    {item.product?.name || "Product"}
                                  </div>
                                  <div className="flex items-center gap-1 text-xs text-gray-600 flex-wrap mt-0.5">
                                    <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-[10px]">
                                      {item.size}
                                    </span>
                                    <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px]">
                                      {item.color}
                                    </span>
                                    <span className="text-gray-500">
                                      x{item.quantity}
                                    </span>
                                  </div>
                                </div>
                                <span className="font-bold text-sm text-gray-900">
                                  ₹
                                  {(
                                    item.discountedPrice * item.quantity
                                  )?.toLocaleString()}
                                </span>
                              </div>
                            ))}
                            {order.items?.length > 2 && (
                              <div className="text-center py-2 bg-white/50 rounded-lg text-xs text-gray-600 font-medium">
                                +{order.items.length - 2} more
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 🆕 Compact Delivery & Payment */}
                        <div className="space-y-3">
                          {/* Payment */}
                          <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 text-xs">
                                <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                                <span className="font-bold text-blue-900 uppercase tracking-wide">
                                  {order.paymentMethod}
                                </span>
                              </div>
                              <span
                                className={`px-2 py-1 rounded-lg text-xs font-bold ${
                                  order.paymentMethod === "cod"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-emerald-100 text-emerald-800"
                                }`}
                              >
                                PAID
                              </span>
                            </div>
                          </div>

                          {/* Delivery */}
                          <div
                            className={`p-3 rounded-xl border text-xs space-y-1 ${
                              order.deliveryPartner
                                ? "bg-emerald-50 border-emerald-200"
                                : "bg-gray-50 border-gray-200"
                            }`}
                          >
                            {order.deliveryPartner ? (
                              <>
                                <div className="flex items-center gap-2 mb-1">
                                  <Truck className="w-3.5 h-3.5 text-emerald-600" />
                                  <span className="font-semibold text-emerald-900 text-xs">
                                    {order.deliveryPartner.name}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] text-emerald-800">
                                  <Phone className="w-3 h-3" />
                                  {order.deliveryPartner.phone}
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="flex items-center gap-2 mb-1">
                                  <Truck className="w-3.5 h-3.5 text-gray-500" />
                                  <span className="font-semibold text-gray-700 text-xs">
                                    In Progress
                                  </span>
                                </div>
                                <span className="text-gray-600 text-[10px]">
                                  5-7 days
                                </span>
                              </>
                            )}
                          </div>

                          {/* Total */}
                          <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl border-2 border-emerald-200 shadow-sm">
                            <div className="flex items-baseline justify-between mb-1">
                              <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                                Total
                              </span>
                              <span className="text-2xl font-black bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
                                ₹{order.totalAmount?.toLocaleString()}
                              </span>
                            </div>
                            <div className="text-[10px] text-emerald-700 text-center font-medium bg-white/60 px-2 py-1 rounded">
                              ✅ GST Included
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 🆕 Compact Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-gray-100">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            generatePDFInvoice(order, user);
                          }}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-gray-900 to-black text-white text-sm font-bold rounded-xl hover:shadow-xl hover:scale-[1.02] transition-all shadow-lg border border-gray-900"
                        >
                          <Download className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform" />
                          PDF Invoice
                        </button>
                        {order.deliveryPartner && (
                          <a
                            href={order.deliveryPartner.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-500 text-white text-sm font-bold rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all shadow-md flex-1"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            Track
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Chevron - Only Desktop */}
                    <ChevronRight className="w-5 h-5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 lg:group-hover:translate-x-2 transition-all hidden lg:block lg:group-hover:block" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackOrder;
