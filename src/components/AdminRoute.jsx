// src/components/AdminRoute.jsx
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'

const AdminRoute = ({ children }) => {
  const { user, isAdmin } = useAuthStore()
  
  // No user → Login
  if (!user) return <Navigate to="/login" replace />
  
  // User but not admin → Home  
  if (!isAdmin()) return <Navigate to="/" replace />
  
  // Admin → Allow
  return children
}

export default AdminRoute
