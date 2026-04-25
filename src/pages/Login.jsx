import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, LogIn, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { supabase } from '../supabaseClient'

const Login = ({ setSession }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = (e) => {
    e.preventDefault()
    setLoading(true)

    // Simulate network delay for realistic UI
    setTimeout(() => {
      // Mock login credentials check
      if (email === 'admin@example.com' || password.length >= 6) {
        toast.success('Logged in successfully!')
        setSession({
          user: {
            id: email === 'admin@example.com' ? 'admin-id' : 'mock-user-id',
            email: email,
            created_at: new Date().toISOString()
          }
        })
        navigate('/dashboard')
      } else {
        toast.error('Invalid credentials (requires any email + 6 char password)')
      }
      setLoading(false)
    }, 1500)
  }

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-10 w-full max-w-md border border-white/10"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Welcome Back</h2>
          <p className="text-gray-400 mt-2">Sign in to continue sharing</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={20} />
            <input
              type="email"
              placeholder="Email"
              className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={20} />
            <input
              type="password"
              placeholder="Password (any 6+ chars)"
              className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <LogIn size={20} />}
            {loading ? 'Entering...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-8 text-gray-400 text-sm">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary hover:underline font-medium">Create one</Link>
        </p>
      </motion.div>
    </div>
  )
}

export default Login
