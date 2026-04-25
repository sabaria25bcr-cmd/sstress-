import React, { useEffect, useRef } from 'react'

const RaindropsBackground = ({ imageUrl = 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1920&q=80' }) => {
  const canvasRef = useRef(null)
  const imageRef = useRef(null)
  const raindropInstanceRef = useRef(null)

  useEffect(() => {
    let resizeTimer;
    
    // 1. Inject the raindrops script from the user's provided CDN source
    const loadScript = () => {
      return new Promise((resolve, reject) => {
        if (window.Raindrops) {
          resolve()
          return
        }
        
        const script = document.createElement("script")
        script.src = "https://fyildiz1974.github.io/web/files/raindrops.js"
        script.onload = () => resolve()
        script.onerror = reject
        document.head.appendChild(script)
      })
    }

    // 2. Initialize the visual effect applying to our refs
    const initEffect = () => {
      const canvas = canvasRef.current
      const bg = imageRef.current
      
      if (!canvas || !bg || !window.Raindrops) return

      canvas.width = window.innerWidth
      canvas.height = window.innerHeight

      const startRaindrops = () => {
        try {
          if (raindropInstanceRef.current && typeof raindropInstanceRef.current.destroy === "function") {
            raindropInstanceRef.current.destroy()
          }
          
          raindropInstanceRef.current = new window.Raindrops(canvas, canvas.width, canvas.height, {
            renderDropsOnTop: true,
            brightness: 0.9, // Dimmed slightly
            alphaMultiply: 6,
            alphaSubtract: 3,
            minR: 10,
            maxR: 40,
            rainChance: 0.35,
            rainLimit: 6,
            dropletsRate: 50,
            dropletsSize: [3, 5.5],
            trailRate: 1,
            trailScaleRange: [0.2, 0.45],
            fg: bg,
            bg: bg
          });
        } catch (error) {
          console.error("Raindrops initialization error:", error.message)
        }
      }

      if (bg.complete && bg.naturalWidth > 0) {
        startRaindrops()
      } else {
        bg.addEventListener('load', startRaindrops, { once: true })
      }
    }

    // 3. Handle responsive window changes
    const handleResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        if (canvasRef.current && window.Raindrops) {
          initEffect() // Rebuild effect on hard resize to maintain aspect ratios
        }
      }, 250)
    }

    // Execution Flow
    loadScript().then(() => {
      initEffect()
      window.addEventListener('resize', handleResize)
    }).catch(err => {
      console.warn("Failed to load raindrops script", err)
    })

    // 4. Garbage Collection on Unmount
    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(resizeTimer)
      if (raindropInstanceRef.current && typeof raindropInstanceRef.current.destroy === "function") {
        raindropInstanceRef.current.destroy()
        raindropInstanceRef.current = null
      }
    }
  }, [imageUrl]) // Re-run if the prop image ever changes

  return (
    <>
      <img 
        ref={imageRef}
        src={imageUrl} 
        alt="background texture" 
        className="fixed top-0 left-0 w-full h-full object-cover -z-20 opacity-0 pointer-events-none" 
        crossOrigin="anonymous" // Crucial for external image canvas operations
      />
      
      {/* Dynamic Raindrop Render Target */}
      <canvas 
        ref={canvasRef} 
        className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none"
      />
      
      {/* Fallback dark overlay to ensure High Contrast on internal white text over any bright image parts */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 bg-black/60 backdrop-blur-sm pointer-events-none" />
    </>
  )
}

export default RaindropsBackground
