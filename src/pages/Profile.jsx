import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { toast } from 'react-hot-toast'
import { 
  LogOut, Edit3, User, Package, CreditCard, Phone, Crown, Calendar, Save, X, MapPin,
  Mail, ShieldCheck, Clock, ShoppingBag 
} from 'lucide-react'

const Profile = () => {
  const { user, logout, getProfile, updateProfile } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState({})

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        await getProfile()
      } catch (error) {
        console.error('Profile fetch error:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  useEffect(() => {
    if (user) {
      setEditData({
        name: user.name || '',
        email: user.email || '',
        address: user.address || {}
      })
    }
  }, [user])

  const handleEditToggle = () => {
    setEditing(!editing)
  }

  const handleSave = async () => {
    try {
      await updateProfile(editData)
      setEditing(false)
      toast.success('Profile updated successfully!')
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Failed to update profile')
    }
  }

  const handleCancel = () => {
    setEditing(false)
    if (user) {
      setEditData({
        name: user.name || '',
        email: user.email || '',
        address: user.address || {}
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50 py-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <User className="w-24 h-24 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Please login to view profile</h2>
        </div>
      </div>
    )
  }

  const userProfile = {
    name: editData.name || `User_${user.mobile?.slice(-4)}`,
    mobile: user.mobile || 'Not set',
    email: editData.email || 'Not set',
    role: user.role || 'customer',
    isVerified: user.isVerified || false,
    joined: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recent',
    totalOrders: user.totalOrders || 0
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* MAIN CONTAINER */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 overflow-hidden">
          
          {/* HEADER SECTION */}
          <div className="bg-linear-to-r from-slate-800 via-purple-900 to-slate-900 text-white py-20 px-10 relative overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-br from-transparent via-white/3 to-transparent opacity-50"></div>
            
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 items-center gap-8">
              {/* AVATAR */}
              <div className="flex justify-center lg:justify-start">
                <div className="relative group">
                  <div className="w-32 h-32 bg-linear-to-br from-white/20 to-white/10 backdrop-blur-2xl rounded-3xl flex items-center justify-center ring-8 ring-white/20 shadow-2xl border-4 border-white/30">
                    {userProfile.role === 'admin' ? (
                      <Crown className="w-20 h-20 text-yellow-300 drop-shadow-2xl" />
                    ) : (
                      <User className="w-20 h-20 text-white/90" />
                    )}
                  </div>
                  {userProfile.isVerified && (
                    <div className="absolute -bottom-3 -right-3 bg-emerald-500 p-3 rounded-2xl shadow-xl ring-4 ring-white/50">
                      <ShieldCheck className="w-6 h-6 text-white" />
                    </div>
                  )}
                </div>
              </div>

              {/* PROFILE INFO */}
              <div className="lg:col-span-2 text-center lg:text-left">
                <h1 className="text-5xl font-black bg-linear-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-4 leading-tight">
                  {userProfile.name}
                </h1>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-6">
                  <span className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-2xl font-bold text-lg border border-white/30">
                    {userProfile.role === 'admin' ? 'ADMIN' : 'PREMIUM'}
                  </span>
                  <span className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-2xl font-semibold text-lg border border-white/20">
                    <Phone className="w-5 h-5" />
                    +91 {userProfile.mobile}
                  </span>
                </div>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm font-medium opacity-90">
                  <span className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {userProfile.email === 'Not set' ? 'email@example.com' : userProfile.email}
                  </span>
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Joined {userProfile.joined}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* STATS ROW */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-10 bg-linear-to-r from-slate-50/80 to-blue-50/80 backdrop-blur-sm">
            <div className="group p-8 bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <ShoppingBag className="w-14 h-14 text-emerald-500 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
              <div className="text-4xl font-black text-gray-900 mb-2">{userProfile.totalOrders}</div>
              <div className="text-gray-600 font-semibold text-lg">Total Orders</div>
            </div>
            <div className="group p-8 bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <CreditCard className="w-14 h-14 text-blue-500 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
              <div className="text-4xl font-black text-gray-900 mb-2">₹0</div>
              <div className="text-gray-600 font-semibold text-lg">Lifetime Spend</div>
            </div>
            <div className="group p-8 bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <Clock className="w-14 h-14 text-purple-500 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
              <div className="text-4xl font-black text-purple-900 mb-2">
                {userProfile.role === 'admin' ? 'ADMIN' : 'SILVER'}
              </div>
              <div className="text-gray-600 font-semibold text-lg">Membership</div>
            </div>
          </div>

          {/* FORM SECTION */}
          <div className="p-10 lg:p-16">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-12 gap-6">
              <div className="space-y-2">
                <h2 className="text-4xl font-black text-gray-900">Account Settings</h2>
                <p className="text-xl text-gray-600 font-medium">Manage your personal information securely</p>
              </div>
              {!editing && (
                <button
                  onClick={handleEditToggle}
                  className="group flex items-center gap-3 px-10 py-5 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 whitespace-nowrap text-lg"
                >
                  <Edit3 className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
                  Edit Profile
                </button>
              )}
            </div>

            {/* PERSONAL INFO GRID */}
            <div className="grid lg:grid-cols-2 gap-8 mb-16">
              {/* LEFT COLUMN */}
              <div className="space-y-8">
                {/* NAME */}
                <div className="group">
                  <label className="flex items-center gap-3 mb-4 text-sm font-bold text-gray-700 uppercase tracking-wide">
                    <User className="w-5 h-5 text-blue-500" />
                    Full Name
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={editData.name || ''}
                      onChange={(e) => setEditData({...editData, name: e.target.value})}
                      className="w-full p-6 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white shadow-sm hover:shadow-md text-lg font-semibold"
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <div className="flex items-center p-6 bg-linear-to-r from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 shadow-sm hover:shadow-md transition-all duration-300 group-hover:bg-blue-100">
                      <User className="w-7 h-7 text-blue-500 mr-5 shrink-0" />
                      <span className="text-2xl font-bold text-gray-900">{userProfile.name}</span>
                    </div>
                  )}
                </div>

                {/* EMAIL */}
                <div className="group">
                  <label className="flex items-center gap-3 mb-4 text-sm font-bold text-gray-700 uppercase tracking-wide">
                    <Mail className="w-5 h-5 text-emerald-500" />
                    Email Address
                  </label>
                  {editing ? (
                    <input
                      type="email"
                      value={editData.email || ''}
                      onChange={(e) => setEditData({...editData, email: e.target.value})}
                      className="w-full p-6 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 bg-white shadow-sm hover:shadow-md text-lg"
                      placeholder="your.email@example.com"
                    />
                  ) : (
                    <div className="flex items-center p-6 bg-linear-to-r from-emerald-50 to-teal-50 rounded-2xl border-2 border-emerald-200 shadow-sm hover:shadow-md transition-all duration-300 group-hover:bg-emerald-100">
                      <Mail className="w-7 h-7 text-emerald-500 mr-5 shrink-0" />
                      <span className="font-semibold text-lg text-gray-900 truncate">{userProfile.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="space-y-8">
                {/* PHONE */}
                <div>
                  <label className="flex items-center gap-3 mb-4 text-sm font-bold text-gray-700 uppercase tracking-wide">
                    <Phone className="w-5 h-5 text-orange-500" />
                    Phone Number
                  </label>
                  <div className="flex items-center p-6 bg-linear-to-r from-orange-50 to-amber-50 rounded-2xl border-2 border-orange-200 shadow-sm hover:shadow-md transition-all duration-300">
                    <Phone className="w-7 h-7 text-orange-500 mr-5 shrink-0" />
                    <span className="font-mono font-bold text-xl text-gray-900">+91 {userProfile.mobile}</span>
                  </div>
                </div>

                {/* ROLE */}
                <div>
                  <label className="flex items-center gap-3 mb-4 text-sm font-bold text-gray-700 uppercase tracking-wide">
                    <ShieldCheck className="w-5 h-5 text-purple-500" />
                    Account Type
                  </label>
                  <div className="flex items-center p-6 bg-linear-to-r from-violet-50 to-purple-50 rounded-2xl border-2 border-purple-200 shadow-sm hover:shadow-md transition-all duration-300">
                    <ShieldCheck className="w-7 h-7 text-purple-500 mr-5 shrink-0" />
                    <span className="text-2xl font-bold text-purple-900 uppercase tracking-wide">{userProfile.role}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ADDRESS SECTION */}
            <div className="mb-16">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-linear-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-1">Delivery Address</h3>
                  <p className="text-xl text-gray-600 font-medium">Update your default shipping address</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {['street', 'city', 'state', 'pincode', 'landmark'].map((field) => (
                  <div key={field} className="group">
                    <label className="block text-sm font-bold text-gray-700 mb-4 capitalize tracking-wide">
                      {field.replace('_', ' ')}
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        value={editData.address?.[field] || ''}
                        onChange={(e) => setEditData({
                          ...editData,
                          address: {...editData.address, [field]: e.target.value}
                        })}
                        className="w-full p-6 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 bg-white shadow-sm hover:shadow-md text-lg font-medium"
                        placeholder={`Enter ${field.replace('_', ' ')}`}
                      />
                    ) : (
                      <div className={`p-6 rounded-2xl border-2 shadow-sm transition-all duration-300 group-hover:shadow-lg ${
                        editData.address?.[field] 
                          ? 'bg-linear-to-r from-emerald-50 to-teal-50 border-emerald-200 hover:bg-emerald-100' 
                          : 'bg-linear-to-r from-gray-50 to-slate-100 border-gray-200 hover:bg-gray-100'
                      }`}>
                        {editData.address?.[field] ? (
                          <span className="font-semibold text-gray-900">{editData.address[field]}</span>
                        ) : (
                          <span className="text-gray-500 italic flex items-center gap-2">
                            <MapPin className="w-4 h-4 opacity-50" />
                            Add {field.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ACTION BUTTONS */}
            {editing && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-16 border-t border-gray-200 bg-linear-to-r from-slate-50/50 to-blue-50/50 rounded-3xl p-10 -mx-10 lg:-mx-16 mb-10">
                <button
                  onClick={handleSave}
                  className="group bg-linear-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-600 hover:via-emerald-700 hover:to-teal-700 text-white py-8 px-12 rounded-2xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 text-xl flex items-center justify-center gap-4 h-20"
                >
                  <Save className="w-8 h-8 group-hover:scale-110 transition-transform" />
                  <span>Save All Changes</span>
                </button>
                <button
                  onClick={handleCancel}
                  className="group bg-linear-to-r from-gray-400 via-gray-500 to-gray-600 hover:from-gray-500 hover:via-gray-600 hover:to-gray-700 text-white py-8 px-12 rounded-2xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 text-xl flex items-center justify-center gap-4 h-20"
                >
                  <X className="w-8 h-8 group-hover:scale-110 transition-transform" />
                  <span>Cancel Editing</span>
                </button>
              </div>
            )}

            {/* LOGOUT SECTION */}
            {!editing && (
              <div className="pt-16 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-6 p-10 bg-linear-to-r from-rose-50 to-red-50 rounded-3xl border-2 border-rose-200">
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-2xl font-bold text-rose-900 mb-2">Ready to sign out?</h3>
                    <p className="text-lg text-rose-700">Your session will end and you'll need to login again</p>
                  </div>
                  <button 
                    onClick={logout}
                    className="flex-1 sm:w-auto bg-linear-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white py-8 px-12 rounded-2xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 text-xl flex items-center justify-center gap-4 h-20 whitespace-nowrap"
                  >
                    <LogOut className="w-8 h-8 rotate-180" />
                    <span>Sign Out Account</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
