import { useState, useEffect } from 'react'
import { useAuthStore } from '../../store/useAuthStore'
import { Edit3, Trash2, X, UserPlus, Users } from 'lucide-react'

const UserManagement = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUserId, setEditingUserId] = useState(null)
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'customer'
  })

  // Filter states - ✅ FIXED STRING VALUES
  const [filterRole, setFilterRole] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const {
    getUsers, createUser, updateUser, deleteUser: apiDeleteUser, toggleUserStatus,
    isLoading: storeLoading
  } = useAuthStore()

  // ✅ Fetch from Backend API
  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const usersData = await getUsers()
      setUsers(usersData)
    } catch (error) {
      console.error('Users fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  // ✅ FIXED Filter Logic - Safe values + String status
  const filteredUsers = users.filter(user => {
    const roleMatch = filterRole === 'all' || user.role === filterRole
    const statusMatch = filterStatus === 'all' || 
      (filterStatus === 'active' && user.isActive) ||
      (filterStatus === 'inactive' && !user.isActive)
    const searchMatch = (user.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(searchQuery.toLowerCase())
    return roleMatch && statusMatch && searchMatch
  })

  // ✅ Open modal - Safe values
  const openUserModal = (user = null) => {
    if (user) {
      setUserForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || user.mobile || '',
        role: user.role || 'customer'
      })
      setEditingUserId(user.id || user._id)
    } else {
      setUserForm({ name: '', email: '', phone: '', role: 'customer' })
      setEditingUserId(null)
    }
    setIsModalOpen(true)
  }

  // ✅ Save to Backend API - REFRESH after save
  const saveUser = async () => {
    try {
      const formData = {
        name: userForm.name.trim(),
        email: userForm.email.trim() || null,  // ✅ Allow empty email
        phone: userForm.phone.trim() || null,  // ✅ Allow empty phone
        role: userForm.role
      }

      if (editingUserId) {
        await updateUser(editingUserId, formData)
      } else {
        await createUser(formData)
      }

      await fetchUsers()  // ✅ REFRESH list
      closeModal()
    } catch (error) {
      console.error('Save error:', error)
    }
  }

  // ✅ Delete from Backend API
  const deleteUser = async (id) => {
    if (window.confirm('Deactivate this user?')) {
      try {
        await apiDeleteUser(id)
        await fetchUsers()  // ✅ REFRESH list
      } catch (error) {
        console.error('Delete error:', error)
      }
    }
  }

  // ✅ Toggle Status - FIXED FUNCTION CALL
  const handleToggleStatus = async (id) => {
    try {
      await toggleUserStatus(id)
      await fetchUsers()  // ✅ REFRESH after toggle
    } catch (error) {
      console.error('Toggle error:', error)
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingUserId(null)
    setUserForm({ name: '', email: '', phone: '', role: 'customer' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-500 animate-pulse">Loading users...</div>
      </div>
    )
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-blue-100 text-blue-800'
      case 'customer': return 'bg-gray-100 text-gray-800'
      default: return 'bg-purple-100 text-purple-800'
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600 mt-1">Manage customers and admins ({users.length})</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Search by name or email..."
            className="flex-1 min-w-62.5 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
          />
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="customer">Customer</option>
          </select>
          {/* ✅ FIXED Status Filter - STRING VALUES */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button
            onClick={() => openUserModal()}
            disabled={storeLoading}
            className="px-6 py-2 bg-linear-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <UserPlus className="w-5 h-5" />
            Add User
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border">
        <p className="text-sm text-gray-600">
          Showing <span className="font-bold text-purple-600">{filteredUsers.length}</span> of{' '}
          <span className="font-bold">{users.length}</span> users
        </p>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-linear-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map(user => (
                <tr key={user._id || user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-gray-900">{user.name || 'N/A'}</td>
                  <td className="px-6 py-4 text-gray-700 max-w-xs truncate">
                    {user.email || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {user.phone || user.mobile || 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleStatus(user._id || user.id)}  // ✅ FIXED
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all shadow-sm ${
                        user.isActive
                          ? 'bg-green-100 text-green-800 hover:bg-green-200 hover:shadow-md'
                          : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 hover:shadow-md'
                      }`}
                    >
                      {user.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {user.joined || new Date(user.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openUserModal(user)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-xl transition-all hover:scale-105 shadow-sm"
                        title="Edit User"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteUser(user._id || user.id)}  // ✅ FIXED
                        className="p-2 text-red-600 hover:bg-red-100 rounded-xl transition-all hover:scale-105 shadow-sm"
                        title="Deactivate User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b bg-linear-to-r from-gray-50 to-white">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Users className="w-7 h-7 text-blue-600" />
                  {editingUserId ? 'Edit User' : 'Add New User'}
                </h3>
                <button
                  onClick={closeModal}
                  className="p-3 hover:bg-gray-200 rounded-2xl transition-all hover:scale-110"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Full Name *</label>
                <input
                  type="text"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500 focus:border-blue-300 transition-all shadow-sm text-lg"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Email (Optional)</label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  placeholder="john@example.com"
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500 focus:border-blue-300 transition-all shadow-sm text-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Phone (Optional)</label>
                <input
                  type="tel"
                  value={userForm.phone}
                  onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                  placeholder="+91 9876543210"
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500 focus:border-blue-300 transition-all shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Role *</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500 focus:border-blue-300 transition-all shadow-sm text-lg"
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="p-6 border-t bg-linear-to-r from-gray-50 to-white flex gap-3 justify-end">
              <button
                onClick={closeModal}
                className="px-8 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-2xl hover:bg-gray-100 hover:border-gray-400 transition-all shadow-sm"
              >
                Cancel
              </button>
              <button
                onClick={saveUser}
                disabled={!userForm.name?.trim() || storeLoading}  // ✅ Email optional now
                className="px-8 py-3 bg-linear-to-r from-blue-500 to-blue-600 text-white font-bold rounded-2xl hover:shadow-2xl hover:scale-[1.02] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                <UserPlus className="w-5 h-5" />
                {editingUserId ? 'Update User' : 'Add User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserManagement
