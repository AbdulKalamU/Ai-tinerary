import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Loader2, Mail, Lock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error('Please fill in all fields')
      return
    }

    setIsLoading(true)
    try {
      await login(email, password)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-black text-white font-sans selection:bg-white selection:text-black">
      {/* Left Panel - Editorial Typography */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-black items-center justify-center p-12 border-r border-[#111]">
        <div className="relative z-10 w-full max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#737373] font-medium border border-[#333] px-4 py-2 rounded-full mb-8 inline-block">
              Welcome Back
            </span>
            <h2 className="text-6xl font-medium tracking-tighter text-white mb-6 leading-[0.95]">
              Resume your <br /> journey.
            </h2>
            <p className="text-[#A3A3A3] text-xl font-light tracking-tight max-w-sm leading-relaxed">
              Sign in to continue architecting bespoke travel itineraries.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-black">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-12">
            <h1 className="text-2xl font-medium tracking-tight text-white uppercase tracking-widest text-sm">Lumina</h1>
          </div>

          <h1 className="text-3xl font-medium tracking-tight text-white mb-2">
            Sign In
          </h1>
          <p className="text-[#737373] font-light mb-10 text-sm">
            Access your intelligent travel plans.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-[#A3A3A3] uppercase tracking-widest mb-3">
                Email or Username
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" strokeWidth={1.5} />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="traveler123 or you@example.com"
                  className="w-full px-4 py-3 pl-12 bg-transparent border-b border-[#333] text-white placeholder:text-[#555] focus:outline-none focus:border-white transition-colors text-sm rounded-none"
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#A3A3A3] uppercase tracking-widest mb-3">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" strokeWidth={1.5} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 pl-12 pr-12 bg-transparent border-b border-[#333] text-white placeholder:text-[#555] focus:outline-none focus:border-white transition-colors text-sm rounded-none"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#555] hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" strokeWidth={1.5} /> : <Eye className="w-4 h-4" strokeWidth={1.5} />}
                </button>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-white text-black py-4 rounded-full text-sm font-medium hover:scale-[1.02] transition-transform duration-300 disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>
          </form>

          <p className="text-center text-[#737373] text-sm mt-10 font-light">
            Don't have an account?{' '}
            <Link to="/register" className="text-white font-medium hover:underline transition-all">
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
