import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  Users,
  Package,
  ShoppingBag,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Download,
  Filter,
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import { useAuthStore } from "../../store/useAuthStore";
import api from "../../services/api";
import toast from "react-hot-toast";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
);

const Dashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // States
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    totalProducts: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch all dashboard data
  useEffect(() => {
    if (!user) return;
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [statsRes, recentRes, chartsRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/recent-orders"),
        api.get("/admin/charts"),
      ]);

      // Stats
      const statsData = statsRes.data.data || statsRes.data;
      setStats({
        totalOrders: statsData.totalOrders || 0,
        totalRevenue: statsData.totalRevenue || 0,
        totalUsers: statsData.totalUsers || 0,
        totalProducts: statsData.totalProducts || 0,
      });

      // Recent orders
      setRecentOrders(recentRes.data.recentOrders || []);

      // ✅ PERFECT BACKEND COMPATIBILITY - Use chartjsData directly!
      const backendChartData = chartsRes.data.chartjsData || chartsRes.data;

      setChartData({
        revenueData: backendChartData.revenueData || null,
        ordersData: backendChartData.ordersData || null,
        usersData: backendChartData.usersData || null,
      });

      toast.success("Dashboard loaded successfully! 📊");
    } catch (error) {
      console.error("Dashboard error:", error);
      toast.error("Using demo data");

      // ✅ 12 MONTHS FALLBACK DATA
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      setChartData({
        revenueData: {
          labels: months,
          datasets: [
            {
              label: "Revenue",
              data: [
                45000, 52000, 48000, 65000, 72000, 85000, 90000, 78000, 95000,
                82000, 88000, 105000,
              ],
              backgroundColor: "rgba(147, 51, 234, 0.8)",
              borderColor: "rgba(147, 51, 234, 1)",
              borderRadius: 12,
              borderWidth: 2,
            },
          ],
        },
        ordersData: {
          labels: months,
          datasets: [
            {
              label: "Orders",
              data: [
                120, 150, 180, 210, 240, 280, 320, 290, 350, 310, 340, 420,
              ],
              borderColor: "rgba(34, 197, 94, 1)",
              backgroundColor: "rgba(34, 197, 94, 0.1)",
              tension: 0.4,
              fill: true,
              pointBackgroundColor: "rgba(34, 197, 94, 1)",
              pointBorderColor: "#fff",
              pointRadius: 8,
              pointHoverRadius: 10,
            },
          ],
        },
        usersData: {
          labels: ["New Users (12m)", "Returning"],
          datasets: [
            {
              data: [1250, 950],
              backgroundColor: [
                "rgba(59, 130, 246, 0.8)",
                "rgba(168, 85, 247, 0.8)",
              ],
              borderColor: ["rgba(59, 130, 246, 1)", "rgba(168, 85, 247, 1)"],
              borderWidth: 3,
              cutout: "60%",
            },
          ],
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => fetchDashboardData();
  const handleOrdersClick = () => navigate("/admin/orders");

  // Chart Options
  const revenueOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `₹${(value / 1000).toLocaleString()}K`,
          color: "#6b7280",
        },
        grid: { color: "rgba(0,0,0,0.05)" },
      },
      x: { grid: { display: false }, ticks: { color: "#6b7280" } },
    },
    animation: { duration: 2000 },
  };

  const ordersOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: "#6b7280" },
        grid: { color: "rgba(0,0,0,0.05)" },
      },
      x: { grid: { display: false }, ticks: { color: "#6b7280" } },
    },
  };

  const statCards = [
    {
      name: "Total Orders",
      value: stats.totalOrders.toLocaleString(),
      change: "+12%",
      color: "emerald",
      icon: ShoppingCart,
      bg: "from-emerald-500 to-green-600",
    },
    {
      name: "Total Revenue",
      value: `₹${Math.round(stats.totalRevenue / 1000).toLocaleString()}K`,
      change: "+28%",
      color: "purple",
      icon: DollarSign,
      bg: "from-purple-500 to-indigo-600",
    },
    {
      name: "Total Customers",
      value: stats.totalUsers.toLocaleString(),
      change: "+8%",
      color: "blue",
      icon: Users,
      bg: "from-blue-500 to-sky-600",
    },
    {
      name: "Total Products",
      value: stats.totalProducts.toLocaleString(),
      change: "+3%",
      color: "orange",
      icon: Package,
      bg: "from-orange-500 to-red-600",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-2">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin mx-auto mb-8 shadow-2xl"></div>
          <h2 className="text-3xl font-black text-gray-900 mb-2">
            Loading Dashboard...
          </h2>
          <p className="text-xl text-gray-600">
            Fetching Fashion Basket analytics
          </p>
          <button
            onClick={handleRefresh}
            className="mt-8 px-8 py-3 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
          >
            🔄 Reload Data
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-2 sm:p-6 lg:p-4 space-y-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent mb-2">
              Dashboard Overview
            </h1>
            <p className="text-xl text-gray-600 font-medium">
              Welcome back,{" "}
              <span className="font-bold text-indigo-900">{user?.name}</span>!
              Here's what's happening in Fashion Basket
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              Refresh Data
            </button>
            <button className="px-6 py-3 bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all font-semibold flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statCards.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="group bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl hover:shadow-3xl border border-white/50 hover:border-indigo-200 hover:-translate-y-2 transition-all duration-500 cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-3">
                      {stat.name}
                    </p>
                    <p className="text-4xl md:text-3xl lg:text-4xl font-black text-gray-900 group-hover:text-indigo-900 transition-all duration-300 leading-tight">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`p-4 rounded-2xl bg-gradient-to-br ${stat.bg} shadow-2xl group-hover:scale-110 transition-all duration-500 flex-shrink-0`}
                  >
                    <Icon className="w-8 h-8 text-white drop-shadow-lg" />
                  </div>
                </div>
                <div
                  className={`mt-6 px-4 py-2.5 rounded-2xl text-xs font-bold bg-gradient-to-r from-${stat.color}-100 via-${stat.color}-200 to-${stat.color}-300 text-${stat.color}-800 shadow-lg`}
                >
                  {stat.change} from last month
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Row 1 - 12 MONTHS READY */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Revenue Bar Chart */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50 hover:shadow-3xl hover:scale-[1.01] transition-all duration-300">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-2xl">
                <DollarSign className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  Revenue Trend
                </h3>
                <p className="text-gray-600 text-sm">
                  Last 12 months performance
                </p>
              </div>
            </div>
            <div className="h-80 lg:h-96 relative">
              {chartData?.revenueData ? (
                <Bar data={chartData.revenueData} options={revenueOptions} />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">
                      Loading revenue data...
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Orders Line Chart */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50 hover:shadow-3xl hover:scale-[1.01] transition-all duration-300">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-2xl">
                <ShoppingCart className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  Orders Growth
                </h3>
                <p className="text-gray-600 text-sm">12 months order volume</p>
              </div>
            </div>
            <div className="h-80 lg:h-96 relative">
              {chartData?.ordersData ? (
                <Line data={chartData.ordersData} options={ordersOptions} />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">
                      Loading orders data...
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Charts Row 2 + Recent Orders */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Users Doughnut Chart */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50 hover:shadow-3xl hover:scale-[1.01] transition-all duration-300">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-sky-600 rounded-2xl shadow-2xl">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                Customer Analytics
              </h3>
            </div>
            <div className="h-80 flex items-center justify-center">
              {chartData?.usersData ? (
                <Doughnut data={chartData.usersData} />
              ) : (
                <div className="text-center">
                  <Users className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">
                    Loading users data...
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="xl:row-span-2 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50 hover:shadow-3xl transition-all">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-2xl">
                  <ShoppingBag className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Recent Orders ({recentOrders.length})
                  </h3>
                  <p className="text-gray-600">Latest 5 transactions</p>
                </div>
              </div>
              <button
                onClick={handleOrdersClick}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all whitespace-nowrap"
              >
                View All Orders →
              </button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {recentOrders.length > 0 ? (
                recentOrders.slice(0, 5).map((order, idx) => (
                  <div
                    key={idx}
                    className="group flex items-center justify-between p-6 bg-gradient-to-r from-slate-50 to-indigo-50 rounded-2xl hover:shadow-xl hover:-translate-y-2 hover:border-indigo-300 border border-gray-100 transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                        <span className="font-mono text-white font-bold text-sm leading-none">
                          #{order._id?.slice(-4)?.toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 text-lg truncate">
                          {order.user?.name ||
                            order.user?.email?.split("@")[0] ||
                            "Anonymous Customer"}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          ₹{order.totalAmount?.toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-4 py-2 rounded-xl text-xs font-bold shadow-sm whitespace-nowrap ${
                        order.status === "delivered"
                          ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                          : order.status === "shipped"
                            ? "bg-blue-100 text-blue-800 border-blue-200"
                            : order.status === "processing"
                              ? "bg-amber-100 text-amber-800 border-amber-200"
                              : order.status === "confirmed"
                                ? "bg-indigo-100 text-indigo-800 border-indigo-200"
                                : "bg-gray-100 text-gray-800 border-gray-200"
                      }`}
                    >
                      {order.status?.charAt(0).toUpperCase() +
                        order.status?.slice(1)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-20">
                  <Package className="w-24 h-24 text-gray-300 mx-auto mb-8 opacity-50" />
                  <h3 className="text-2xl font-bold text-gray-500 mb-2">
                    No Recent Orders
                  </h3>
                  <p className="text-gray-400">
                    Your recent orders will appear here
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
