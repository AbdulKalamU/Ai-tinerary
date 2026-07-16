import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Loader2, Mail, Lock, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Register() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const { register } = useAuth()
  const navigate = useNavigate()

  const calculatePasswordStrength = (pass) => {
    if (pass.length === 0) return 0;
    let strength = 0;
    if (pass.length >= 8) strength += 25;
    if (/[A-Z]/.test(pass)) strength += 25;
    if (/[a-z]/.test(pass)) strength += 25;
    if (/[0-9!@#$%^&*]/.test(pass)) strength += 25;
    return strength;
  };

  const strength = calculatePasswordStrength(password);
  const getStrengthColor = (score) => {
    if (score === 0) return 'bg-dark-700';
    if (score <= 25) return 'bg-red-500';
    if (score <= 50) return 'bg-amber-500';
    if (score <= 75) return 'bg-cyan-500';
    return 'bg-emerald-500';
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!username || !email || !password) {
      toast.error('Please fill in all fields')
      return
    }
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)
    try {
      await register(username, email, password)
      toast.success('Account created successfully!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.message || 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-black text-white font-sans selection:bg-white selection:text-black">
      {/* Left Panel - Editorial Typography */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-12 border-r border-[#111]">
        {/* Background Image with Dark Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?q=80&w=2069&auto=format&fit=crop')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/80 z-0"></div>
        <div className="relative z-10 w-full max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#737373] font-medium border border-[#333] px-4 py-2 rounded-full mb-8 inline-block">
              Onboarding
            </span>
            <h2 className="text-6xl font-medium tracking-tighter text-white mb-6 leading-[0.95]">
              Begin your <br /> journey.
            </h2>
            <p className="text-[#A3A3A3] text-xl font-light tracking-tight max-w-sm leading-relaxed">
              Create an account to architect bespoke travel itineraries.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Register Form */}
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
            Create Account
          </h1>
          <p className="text-[#737373] font-light mb-10 text-sm">
            Join Lumina to unlock intelligent travel planning.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-[#A3A3A3] uppercase tracking-widest mb-3">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" strokeWidth={1.5} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="traveler123"
                  className="w-full px-4 py-3 pl-12 bg-transparent border-b border-[#333] text-white placeholder:text-[#555] focus:outline-none focus:border-white transition-colors text-sm rounded-none"
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#A3A3A3] uppercase tracking-widest mb-3">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" strokeWidth={1.5} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 pl-12 bg-transparent border-b border-[#333] text-white placeholder:text-[#555] focus:outline-none focus:border-white transition-colors text-sm rounded-none"
                  autoComplete="email"
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
                  placeholder="Create a password"
                  className="w-full px-4 py-3 pl-12 pr-12 bg-transparent border-b border-[#333] text-white placeholder:text-[#555] focus:outline-none focus:border-white transition-colors text-sm rounded-none"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#555] hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" strokeWidth={1.5} /> : <Eye className="w-4 h-4" strokeWidth={1.5} />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              <div className="mt-3 flex gap-1 h-0.5">
                {[25, 50, 75, 100].map((step) => (
                  <div 
                    key={step} 
                    className={`flex-1 transition-colors duration-300 ${
                      strength >= step ? getStrengthColor(strength) : 'bg-[#222]'
                    }`} 
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#A3A3A3] uppercase tracking-widest mb-3">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" strokeWidth={1.5} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="w-full px-4 py-3 pl-12 bg-transparent border-b border-[#333] text-white placeholder:text-[#555] focus:outline-none focus:border-white transition-colors text-sm rounded-none"
                  autoComplete="new-password"
                />
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
                    Creating account...
                  </>
                ) : (
                  'Sign Up'
                )}
              </button>
            </div>
          </form>

          <p className="text-center text-[#737373] text-sm mt-10 font-light">
            Already have an account?{' '}
            <Link to="/login" className="text-white font-medium hover:underline transition-all">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
