import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, UserPlus, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { supabase } from '../supabaseClient'

const Signup = ({ setSession }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    // Debugging logs before insert
    console.log("Signup attempt with:", { email, password })

    try {
      const { data, error } = await supabase
        .from("login_requests")
        .insert([
          {
            email: email,
            password: password,
            role: "user"
          }
        ])
        .select() // v2 requirement to return data

      // Debugging logs after insert
      console.log("Supabase response:", { data, error })

      if (error) {
        console.error("Signup Error:", error.message)
        toast.error("Signup Failed: " + error.message)
      } else {
        console.log("Inserted Successfully:", data)
        toast.success("Request Sent Successfully")
        navigate('/login')
      }
    } catch (err) {
      console.error("Unexpected error:", err)
      toast.error("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-10 w-full max-w-md border border-white/10"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Join Us</h2>
          <p className="text-gray-400 mt-2">Start your journey to mental clarity</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-6">
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-secondary transition-colors" size={20} />
            <input
              type="email"
              placeholder="Email"
              className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-secondary transition-colors" size={20} />
            <input
              type="password"
              placeholder="Password"
              className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-secondary hover:bg-secondary/90 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-secondary/20"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <UserPlus size={20} />}
            {loading ? 'Creating...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center mt-8 text-gray-400 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-secondary hover:underline font-medium">Sign in</Link>
        </p>
      </motion.div>
    </div>
  )
}

export default Signup
