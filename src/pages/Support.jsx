import React, { useEffect } from 'react'
import toast from 'react-hot-toast'

const Support = () => {
  useEffect(() => {
    // --- GIVEN CODE INTEGRATION ---
    const IMAGE_SRCS = [
      "https://picsum.photos/seed/breathe/800/800",
      "https://picsum.photos/seed/calm/800/800",
      "https://picsum.photos/seed/nature/800/800",
      "https://picsum.photos/seed/help/800/800",
      "https://picsum.photos/seed/tips/800/800",
      "https://picsum.photos/seed/community/800/800"
    ];

    const IMAGE_ASPECTS = [1, 1, 1, 1, 1, 1];

    // Mapped FACE_NAMES to our support logic 
    const FACE_NAMES = [
      "BREATHING EXERCISE",
      "CALM MUSIC",
      "POSITIVE QUOTES",
      "EMERGENCY HELP",
      "DAILY TIPS",
      "SUPPORT COMMUNITY"
    ];

    const SWAP_RADIUS = 3;
    const N = IMAGE_SRCS.length;

    const stopIndex = (s) => Math.min(N - 1, Math.floor(s * (N - 1)));

    function faceAtStop(i) {
      if (i < 6) return i;
      return 1 + ((i - 2) % 4);
    }

    function buildStops(n) {
      const base = [
        { rx: 90, ry: 0 },
        { rx: 0, ry: 0 },
        { rx: 0, ry: -90 },
        { rx: 0, ry: -180 },
        { rx: 0, ry: -270 },
        { rx: -90, ry: -360 }
      ];
      const out = base.slice(0, Math.min(n, 6));
      for (let i = 6; i < n; i++) {
        out.push({ rx: 0, ry: -360 - (i - 6) * 90 });
      }
      return out;
    }

    const STOPS = buildStops(N);

    // Grab DOM Elements mapped in our component
    const dom = {
      cube: document.getElementById("cube"),
      faces: [...document.querySelectorAll(".face")],
      scrollEl: document.getElementById("scroll_container"),
      strip: document.getElementById("scene_strip"),
      hudPct: document.getElementById("hud_pct"),
      progFill: document.getElementById("prog_fill"),
      sceneName: document.getElementById("scene_name"),
      captionNum: document.getElementById("face_caption_num"),
      captionName: document.getElementById("face_caption_name")
    };

    if (!dom.cube) return;

    // We do NOT clear scrollEl.innerHTML anymore because we are rendering the sections via React JSX!
    // dom.scrollEl.innerHTML = "";
    
    dom.strip.innerHTML = "";
    for (let i = 0; i < N; i++) {
      const a = document.createElement("a");
      a.href = `#s${i}`;
      a.className = "scene-dot" + (i === 0 ? " active" : "");
      
      a.style.display = "block";
      a.style.width = "12px";
      a.style.height = "12px";
      a.style.borderRadius = "50%";
      a.style.background = i === 0 ? "#C48CB3" : "rgba(131, 166, 206, 0.3)";
      a.style.boxShadow = i === 0 ? "0 0 10px #C48CB3" : "none";
      a.style.transition = "all 0.3s ease";
      
      dom.strip.appendChild(a);
    }

    const sceneDots = [...document.querySelectorAll(".scene-dot")];
    const sections = [...document.querySelectorAll("#scroll_container section")];

    const faceImgIdx = new Array(6).fill(-1);
    let currentStop = -1;

    const imagePromises = new Map();

    const preloadImage = (src) => {
      if (imagePromises.has(src)) return imagePromises.get(src);
      const p = (async () => {
        const img = new Image();
        img.src = src;
        await img.decode().catch(() => {});
        return img;
      })();
      imagePromises.set(src, p);
      return p;
    };

    IMAGE_SRCS.forEach(preloadImage);

    async function setFaceImage(faceIdx, imgIdx, force = false) {
      if (!force && faceIdx === faceAtStop(currentStop)) return;
      if (!force && faceImgIdx[faceIdx] === imgIdx) return;
      faceImgIdx[faceIdx] = imgIdx;

      const src = IMAGE_SRCS[imgIdx];
      const face = dom.faces[faceIdx];

      await preloadImage(src);

      if (faceImgIdx[faceIdx] !== imgIdx) return;

      let img = face.querySelector("img");
      if (!img) {
        img = new Image();
        img.style.position = "absolute";
        img.style.inset = "0";
        img.style.width = "100%";
        img.style.height = "100%";
        img.style.zIndex = "-1";
        img.style.opacity = "0.7";
        img.loading = "lazy"; // Lazy load images
        face.appendChild(img);
      }
      img.alt = FACE_NAMES[imgIdx] ?? "";
      img.src = src;
      img.style.objectFit = (IMAGE_ASPECTS[imgIdx] ?? 1) !== 1 ? "contain" : "cover";
    }

    for (let i = 0; i < Math.min(N, 6); i++) {
      if (IMAGE_SRCS[i]) setFaceImage(i, i, true);
    }

    function checkImageSwaps(smooth) {
      const base = stopIndex(smooth);
      for (let offset = -SWAP_RADIUS; offset <= SWAP_RADIUS; offset++) {
        if (offset === 0) continue;
        const si = base + offset;
        if (si < 0 || si >= N) continue;
        setFaceImage(faceAtStop(si), si);
      }
    }

    let lastFaceIdx = -1;

    const updateHUD = (s) => {
      const p = Math.round(s * 100);
      const si = sectionIndexFromScroll(window.scrollY);
      currentStop = si;
      if (dom.hudPct) dom.hudPct.textContent = String(p).padStart(3, "0") + "%";
      if (dom.progFill) dom.progFill.style.height = `${p}%`;
      if (si !== lastFaceIdx) {
        lastFaceIdx = si;
        const name = FACE_NAMES[si] ?? "";
        if (dom.sceneName) dom.sceneName.textContent = name;
        if (dom.captionNum) dom.captionNum.textContent = String(si + 1).padStart(2, "0");
        if (dom.captionName) dom.captionName.textContent = name;
        sceneDots.forEach((d, i) => {
          d.style.background = i === si ? "#C48CB3" : "rgba(131, 166, 206, 0.3)";
          d.style.boxShadow = i === si ? "0 0 10px #C48CB3" : "none";
        });
      }
    };

    const easeIO = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

    const setCubeTransform = (s) => {
      if (N < 2 || STOPS.length < 2) return;
      const t = s * (N - 1);
      const i = Math.min(Math.floor(t), N - 2);
      const f = easeIO(t - i);
      const a = STOPS[i];
      const b = STOPS[i + 1];
      const rx = a.rx + (b.rx - a.rx) * f;
      const ry = a.ry + (b.ry - a.ry) * f;
      if (dom.cube) dom.cube.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    };

    let sectionTops = [];

    const buildSectionTops = () => {
      sectionTops = sections.map(
        (s) => s.getBoundingClientRect().top + window.scrollY
      );
    };

    const sectionIndexFromScroll = (y) => {
      const mid = y + window.innerHeight * 0.5;
      let idx = 0;
      for (let i = 0; i < sectionTops.length; i++) {
        if (mid >= sectionTops[i]) idx = i;
      }
      return Math.min(idx, N - 1);
    };

    let maxScroll = 1;
    let lastScrollHeight = 0;
    let lastInnerHeight = 0;

    const resize = () => {
      const h = document.documentElement.scrollHeight;
      const vh = window.innerHeight;
      if (h === lastScrollHeight && vh === lastInnerHeight) return;
      lastScrollHeight = h;
      lastInnerHeight = vh;
      maxScroll = Math.max(1, h - vh);
      buildSectionTops();
    };

    resize();

    let tgt = 0;
    let smooth = 0;
    let velocity = 0;

    const ease = 0.1;
    const dynamicFriction = (v) => (Math.abs(v) > 200 ? 0.8 : 0.9);

    const onResizeWindow = () => {
      resize();
      tgt = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      smooth = tgt;
    };
    window.addEventListener("resize", onResizeWindow);

    let resizePending = false;
    const ro = new ResizeObserver(() => {
      if (resizePending) return;
      resizePending = true;
      requestAnimationFrame(() => {
        resize();
        tgt = maxScroll > 0 ? window.scrollY / maxScroll : 0;
        smooth = tgt;
        resizePending = false;
      });
    });
    ro.observe(document.documentElement);

    const onScroll = () => {
      tgt = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      tgt = Math.max(0, Math.min(1, tgt));
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const onWheel = (e) => {
      const linePx = 16;
      const pagePx = window.innerHeight * 0.9;
      const delta =
        e.deltaMode === 1
          ? e.deltaY * linePx
          : e.deltaMode === 2
          ? e.deltaY * pagePx
          : e.deltaY;
      if (Math.abs(delta) < 5) return;
      stopAnchorAnim();
      velocity += delta;
      velocity = Math.max(-600, Math.min(600, velocity));
    };
    window.addEventListener("wheel", onWheel, { passive: false });

    let lastNow = performance.now();
    let frameId;

    const frame = (now) => {
      frameId = requestAnimationFrame(frame);

      if (document.hidden) {
        lastNow = now;
        return;
      }

      const dt = Math.min((now - lastNow) / 1000, 0.05);
      lastNow = now;

      velocity *= Math.pow(dynamicFriction(velocity), dt * 60);
      if (Math.abs(velocity) < 0.01) velocity = 0;

      const prevSmooth = smooth;

      if (Math.abs(velocity) > 0.2) {
        const next = Math.max(0, Math.min(window.scrollY + velocity * ease, maxScroll));
        window.scrollTo(0, next);
        tgt = next / maxScroll;
      }

      smooth += (tgt - smooth) * (1 - Math.exp(-dt * 8));
      smooth = Math.max(0, Math.min(1, smooth));

      // Snap to target if very close
      if (Math.abs(smooth - tgt) < 0.0001) {
        smooth = tgt;
      }

      // Only update DOM if smooth value changed
      if (smooth !== prevSmooth) {
        updateHUD(smooth);
        checkImageSwaps(smooth);
        setCubeTransform(smooth);
      }
    };

    frameId = requestAnimationFrame(frame);

    let anchorAnim = null;
    let isAnchorScrolling = false;

    const stopAnchorAnim = () => {
      if (anchorAnim) {
        cancelAnimationFrame(anchorAnim);
        anchorAnim = null;
      }
      isAnchorScrolling = false;
    };

    const easeInOutCubic = (t) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const smoothScrollToY = (targetY, duration = 900) => {
      stopAnchorAnim();
      velocity = 0;
      isAnchorScrolling = true;
      const startY = window.scrollY;
      const diff = targetY - startY;
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min(1, (now - start) / duration);
        const y = startY + diff * easeInOutCubic(p);
        window.scrollTo(0, y);
        tgt = y / maxScroll;
        smooth = tgt;
        if (p < 1) {
          anchorAnim = requestAnimationFrame(tick);
        } else {
          anchorAnim = null;
          isAnchorScrolling = false;
        }
      };
      anchorAnim = requestAnimationFrame(tick);
    };

    const onTouchStart = () => stopAnchorAnim();
    const onMouseDown = () => stopAnchorAnim();
    const onKeyDown = () => stopAnchorAnim();

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("mousedown", onMouseDown, { passive: true });
    window.addEventListener("keydown", onKeyDown);

    const onClick = (e) => {
      const a = e.target.closest('a[href^="#s"]');
      if (!a) return;
      const target = document.querySelector(a.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      const isHero = a.getAttribute("href") === "#s0";
      const idx = sections.indexOf(target);
      const baseY =
        idx >= 0
          ? sectionTops[idx]
          : target.getBoundingClientRect().top + window.scrollY;
      const extraOffset =
        window.innerWidth <= 900 && !isHero
          ? Math.max(0, target.offsetHeight - window.innerHeight)
          : 0;
      smoothScrollToY(Math.max(0, baseY + extraOffset));
    };
    document.addEventListener("click", onClick);

    // CLEANUP
    return () => {
      window.removeEventListener("resize", onResizeWindow);
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("click", onClick);
      cancelAnimationFrame(frameId);
      stopAnchorAnim();
    };
  }, []);

  return (
    <div className="relative w-full overflow-hidden">
      <style dangerouslySetInnerHTML={{__html: `
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .cube-face {
          position: absolute;
          inset: 0;
          backface-visibility: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid rgba(196,140,179,0.3);
          border-radius: 12px;
          overflow: hidden;
          background: rgba(11,27,50,0.8);
          box-shadow: 0 0 30px rgba(0,0,0,0.5) inset;
        }
        .cube-face-0 { transform: rotateX(-90deg) translateZ(180px); }
        .cube-face-1 { transform: rotateY(0deg) translateZ(180px); }
        .cube-face-2 { transform: rotateY(90deg) translateZ(180px); }
        .cube-face-3 { transform: rotateY(180deg) translateZ(180px); }
        .cube-face-4 { transform: rotateY(-90deg) translateZ(180px); }
        .cube-face-5 { transform: rotateX(90deg) translateZ(180px); }
        
        /* Disable lenis smooth scrolling globally while mounted since we custom handle scroll */
        html.lenis {
          height: auto;
        }
      `}} />

      {/* FIXED 3D CUBE CONTAINER - Placed on the right for spatial integration */}
      <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center opacity-30 md:opacity-100 md:pl-[40vw] pt-10" style={{ perspective: "1000px" }}>
        <div id="cube" className="relative w-[360px] h-[360px] preserve-3d transition-transform duration-75">
          <div className="face cube-face cube-face-0" id="face0"></div>
          <div className="face cube-face cube-face-1" id="face1"></div>
          <div className="face cube-face cube-face-2" id="face2"></div>
          <div className="face cube-face cube-face-3" id="face3"></div>
          <div className="face cube-face cube-face-4" id="face4"></div>
          <div className="face cube-face cube-face-5" id="face5"></div>
        </div>
      </div>

      {/* OVERLAYS & HUD */}
      <div className="fixed top-24 left-10 md:left-24 pointer-events-none z-40 text-lightUI">
        <h2 className="text-3xl font-black italic tracking-widest drop-shadow-md">
          <span id="face_caption_num" className="text-highlight">01</span> - <span id="face_caption_name">BREATHING EXERCISE</span>
        </h2>
      </div>

      <div className="fixed bottom-10 right-10 pointer-events-none z-50 text-highlight font-black text-4xl opacity-50">
        <span id="hud_pct">000%</span>
      </div>

      <div className="fixed left-0 top-0 w-1 h-full bg-surface z-50">
        <div id="prog_fill" className="w-full bg-highlight transition-all"></div>
      </div>

      <div id="scene_strip" className="fixed right-4 md:right-8 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-50 cursor-pointer">
        {/* Nav dots injected by JS */}
      </div>

      {/* SCROLL EXTENDER (renders actual content alongside the 3D cube) */}
      <div id="scroll_container" className="relative z-10 w-full md:w-1/2 md:pl-24 pointer-events-auto flex flex-col pt-10">
        
        <section id="s0" className="min-h-screen flex flex-col items-center justify-center text-center px-6">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-secondary via-accent to-highlight bg-clip-text text-transparent drop-shadow-md mb-6">
            You're Not Alone 💙
          </h1>
          <p className="text-lightUI/90 text-2xl font-medium max-w-xl mx-auto">
            Small steps can bring big peace. Scroll slowly to find your center.
          </p>
        </section>

        <section id="s1" className="min-h-screen flex items-center justify-center px-6">
          <div className="glass-card p-10 w-full max-w-md group overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-t from-highlight/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
            <h3 className="text-3xl font-bold text-lightUI mb-4 text-center tracking-wide">Breathing Exercise</h3>
            <p className="text-lightUI/80 text-lg text-center leading-relaxed">
              Inhale deeply for 4 seconds,<br/> hold for 4 seconds,<br/> exhale slowly for 6 seconds.<br/><br/>
              Let go of the tension.
            </p>
          </div>
        </section>

        <section id="s2" className="min-h-screen flex items-center justify-center px-6">
          <div className="glass-card p-10 w-full max-w-md group overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-t from-highlight/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
            <h3 className="text-3xl font-bold text-lightUI mb-4 text-center tracking-wide">Calm Music</h3>
            <p className="text-lightUI/80 text-lg text-center leading-relaxed">
              Listen to the gentle sounds of rain or slow instrumental waves to ground your mind and relax your heartbeat.
            </p>
          </div>
        </section>

        <section id="s3" className="min-h-screen flex items-center justify-center px-6">
          <div className="glass-card p-10 w-full max-w-md group overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-t from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
            <h3 className="text-3xl font-bold text-lightUI mb-4 text-center tracking-wide">Positive Quotes</h3>
            <p className="text-lightUI/80 text-xl italic text-center leading-relaxed font-serif">
              "Every storm runs out of rain."<br/><br/>
              Remember that this difficult moment will pass.
            </p>
          </div>
        </section>

        <section id="s4" className="min-h-screen flex items-center justify-center px-6">
          <div className="bg-gradient-to-br from-surface to-secondary/20 rounded-3xl p-10 border border-highlight/40 shadow-[0_0_30px_rgba(196,140,179,0.15)] transition-all w-full max-w-md text-center group">
            <h3 className="text-3xl font-bold text-lightUI mb-4">Emergency Help</h3>
            <p className="text-accent text-lg font-medium mb-8">
              If you feel overwhelmed, please talk to someone you trust immediately.
            </p>
            <div className="inline-block bg-black/40 backdrop-blur-sm border border-highlight/40 rounded-2xl px-8 py-4 w-full">
              <p className="text-sm text-accent uppercase tracking-wider font-bold mb-1">Helpline</p>
              <p className="text-2xl font-black text-lightUI tracking-tight">
                +91 7904442599
              </p>
            </div>
          </div>
        </section>

        <section id="s5" className="min-h-screen flex flex-col items-center justify-center px-6 gap-8">
          <div className="w-full max-w-md flex flex-col gap-4">
            <h2 className="text-2xl font-bold text-lightUI text-center mb-2">Gentle Daily Reminders</h2>
            <button 
              onClick={() => toast.success("Awesome job taking care of yourself! 💧", { icon: '💧', style: { borderRadius: '10px', background: '#333', color: '#fff' } })}
              className="glass-card p-5 border-accent/20 hover:border-highlight/50 w-full transition-all flex items-center justify-center text-lightUI font-medium text-lg btn-emotional"
            >
              &bull; Drink water
            </button>
            <button 
              onClick={() => toast.success("Breathe... A fresh mind is a calm mind 🌿", { icon: '🌿', style: { borderRadius: '10px', background: '#333', color: '#fff' } })}
              className="glass-card p-5 border-accent/20 hover:border-highlight/50 w-full transition-all flex items-center justify-center text-lightUI font-medium text-lg btn-emotional"
            >
              &bull; Take gentle breaks
            </button>
            <button 
              onClick={() => toast.success("Connecting with others shrinks problems 💙", { icon: '💙', style: { borderRadius: '10px', background: '#333', color: '#fff' } })}
              className="glass-card p-5 border-accent/20 hover:border-highlight/50 w-full transition-all flex items-center justify-center text-lightUI font-medium text-lg btn-emotional"
            >
              &bull; Talk to someone
            </button>
          </div>
          <div className="mt-8">
            <p className="text-2xl font-medium text-lightUI/80 italic text-center px-4 leading-relaxed">
              "Your feelings are valid. Healing takes time."
            </p>
          </div>
        </section>

      </div>
    </div>
  )
}

export default Support
