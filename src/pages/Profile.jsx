import { useState, useMemo } from 'react'
import { User, Mail, Calendar, ClipboardList, Trash2, Loader2, Heart, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'

const Profile = ({ session, posts, setPosts }) => {
  const [deletingId, setDeletingId] = useState(null)

  const userPosts = useMemo(() => {
    return posts.filter(p => p.user_id === session.user.id)
  }, [posts, session.user.id])

  const deletePost = (id) => {
    setDeletingId(id)

    setTimeout(() => {
      setPosts(posts.filter(p => p.id !== id))
      toast.success('Post deleted')
      setDeletingId(null)
    }, 500)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 border border-white/10 flex flex-col md:flex-row items-center gap-8"
      >
        <div className="w-24 h-24 rounded-3xl bg-primary/20 border border-primary/30 flex items-center justify-center">
          <User className="text-primary" size={48} />
        </div>
        <div className="text-center md:text-left space-y-2">
          <h1 className="text-3xl font-bold text-white">Your Profile</h1>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-gray-400">
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/10 text-sm">
              <Mail size={16} />
              {session.user.email}
            </div>
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/10 text-sm">
              <Calendar size={16} />
              Joined {new Date(session.user.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Your Posts */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-3 px-2">
          <ClipboardList className="text-primary" />
          Your Contributions
          <span className="text-sm font-normal text-gray-400 bg-white/5 px-3 py-1 rounded-full border border-white/10">
            {userPosts.length}
          </span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {userPosts.map((post) => (
              <motion.div
                key={post.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="glass-card p-6 border border-white/5 hover:border-white/10 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock size={12} />
                      {formatDistanceToNow(new Date(post.created_at))} ago
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${post.feeling === 'Happy' ? 'bg-green-500/10 text-green-400' :
                        post.feeling === 'Angry' ? 'bg-red-500/10 text-red-400' :
                          post.feeling === 'Sad' ? 'bg-blue-500/10 text-blue-400' :
                            'bg-yellow-500/10 text-yellow-400'
                      }`}>
                      {post.feeling}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm italic mb-4">"{post.content}"</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2 text-red-400">
                    <Heart size={14} fill="currentColor" />
                    <span className="text-xs font-semibold">{post.likes.length} Supported</span>
                  </div>
                  <button
                    onClick={() => deletePost(post.id)}
                    disabled={deletingId === post.id}
                    className="text-gray-500 hover:text-red-400 transition-colors p-2 hover:bg-red-500/10 rounded-lg disabled:opacity-50"
                  >
                    {deletingId === post.id ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {userPosts.length === 0 && (
          <div className="text-center py-20 glass-card border-dashed border-white/10">
            <p className="text-gray-500 italic">You haven't shared any stories yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile
