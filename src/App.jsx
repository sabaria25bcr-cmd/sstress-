import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { initLiquidGlass } from './utils/liquidGlassKit'
import { Toaster } from 'react-hot-toast'

// Pages
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Yoga from './pages/Yoga'
import Wellness from './pages/Wellness'
import Profile from './pages/Profile'
import Admin from './pages/Admin'
import About from './pages/About'
import Gallery from './pages/Gallery'
import Developers from './pages/Developers'
import SpeakWithFrds from './pages/SpeakWithFrds'
import Support from './pages/Support'

// Components
import Navbar from './components/Navbar'

const initialPosts = [
  {
    id: '1',
    user_id: 'anonymous-user-1',
    content: "I've been feeling incredibly overwhelmed with work lately. It just never seems to end. I hope tomorrow is better.",
    feeling: 'Stressed',
    is_anonymous: true,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    likes: [{ user_id: 'mock-user-id' }, { user_id: 'another-user-id' }]
  },
  {
    id: '2',
    user_id: 'user-2',
    content: "Had a massive argument with a friend today... feeling really down and lonely.",
    feeling: 'Sad',
    is_anonymous: false,
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    likes: [{ user_id: 'mock-user-id' }]
  },
  {
    id: '3',
    user_id: 'admin-id',
    content: "Just a reminder to everyone: take a deep breath. You survived 100% of your bad days so far.",
    feeling: 'Happy',
    is_anonymous: false,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    likes: []
  }
]

function AppContent() {
  const [session, setSession] = useState(null)
  const [posts, setPosts] = useState(initialPosts)
  const location = useLocation()

  useEffect(() => {
    initLiquidGlass()
  }, [location.pathname])

  return (
    <div className="relative z-10 min-h-screen">
      <Navbar session={session} setSession={setSession} />
      <main className="container mx-auto px-4 pt-32 pb-12">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/support" element={<Support />} />
          <Route path="/developers" element={<Developers />} />
          <Route path="/speak" element={session ? <SpeakWithFrds /> : <Navigate to="/login" />} />
          <Route path="/login" element={!session ? <Login setSession={setSession} /> : <Navigate to="/dashboard" />} />
          <Route path="/signup" element={!session ? <Signup setSession={setSession} /> : <Navigate to="/dashboard" />} />

          <Route path="/dashboard" element={session ? <Dashboard session={session} posts={posts} setPosts={setPosts} /> : <Navigate to="/login" />} />
          <Route path="/yoga" element={session ? <Yoga /> : <Navigate to="/login" />} />
          <Route path="/wellness" element={<Wellness />} />
          <Route path="/profile" element={session ? <Profile session={session} posts={posts} setPosts={setPosts} /> : <Navigate to="/login" />} />
          <Route path="/admin" element={session ? <Admin session={session} posts={posts} setPosts={setPosts} /> : <Navigate to="/login" />} />
        </Routes>
      </main>

      {/* Global Toast Region for Liquid Glass Kit */}
      <div id="toast-region"></div>
      <Toaster position="bottom-right" />

      {/* Global Modal Backdrop for Liquid Glass Kit */}
      <div id="modal-backdrop" className="glass" inert="true">
        <div className="glass-modal">
          <h2 id="modal-title" className="text-2xl font-bold mb-4">Notification</h2>
          <p id="modal-desc" className="mb-6 opacity-80">Action required.</p>
          <div className="flex justify-end gap-4">
            <button id="modal-cancel" className="glass-btn">Cancel</button>
            <button id="modal-confirm" className="glass-btn bg-primary/20">Confirm</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
