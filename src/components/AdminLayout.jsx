import { useState } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'  // ✅ ADDED
import {
  BarChart3, Users, Package, ShoppingBag, User, Settings,
  LogOut, Menu, X, ChevronLeft
} from 'lucide-react'

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()  // ✅ ADDED

  const menuItems = [
    { icon: BarChart3, label: 'Dashboard', path: '/admin' },
    { icon: ShoppingBag, label: 'Orders', path: '/admin/orders' },
    { icon: Package, label: 'Products', path: '/admin/products' },
    { icon: Users, label: 'Users', path: '/admin/users' },
    { icon: User, label: 'Categories', path: '/admin/categories' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex">  {/* ✅ flex added */}

      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 z-50 p-4">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 bg-white rounded-lg shadow-lg"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Sidebar */}
      <div className={`fixed lg:static inset-0 z-40 w-72 lg:w-64 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 
      shadow-2xl lg:shadow-none transform transition-all duration-300 ease-in-out lg:translate-x-0 h-full 
      ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:block`}>

        {/* Sidebar Header */}
        <div className="p-6 border-b bg-linear-to-b from-purple-600 to-purple-700 text-white sticky top-0">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-bold flex items-center gap-2">
              👑 Admin
            </h1>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-white/20 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm opacity-90 truncate">{user?.name || 'Super Admin'}</p>
        </div>

        {/* Menu Items */}
        <nav className="p-2 flex-1 overflow-y-auto">
          {menuItems.map((item, index) => (
            <Link
              key={item.path}
              to={item.path}
              className="group flex items-center px-4 py-3 mx-2 my-1 rounded-xl text-gray-700 hover:bg-linear-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-700 transition-all duration-200 border-2 border-transparent hover:border-purple-200 font-medium relative overflow-hidden"
              onClick={() => setIsSidebarOpen(false)}
            >
              <item.icon className="w-5 h-5 mr-3 shrink-0 group-hover:scale-110 transition-transform" />
              <span className="flex-1 min-w-0">{item.label}</span>
              <div className="absolute right-2 w-2 h-8 bg-linear-to-b from-purple-400 to-pink-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300" />
            </Link>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-100 mt-auto sticky bottom-0 ">
          <button
            onClick={() => {
              logout()
              navigate('/login')
            }}
            className="w-full flex items-center gap-3 px-4 py-3 bg-linear-to-r from-red-500 to-red-600 text-white rounded-2xl hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transition-all duration-200 font-medium text-sm hover:scale-[1.02] active:scale-[0.98]"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-0 py-4 px-2 lg:py-4 overflow-auto bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Outlet />  {/* ✅ This renders Dashboard/Users/Products */}
      </div>
    </div>
  )
}

export default AdminLayout
