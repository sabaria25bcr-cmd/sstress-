import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LogOut, Home, LayoutDashboard, User, Shield, Info, Image, Code, MessageCircle, Menu, X, HeartHandshake, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../supabaseClient'

// A reusable group for navigation items that supports the sliding "active pill"
const NavGroup = ({ items, onAction }) => {
  const location = useLocation()
  const [pillStyle, setPillStyle] = useState({ width: 0, transform: 'translateX(0px)', opacity: 0 })
  const containerRef = useRef(null)

  useEffect(() => {
    const updatePill = () => {
      if (!containerRef.current) return
      const activeBtn = containerRef.current.querySelector('.nav-btn.active')
      if (activeBtn) {
        setPillStyle({
          width: `${activeBtn.offsetWidth}px`,
          transform: `translateX(${activeBtn.offsetLeft}px)`,
          opacity: 1
        })
      } else {
        setPillStyle({ opacity: 0 })
      }
    }

    // Initial update + slight delay to ensure fonts/layout are loaded
    updatePill()
    setTimeout(updatePill, 50)

    window.addEventListener('resize', updatePill)
    return () => window.removeEventListener('resize', updatePill)
  }, [location.pathname, items])

  return (
    <div className="nav-items" ref={containerRef}>
      <div
        className="active-pill hidden md:block"
        style={{ ...pillStyle, transition: 'transform 0.5s cubic-bezier(0.34, 1.2, 0.64, 1), width 0.5s cubic-bezier(0.34, 1.2, 0.64, 1), opacity 0.3s ease' }}
      ></div>

      {items.map((item, idx) => {
        const isActive = location.pathname === item.to

        if (item.onClick) {
          return (
            <button
              key={idx}
              onClick={(e) => {
                if (onAction) onAction()
                item.onClick(e)
              }}
              className={`nav-btn ${isActive ? 'active' : ''}`}
            >
              {item.icon}
              <span className="hidden md:inline">{item.text}</span>
            </button>
          )
        }

        return (
          <Link
            key={idx}
            to={item.to}
            onClick={onAction}
            className={`nav-btn ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            <span className="hidden md:inline">{item.text}</span>
          </Link>
        )
      })}
    </div>
  )
}

const Navbar = ({ session, setSession }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [glarePos, setGlarePos] = useState({ x: '50%', y: '50%' })
  const navRef = useRef(null)

  const handleLogout = () => {
    setSession(null)
    setIsMobileMenuOpen(false)
    toast.success('Logged out successfully')
  }

  const handleMouseMove = (e) => {
    if (!navRef.current) return
    const rect = navRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setGlarePos({ x: `${x}px`, y: `${y}px` })
  }

  const mainLinks = [
    { to: '/', icon: <Home size={18} strokeWidth={2.5} />, text: 'Home' },
    { to: '/about', icon: <Info size={18} strokeWidth={2.5} />, text: 'About' },
    { to: '/support', icon: <HeartHandshake size={18} strokeWidth={2.5} />, text: 'Support' },
    { to: '/wellness', icon: <Search size={18} strokeWidth={2.5} />, text: 'Wellness' },
    { to: '/gallery', icon: <Image size={18} strokeWidth={2.5} />, text: 'Gallery' },
    { to: '/developers', icon: <Code size={18} strokeWidth={2.5} />, text: 'Team' },
  ]

  const userLinks = []
  if (session) {
    userLinks.push({ to: '/dashboard', icon: <LayoutDashboard size={18} strokeWidth={2} />, text: 'Dashboard' })
    userLinks.push({ to: '/profile', icon: <User size={18} strokeWidth={2} />, text: 'Profile' })
    userLinks.push({ onClick: handleLogout, icon: <LogOut size={18} strokeWidth={2} className="text-orange-400" />, text: 'Logout' })
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 px-4 py-6 pointer-events-none">
      <nav
        id="nav"
        ref={navRef}
        onMouseMove={handleMouseMove}
        className="liquid-nav mx-auto w-fit max-w-[95vw] flex items-center gap-1 px-4 py-2 pointer-events-auto"
      >
        {/* Logo */}
        <Link to="/" className="pl-2 pr-4 text-xl font-bold text-[#8B5CF6] hover:opacity-80 transition-opacity">
          Stress Sharing
        </Link>

        {/* Main Nav Group */}
        <div className="hidden md:flex items-center">
          <NavGroup items={mainLinks} />
        </div>

        {/* Action Buttons & User Group */}
        <div className="hidden md:flex items-center ml-2">
          {session ? (
            <>
              {/* Speak Button */}
              <Link
                to="/speak"
                className="mx-2 px-5 py-2 rounded-full text-sm font-bold bg-[#6366F1] hover:bg-[#5356E3] transition-all flex items-center gap-2 text-white speak-btn-glow hover:scale-105"
              >
                <MessageCircle size={18} strokeWidth={2.5} />
                Speak
              </Link>

              {/* Divider */}
              <div className="nav-divider"></div>

              {/* Slider Group for other Actions */}
              <NavGroup items={userLinks} />
            </>
          ) : (
            <div className="flex items-center gap-2 ml-4">
              <Link to="/login" className="px-5 py-2 rounded-full text-sm font-medium border border-white/10 hover:bg-white/5 transition-all text-white">
                Login
              </Link>
              <Link to="/signup" className="px-5 py-2 rounded-full text-sm font-medium bg-[#6366F1] hover:bg-[#5356E3] transition-all text-white">
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-3 text-white z-10 relative"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu Dropdown (Outside liquid nav to preserve shape) */}
      <div className={`md:hidden absolute left-4 right-4 top-24 transition-all duration-300 transform origin-top ${isMobileMenuOpen ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0 pointer-events-none'}`}>
        <div className="glass border border-white/10 rounded-2xl py-4 px-4 flex flex-col gap-4 shadow-xl">
          <div className="flex flex-col gap-2 pb-4 border-b border-white/10">
            {mainLinks.map((item, i) => (
              <Link
                key={i}
                to={item.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${location.pathname === item.to ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                {item.icon} {item.text}
              </Link>
            ))}
          </div>

          {session ? (
            <div className="flex flex-col gap-2 pt-2">
              <Link
                to="/speak"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-3 rounded-xl text-sm font-bold bg-primary text-white flex items-center gap-3 shadow-[0_0_15px_rgba(99,102,241,0.4)]"
              >
                <MessageCircle size={18} /> Speak
              </Link>
              {userLinks.map((item, i) => (
                item.onClick ? (
                  <button
                    key={i}
                    onClick={(e) => { item.onClick(e); setIsMobileMenuOpen(false) }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-red-400 hover:text-red-300 hover:bg-white/5 text-left"
                  >
                    {item.icon} {item.text}
                  </button>
                ) : (
                  <Link
                    key={i}
                    to={item.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${location.pathname === item.to ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                  >
                    {item.icon} {item.text}
                  </Link>
                )
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3 pt-2">
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="px-5 py-3 text-center rounded-xl text-sm font-medium border border-white/10 hover:bg-white/5 text-white">
                Login
              </Link>
              <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)} className="px-5 py-3 text-center rounded-xl text-sm font-medium bg-primary hover:bg-primary/80 text-white">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Navbar
