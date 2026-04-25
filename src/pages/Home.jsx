import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MessageCircle, Heart, Shield, Users } from 'lucide-react'
import LiquidBackground from '../components/LiquidBackground'

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <LiquidBackground />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-5xl bg-black/40 backdrop-blur-md p-8 md:p-14 rounded-[3rem] border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.8)]"
      >
        <span className="inline-block px-5 py-2 mb-6 text-sm font-bold tracking-wider text-white border border-primary/50 bg-primary/50 rounded-full animate-pulse shadow-[0_0_15px_rgba(99,102,241,0.6)]">
          Welcome to a Safe Space
        </span>

        <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight tracking-tight text-white drop-shadow-[0_4px_4px_rgba(0,0,0,1)]">
          Share Your <span className="bg-gradient-to-r from-primary via-secondary to-pink-500 bg-clip-text text-transparent italic drop-shadow-xl">Stress.</span> <br />
          Find Your <span className="underline decoration-secondary/80 underline-offset-8">Peace.</span>
        </h1>

        <p className="text-gray-100 font-semibold text-xl md:text-2xl mb-12 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
          The Stress Sharing Platform is an anonymous community where sharing is the first step to healing.
          Speak your mind, support others, and find tranquility.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20">
          <Link
            to="/signup"
            className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-primary hover:bg-primary/90 text-white font-semibold transition-all shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 glass-btn"
          >
            Start Sharing - It's Free
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-10 py-4 rounded-2xl border border-white/10 glass-card hover:bg-white/5 text-white font-semibold transition-all hover:scale-105 active:scale-95 glass-btn text-center"
          >
            Sign In to Dashboard
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          <FeatureCard
            icon={<Shield className="text-primary" />}
            title="100% Anonymous"
            description="Your privacy is our priority. Share without the fear of judgment."
          />
          <FeatureCard
            icon={<Heart className="text-secondary" />}
            title="Support System"
            description="Connect with others who understand what you're going through."
          />
          <FeatureCard
            icon={<MessageCircle className="text-pink-500" />}
            title="Vulnerability"
            description="The first step towards emotional health is acknowledging how you feel."
          />
        </div>
      </motion.div>
    </div>
  )
}

const FeatureCard = ({ icon, title, description }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="glass-card p-8 text-center text-sm border border-white/5 cursor-pointer"
    data-toast="info"
    data-toast-title={title}
    data-toast-desc={description}
  >
    <div className="w-12 h-12 mx-auto mb-4 bg-white/5 rounded-2xl flex items-center justify-center backdrop-blur-sm">
      {icon}
    </div>
    <h3 className="text-lg font-semibold mb-2 text-white/90">{title}</h3>
    <p className="text-gray-400 leading-relaxed">{description}</p>
  </motion.div>
)

export default Home
