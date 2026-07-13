import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, LogOut, User, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsProfileDropdownOpen(false);
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-black border-b border-[#111]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center gap-2 font-display font-medium tracking-tight text-xl text-white">
              <span className="hidden sm:block uppercase tracking-widest text-sm">Lumina</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="btn-ghost">Log In</Link>
                <Link to="/register" className="btn-primary text-sm px-4 py-2">Sign Up</Link>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/dashboard" className="btn-ghost text-[#A3A3A3] hover:text-white flex items-center gap-2">Dashboard</Link>
                <Link to="/plan/new" className="bg-white text-black px-4 py-2 rounded-full text-xs font-medium hover:bg-gray-100 transition-colors">New Trip</Link>
                
                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center space-x-2 focus:outline-none"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#111] border border-[#333] flex items-center justify-center text-sm font-medium text-[#A3A3A3] hover:text-white transition-colors">
                      {getInitials(user?.username)}
                    </div>
                    <ChevronDown className="w-4 h-4 text-[#555]" />
                  </button>

                  <AnimatePresence>
                    {isProfileDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-48 bg-black rounded-xl py-2 shadow-2xl border border-[#222] z-50"
                      >
                        <div className="px-4 py-2 border-b border-[#111]">
                          <p className="text-sm font-medium text-white truncate">{user?.username}</p>
                          <p className="text-xs text-[#737373] truncate">{user?.email}</p>
                        </div>
                        <div className="py-1">
                          <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5 flex items-center space-x-2 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Logout</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden space-x-2">
            <button
              onClick={toggleMobileMenu}
              className="p-2 text-dark-300 hover:text-white rounded-lg focus:outline-none"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-black border-t border-[#111] overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-3">
              {!isAuthenticated ? (
                <div className="flex flex-col space-y-2 mt-4">
                  <Link 
                    to="/login" 
                    className="w-full btn-secondary text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Log In
                  </Link>
                  <Link 
                    to="/register" 
                    className="w-full btn-primary text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col space-y-2 mt-2">
                  <div className="px-3 py-3 border-b border-white/5 mb-2">
                    <p className="text-base font-medium text-white">{user?.username}</p>
                    <p className="text-sm text-dark-400">{user?.email}</p>
                  </div>
                  <Link 
                    to="/dashboard" 
                    className="px-3 py-2 rounded-lg text-base font-medium text-white hover:bg-white/5"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>

                  <Link 
                    to="/plan/new" 
                    className="px-3 py-2 rounded-lg text-base font-medium text-primary-400 hover:bg-primary-500/10"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    + New Trip
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-base font-medium text-red-400 hover:bg-red-500/10 flex items-center space-x-2"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
