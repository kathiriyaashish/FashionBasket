import { useState } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { toast } from 'react-hot-toast'  // ✅ Toast notifications
import { Phone, Lock, ArrowLeft, Shield } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

const Login = () => {
  const [mobile, setMobile] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState(1) // 1=Mobile, 2=OTP
  const [error, setError] = useState('')  // ✅ Error display
  const { sendOTP, verifyOTP, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const handleSendOTP = async (e) => {
    e.preventDefault()
    setError('')  // Clear previous errors
    
    if (mobile.length !== 10) {
      toast.error('Please enter valid 10-digit mobile number')
      return
    }

    try {
      await toast.promise(sendOTP(mobile), {
        loading: 'Sending OTP...',
        success: '✅ OTP sent to your mobile!',
        error: 'Failed to send OTP'
      })
      setStep(2)
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to send OTP')
    }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    setError('')

    if (otp.length !== 6) {
      toast.error('Please enter valid 6-digit OTP')
      return
    }

    try {
      await toast.promise(verifyOTP(mobile, otp), {
        loading: 'Verifying OTP...',
        success: '🎉 Login successful!',
        error: 'Invalid or expired OTP'
      })
      toast.success('Redirecting to Dashboard...')
      setTimeout(() => navigate('/admin/dashboard'), 1000)
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed')
    }
  }

  const handleResendOTP = async () => {
    try {
      await toast.promise(sendOTP(mobile), {
        loading: 'Resending OTP...',
        success: '✅ OTP resent successfully!',
        error: 'Failed to resend OTP'
      })
    } catch (error) {
      setError(error.response?.data?.message || 'Resend failed')
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-100 via-purple-100 to-pink-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 sm:p-10 space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="w-20 h-20 bg-linear-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Admin Login
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            {step === 1 ? 'Enter mobile to get OTP' : 'Enter OTP received on mobile'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-red-100 border border-red-300 rounded-2xl text-red-800 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        {step === 1 ? (
          <form onSubmit={handleSendOTP} className="space-y-6">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Phone className="w-4 h-4 text-indigo-600" />
                Mobile Number
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/70 px-3 py-1 rounded-xl border border-gray-200 shadow-sm">
                  <span className="text-sm font-bold text-gray-700">+91</span>
                </div>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => {
                    setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))
                    setError('')
                  }}
                  maxLength={10}
                  placeholder="XXXXXXXXXX"
                  className={`w-full pl-20 pr-4 py-4 border-2 rounded-2xl text-lg font-semibold tracking-wider transition-all ${
                    mobile.length === 10 
                      ? 'border-green-400 ring-2 ring-green-200 bg-green-50' 
                      : 'border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200'
                  }`}
                />
                {mobile.length === 10 && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                We'll send 6-digit verification code via SMS
              </p>
            </div>
            
            <button 
              type="submit" 
              disabled={mobile.length !== 10 || isLoading}
              className="w-full bg-linear-to-r from-indigo-600 to-purple-600 text-white py-4 px-8 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
            >
              {isLoading ? (
                <>
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Phone className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Send OTP
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            {/* Back Button */}
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold p-2 -m-2 rounded-xl hover:bg-indigo-50 transition-all -mt-2 mb-4"
              disabled={isLoading}
            >
              <ArrowLeft className="w-4 h-4" />
              Change Number
            </button>

            {/* OTP Input */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Lock className="w-4 h-4 text-purple-600" />
                Enter OTP
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                    setError('')
                  }}
                  maxLength={6}
                  placeholder="6 DIGIT OTP"
                  className={`w-full pl-12 pr-4 py-5 border-2 rounded-2xl text-xl font-bold tracking-[0.4em] text-center uppercase transition-all ${
                    otp.length === 6 
                      ? 'border-green-400 ring-2 ring-green-200 bg-green-50' 
                      : 'border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-200'
                  }`}
                />
                {otp.length === 6 && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2 flex items-center justify-center gap-2 flex-wrap">
                <span>Didn't receive?</span>
                <button 
                  type="button" 
                  onClick={handleResendOTP}
                  disabled={isLoading}
                  className="text-indigo-600 font-bold hover:underline disabled:opacity-50"
                >
                  Resend OTP
                </button>
              </p>
            </div>
            
            <button 
              type="submit"
              disabled={otp.length !== 6 || isLoading}
              className="w-full bg-linear-to-r from-indigo-600 to-purple-600 text-white py-4 px-8 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
            >
              {isLoading ? (
                <>
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Login Securely
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="text-center pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Secure login with OTP verification. Your data is protected.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
