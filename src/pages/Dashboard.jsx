import { useState, useLayoutEffect, useRef } from 'react'
import { Send, Heart, User, UserCheck, Clock, Loader2, Smile, Frown, Angry, Meh } from 'lucide-react'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from '@studio-freight/lenis'
import SplitType from 'split-type'

gsap.registerPlugin(ScrollTrigger)

const Dashboard = ({ session, posts, setPosts }) => {
  const [content, setContent] = useState('')
  const [feeling, setFeeling] = useState('Stressed')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [loading, setLoading] = useState(false)

  const feelings = [
    { label: 'Sad', icon: <Frown size={18} className="text-blue-400" /> },
    { label: 'Angry', icon: <Angry size={18} className="text-red-400" /> },
    { label: 'Stressed', icon: <Meh size={18} className="text-yellow-400" /> },
    { label: 'Happy', icon: <Smile size={18} className="text-green-400" /> },
  ]

  const safeDate = (dateStr) => {
    try {
      if (!dateStr) return null
      const d = new Date(dateStr)
      return isNaN(d.getTime()) ? null : d
    } catch { return null }
  }

  const handlePost = async (e) => {
    e.preventDefault()
    if (!content.trim()) return

    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('stress_posts')
        .insert([{
          user_id: session.user.id,
          user_email: session.user.email,
          content,
          feeling,
          mood: feeling, // Admin panel uses 'mood'
          is_anonymous: isAnonymous,
          created_at: new Date().toISOString(),
          likes: []
        }])
        .select()

      if (error) throw error

      setPosts([data[0], ...posts])
      toast.success('Your story has been shared')
      setContent('')
    } catch (error) {
      console.error('Post failed:', error.message)
      toast.error('Failed to share story')
    } finally {
      setLoading(false)
    }
  }

  const toggleLike = (post) => {
    const isLiked = post.likes.some(l => l.user_id === session.user.id)

    const updatedPosts = posts.map(p => {
      if (p.id === post.id) {
        if (isLiked) {
          // Remove like
          return { ...p, likes: p.likes.filter(l => l.user_id !== session.user.id) }
        } else {
          // Add like
          return { ...p, likes: [...p.likes, { user_id: session.user.id }] }
        }
      }
      return p
    })

    setPosts(updatedPosts)
  }

  const containerRef = useRef()

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const lenis = new Lenis()
      lenis.on('scroll', ScrollTrigger.update)

      gsap.ticker.add((time) => {
        lenis.raf(time * 1000)
      })
      gsap.ticker.lagSmoothing(0)

      gsap.set('.image-motion', {
        transform: 'rotateX(90deg)'
      })

      gsap.to('.image-motion', {
        transform: 'rotateX(0deg)',
        scrollTrigger: {
          trigger: '.section2',
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
          markers: false
        }
      })

      gsap.fromTo('.title',
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.section3', start: 'top 80%', end: 'bottom 20%', toggleActions: 'play none none reverse' } }
      )

      gsap.fromTo('.subtitle',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.3, ease: 'power3.out', scrollTrigger: { trigger: '.section3', start: 'top 80%', end: 'bottom 20%', toggleActions: 'play none none reverse' } }
      )

      // Replace SplitText with free SplitType
      const text = new SplitType('.text', { types: 'lines' })

      gsap.fromTo(text.lines,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, stagger: 0.2, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: '.text-content', start: 'top 80%', end: 'bottom 20%', toggleActions: 'play none none reverse' } }
      )

      gsap.fromTo('.feature',
        { opacity: 0, y: 50, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, stagger: 0.2, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: '.features', start: 'top 80%', end: 'bottom 20%', toggleActions: 'play none none reverse' } }
      )

      return () => {
        lenis.destroy()
      }
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={containerRef} className="w-full relative">
      {/* Liquid generative silk background */}
      <iframe src="/silk.html" className="fixed top-0 left-0 w-full h-full -z-50 pointer-events-none opacity-60 border-0" title="Liquid Silk Setup" />

      {/* --- Intro Animation Sequence --- */}
      <div className="w-full flex flex-col items-center overflow-x-hidden pt-10 relative z-10">

        {/* Intro space to force scrolling space above section 2 */}
        <div className="min-h-[70vh] w-full flex flex-col items-center justify-center section1 text-center px-4 relative">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent opacity-90 drop-shadow-sm mb-6">
            Welcome to the Community
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl">Scroll slowly to discover your safe space.</p>
        </div>

        {/* Section 2: Image Motion */}
        <div className="section2 min-h-screen w-full flex items-center justify-center px-4" style={{ perspective: '1200px' }}>
          <div className="image-motion w-full max-w-4xl h-[60vh] rounded-[2rem] overflow-hidden shadow-[0_30px_100px_rgba(16,185,129,0.2)] border border-white/10" style={{ transformOrigin: 'center center' }}>
            <img
              src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&q=80"
              alt="Calm Yoga"
              className="w-full h-full object-cover opacity-80"
            />
          </div>
        </div>

        {/* Section 3: Title & Subtitle */}
        <div className="section3 min-h-[60vh] w-full flex flex-col items-center justify-center text-center px-4 space-y-6">
          <h2 className="title text-5xl md:text-7xl font-bold text-white tracking-tight">
            Share Your Stress
          </h2>
          <p className="subtitle text-xl text-gray-400 max-w-2xl">
            You don't have to carry it all alone. Join a community that understands, supports, and listens without judgment.
          </p>
        </div>

        {/* Text Content: SplitText Lines */}
        <div className="text-content min-h-[60vh] w-full flex items-center justify-center px-4">
          <p className="text text-3xl md:text-5xl font-medium text-gray-300 leading-relaxed max-w-4xl text-center">
            Sharing your feelings isn't a sign of weakness. It's the first courageous step toward healing and finding peace.
          </p>
        </div>

        {/* Features Stagger */}
        <div className="features min-h-[60vh] w-full flex items-center justify-center px-4 mb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl">
            {[
              { title: 'Anonymous', def: 'Share securely without revealing your identity to others.' },
              { title: 'Community', def: 'Connect with people who genuinely care and listen.' },
              { title: 'Healing', def: 'Process your complex emotions in a safe environment.' }
            ].map((f, i) => (
              <div key={i} className="feature glass rounded-3xl p-8 border border-white/10 text-center bg-white/5">
                <h3 className="text-xl font-bold text-teal-400 mb-3">{f.title}</h3>
                <p className="text-gray-400 text-sm">{f.def}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Arrow to Feed */}
        <div className="pb-32 flex flex-col items-center text-gray-400">
          <p className="mb-4 uppercase tracking-widest text-xs font-bold text-teal-500">Dive into the feed</p>
          <div className="w-[1px] h-24 bg-gradient-to-b from-teal-500 to-transparent"></div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto space-y-10 pb-20 px-4">
        {/* Post Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 border border-white/10"
        >
          <form onSubmit={handlePost} className="space-y-4">
            <textarea
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none min-h-[120px]"
              placeholder="What's bothering you? Share it here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <select
                    className="appearance-none bg-white/5 border border-white/10 rounded-lg px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all cursor-pointer"
                    value={feeling}
                    onChange={(e) => setFeeling(e.target.value)}
                  >
                    {feelings.map(f => (
                      <option key={f.label} value={f.label} className="bg-zinc-900 text-white">{f.label}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    {feelings.find(f => f.label === feeling)?.icon}
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className={`w-10 h-5 rounded-full relative transition-colors ${isAnonymous ? 'bg-primary' : 'bg-gray-600'}`}>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={isAnonymous}
                      onChange={() => setIsAnonymous(!isAnonymous)}
                    />
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isAnonymous ? 'left-6' : 'left-1'}`} />
                  </div>
                  <span className="text-sm text-gray-400 group-hover:text-white transition-colors">Anonymous</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading || !content.trim()}
                className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all disabled:opacity-50 hover:scale-105"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                Share
              </button>
            </div>
          </form>
        </motion.div>

        {/* Feed */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            Recent Stories
            <div className="h-1 flex-1 bg-gradient-to-r from-white/10 to-transparent ml-4 rounded-full" />
          </h2>

          <AnimatePresence mode="popLayout">
            {posts.map((post, idx) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="glass-card p-6 border border-white/5 hover:border-white/10 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-primary/30 transition-colors">
                      {post.is_anonymous ? <UserCheck className="text-gray-400" size={20} /> : <User className="text-primary" size={20} />}
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {post.is_anonymous ? 'Anonymous Soul' : (session.user.id === post.user_id ? 'You' : 'Community Member')}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock size={12} />
                        {safeDate(post.created_at) ? formatDistanceToNow(safeDate(post.created_at)) + ' ago' : 'Just now'}
                      </div>
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${post.feeling === 'Happy' ? 'border-green-500/20 bg-green-500/10 text-green-400' :
                      post.feeling === 'Angry' ? 'border-red-500/20 bg-red-500/10 text-red-400' :
                        post.feeling === 'Sad' ? 'border-blue-500/20 bg-blue-500/10 text-blue-400' :
                          'border-yellow-500/20 bg-yellow-500/10 text-yellow-400'
                    }`}>
                    {feelings.find(f => f.label === post.feeling)?.icon}
                    {post.feeling}
                  </div>
                </div>

                <p className="text-gray-200 leading-relaxed mb-6 whitespace-pre-wrap">{post.content}</p>

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => toggleLike(post)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${post.likes.some(l => l.user_id === session.user.id)
                        ? 'bg-red-500/20 text-red-400'
                        : 'hover:bg-white/5 text-gray-400'
                      }`}
                  >
                    <Heart size={18} fill={post.likes.some(l => l.user_id === session.user.id) ? 'currentColor' : 'none'} />
                    <span className="text-sm font-medium">{post.likes.length} Support</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {posts.length === 0 && (
            <div className="text-center py-20 glass-card">
              <p className="text-gray-400 italic">No stories yet. Be the first to share.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
