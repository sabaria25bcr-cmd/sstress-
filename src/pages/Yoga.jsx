import { motion } from 'framer-motion'
import { Play, Sparkles, Wind, Brain } from 'lucide-react'

const Yoga = () => {
  const categories = [
    { 
      id: 'yoga', 
      title: 'Yoga Flow', 
      icon: <Sparkles className="text-yellow-400" />,
      videos: [
        { id: 'v7AYKMP6rOE', title: '20 Min Morning Yoga', channel: 'Yoga With Adriene' },
        { id: '4pKly2JojMw', title: '15 Min Full Body Stretch', channel: 'MadFit' }
      ]
    },
    { 
      id: 'meditation', 
      title: 'Guided Meditation', 
      icon: <Brain className="text-purple-400" />,
      videos: [
        { id: 'inpok4MKVLM', title: '10 Min Daily Meditation', channel: 'Goodful' },
        { id: 'ZToicY62f1U', title: 'Guided Mindfulness', channel: 'Headspace' }
      ]
    },
    { 
      id: 'breathing', 
      title: 'Breathing Exercises', 
      icon: <Wind className="text-blue-400" />,
      videos: [
        { id: 'tybOi4hjZFQ', title: 'Wim Hof Method Guide', channel: 'Wim Hof' },
        { id: '8VwufJrUgcM', title: 'Box Breathing Technique', channel: 'The Art of Living' }
      ]
    }
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-12 relative z-0">
      {/* Full-screen rainy background iframe — loads the exact user-provided script */}
      <iframe
        src="/rainy.html"
        title="Rainy Background"
        className="fixed top-0 left-0 w-full h-full -z-10 border-0 pointer-events-none"
        style={{ pointerEvents: 'none' }}
      />
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">Rejuvenation Zone</h1>
        <p className="text-gray-100 font-medium text-lg drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] max-w-2xl mx-auto">Take a moment for yourself. Choose a practice that resonates with your current state of mind.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {categories.map((cat, idx) => (
          <motion.div 
            key={cat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-primary/30 transition-colors">
                {cat.icon}
              </div>
              <h2 className="text-xl font-bold text-white/90">{cat.title}</h2>
            </div>
            
            <div className="space-y-4">
              {cat.videos.map((vid) => (
                <div key={vid.id} className="relative group rounded-2xl overflow-hidden glass aspect-video border border-white/5 hover:border-white/20 transition-all cursor-pointer shadow-xl hover:shadow-primary/10">
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${vid.id}?modestbranding=1&rel=0`}
                    title={vid.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default Yoga
