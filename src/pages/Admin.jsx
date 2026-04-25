import { useState, useEffect, useCallback } from 'react'
import { Shield, Trash2, Users, FileText, Check, X, Search, Clock, Activity, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

const Admin = ({ session }) => {
  const [loginRequests, setLoginRequests] = useState([])
  const [users, setUsers] = useState([])
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const isAdmin = session?.user?.role === 'admin'

  // Redirect non-admins
  useEffect(() => {
    if (session && !isAdmin) {
      toast.error('Access Denied')
      navigate('/')
    }
  }, [session, isAdmin, navigate])

  const safeDate = (dateStr) => {
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return null
      return d
    } catch {
      return null
    }
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [requestsRes, usersRes, postsRes] = await Promise.all([
        supabase.from('login_requests').select('*').order('created_at', { ascending: false }),
        supabase.from('users').select('*').order('last_login', { ascending: false }),
        supabase.from('stress_posts').select('*').order('created_at', { ascending: false })
      ])

      if (requestsRes.error) throw requestsRes.error
      if (usersRes.error) throw usersRes.error
      if (postsRes.error) throw postsRes.error

      setLoginRequests(requestsRes.data)
      setUsers(usersRes.data)
      setPosts(postsRes.data)
    } catch (error) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isAdmin) return
    fetchData()

    // Real-time Subscriptions using Supabase Realtime
    const channel = supabase.channel('realtime-login-requests')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'login_requests'
        },
        (payload) => {
          console.log('Realtime update:', payload)
          fetchData()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users'
        },
        () => fetchData()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stress_posts'
        },
        () => fetchData()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [isAdmin, fetchData])

  // --- ACTIONS ---

  const handleApprove = async (request) => {
    try {
      const { error: userError } = await supabase.from('users').insert({
        email: request.email,
        password: request.password,
        role: 'user',
        approved: true,
        status: 'offline',
        last_login: new Date().toISOString()
      })
      if (userError) throw userError

      const { error: reqError } = await supabase.from('login_requests').delete().eq('id', request.id)
      if (reqError) throw reqError

      toast.success(`User ${request.email} approved`)
      fetchData()
    } catch (error) {
      toast.error('Approval failed')
    }
  }

  const handleReject = async (requestId) => {
    try {
      const { error } = await supabase.from('login_requests').delete().eq('id', requestId)
      if (error) throw error
      toast.success('Registration rejected')
      fetchData()
    } catch (error) {
      toast.error('Rejection failed')
    }
  }

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Delete this post?')) return
    try {
      const { error } = await supabase.from('stress_posts').delete().eq('id', postId)
      if (error) throw error
      toast.success('Post removed')
      fetchData()
    } catch (error) {
      toast.error('Delete failed')
    }
  }

  if (!isAdmin) return null

  return (
    <div className="min-h-screen bg-[#0B1B32] text-white p-4 md:p-8 space-y-12 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 glass-card p-8 border border-white/5 bg-white/5 animate-fade-in shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-primary/20 rounded-2xl border border-primary/30">
            <Shield className="text-primary" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">Admin Control Center</h1>
            <p className="text-gray-400 text-sm">Real-time platform oversight & moderation</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full md:w-auto">
          <StatMini icon={<Users size={16} />} label="Users" value={users.length} color="text-blue-400" />
          <StatMini icon={<Clock size={16} />} label="Pending" value={loginRequests.length} color="text-amber-400" />
          <StatMini icon={<MessageSquare size={16} />} label="Posts" value={posts.length} color="text-primary" />
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Activity className="animate-spin text-primary" size={48} />
        </div>
      )}

      {!loading && (
        <div className="space-y-12">
          {/* USER APPROVAL */}
          <Section title="Registration Requests" icon={<Clock className="text-amber-400" />} count={loginRequests.length}>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-xs uppercase text-gray-500 font-bold border-b border-white/5">
                  <tr>
                    <th className="px-6 py-4">User Email</th>
                    <th className="px-6 py-4">Request Time</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <AnimatePresence mode="popLayout">
                    {loginRequests.map((req) => (
                      <motion.tr key={req.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="group hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4 font-medium">{req.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-400">
                          {safeDate(req.created_at) ? formatDistanceToNow(safeDate(req.created_at)) + ' ago' : 'Just now'}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button onClick={() => handleApprove(req)} className="p-2 bg-green-500/10 text-green-400 hover:bg-green-500/20 rounded-xl transition-all">
                            <Check size={18} />
                          </button>
                          <button onClick={() => handleReject(req.id)} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl transition-all">
                            <X size={18} />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
              {loginRequests.length === 0 && <EmptyState text="No pending requests" />}
            </div>
          </Section>

          {/* USER MONITORING */}
          <Section title="User Monitoring" icon={<Users size={20} className="text-blue-400" />} count={users.length}>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-xs uppercase text-gray-500 font-bold border-b border-white/5">
                  <tr>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Last Login</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-medium">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${u.status === 'online' ? 'bg-green-500/10 text-green-400' : 'bg-gray-500/10 text-gray-500'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'online' ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
                          {u.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-gray-400">
                        {safeDate(u.last_login) ? formatDistanceToNow(safeDate(u.last_login)) + ' ago' : 'Never'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && <EmptyState text="No users found" />}
            </div>
          </Section>

          {/* CONTENT MODERATION */}
          <Section title="Content Moderation" icon={<Trash2 size={20} className="text-red-400" />} count={posts.length}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              <AnimatePresence mode="popLayout">
                {posts.map((post) => (
                  <motion.div key={post.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="glass-card bg-white/[0.02] border border-white/5 p-6 space-y-4 hover:border-white/10 transition-all flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-gray-400 uppercase font-bold tracking-widest">{post.user_email}</span>
                        <MoodBadge mood={post.mood} />
                      </div>
                      <p className="text-gray-200 italic line-clamp-4 leading-relaxed">"{post.content}"</p>
                    </div>
                    <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[10px] text-gray-500 flex items-center gap-1">
                        <Clock size={10} />
                        {safeDate(post.created_at) ? formatDistanceToNow(safeDate(post.created_at)) + ' ago' : 'Just now'}
                      </span>
                      <button onClick={() => handleDeletePost(post.id)} className="text-red-500 hover:text-white p-2 hover:bg-red-500 rounded-lg transition-all">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            {posts.length === 0 && <EmptyState text="No posts found" />}
          </Section>
        </div>
      )}
    </div>
  )
}

const Section = ({ title, icon, children, count }) => (
  <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card bg-white/5 border border-white/10 overflow-hidden shadow-2xl">
    <div className="px-8 py-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
      <div className="flex items-center gap-4">
        {icon}
        <h2 className="text-xl font-bold tracking-tight uppercase text-gray-300">{title}</h2>
      </div>
      <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-black text-gray-500 uppercase">{count} Entries</span>
    </div>
    {children}
  </motion.section>
)

const MoodBadge = ({ mood }) => {
  const styles = {
    sad: 'bg-blue-500/10 text-blue-400',
    happy: 'bg-green-500/10 text-green-400',
    angry: 'bg-red-500/10 text-red-400',
    stressed: 'bg-amber-500/10 text-amber-400'
  }
  return <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${styles[mood?.toLowerCase()] || 'bg-gray-500/10 text-gray-400'}`}>{mood}</span>
}

const StatMini = ({ icon, label, value, color }) => (
  <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
    <div className="flex items-center gap-2 text-gray-400 text-xs mb-1 uppercase font-bold">{icon} {label}</div>
    <div className={`text-xl font-black ${color}`}>{value}</div>
  </div>
)

const EmptyState = ({ text }) => (
  <div className="text-center py-20 text-gray-500 italic space-y-4">
    <FileText size={48} className="mx-auto opacity-20" />
    <p className="text-lg">{text}</p>
  </div>
)

export default Admin
