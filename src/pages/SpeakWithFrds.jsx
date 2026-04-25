import { motion } from 'framer-motion'
import { MessageCircle, Video, Users, ExternalLink } from 'lucide-react'

const SpeakWithFrds = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]"
        >
          Speak with Friends
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-gray-300 text-lg max-w-2xl mx-auto"
        >
          Sometimes the best therapy is a good conversation. Connect with real people, share your thoughts, and feel heard.
        </motion.p>
      </div>

      {/* Main CTA Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-3xl p-10 text-center border border-white/10 hover:border-indigo-500/30 transition-all"
      >
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/30">
          <Video size={36} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Start a Conversation</h2>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          Jump into a live chat with friendly people from around the world. No sign-up needed — just click and talk.
        </p>
        <a
          href="https://umingle.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-lg rounded-2xl shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all hover:scale-105 active:scale-95"
        >
          <MessageCircle size={22} />
          Start Talking
          <ExternalLink size={16} />
        </a>
      </motion.div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            icon: <MessageCircle className="text-indigo-400" size={28} />,
            title: 'Anonymous Chat',
            desc: 'Talk freely without revealing your identity. Your privacy matters.'
          },
          {
            icon: <Video className="text-purple-400" size={28} />,
            title: 'Video & Voice',
            desc: 'See and hear real people. Human connection at its finest.'
          },
          {
            icon: <Users className="text-pink-400" size={28} />,
            title: 'Safe Community',
            desc: 'Moderated conversations in a respectful, caring environment.'
          }
        ].map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            className="glass rounded-2xl p-6 border border-white/5 hover:border-white/15 transition-all text-center"
          >
            <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-4">
              {feature.icon}
            </div>
            <h3 className="text-white font-bold mb-2">{feature.title}</h3>
            <p className="text-gray-400 text-sm">{feature.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default SpeakWithFrds
