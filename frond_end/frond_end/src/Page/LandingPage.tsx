import { useState, useEffect, useRef, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowUp, Database, Code, Server, Layers, ChevronRight, Sparkles, Zap, Trophy, BookOpen } from "lucide-react"

interface Particle {
  x: number
  y: number
  originX: number
  originY: number
  vx: number
  vy: number
  size: number
  color: string
  rotation: number
  rotationSpeed: number
  shape: "circle" | "square" | "triangle" | "line"
  opacity: number
}

const CONFETTI_COLORS = [
  "#6366f1", "#8b5cf6", "#a855f7", "#d946ef",
  "#ec4899", "#f43f5e", "#3b82f6", "#06b6d4",
  "#10b981", "#f59e0b", "#ef4444", "#14b8a6",
  "#7c3aed", "#2563eb", "#db2777", "#059669",
]

function AntigravityCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const rafRef = useRef<number>(0)
  const resizeTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const PARTICLE_COUNT = 150
  const REPEL_RADIUS = 180
  const REPEL_FORCE = 8
  const RETURN_SPEED = 0.015
  const FRICTION = 0.92

  const createParticles = useCallback((w: number, h: number) => {
    const shapes: Particle["shape"][] = ["circle", "square", "triangle", "line"]
    const particles: Particle[] = []
    const totalH = Math.max(h, document.documentElement.scrollHeight)
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const x = Math.random() * w
      const y = Math.random() * totalH
      particles.push({
        x, y, originX: x, originY: y,
        vx: 0, vy: 0,
        size: 2 + Math.random() * 5,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 3,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        opacity: 0.3 + Math.random() * 0.5,
      })
    }
    return particles
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      if (particlesRef.current.length === 0) {
        particlesRef.current = createParticles(canvas.width, canvas.height)
      }
    }
    resize()

    const handleResize = () => {
      clearTimeout(resizeTimerRef.current)
      resizeTimerRef.current = setTimeout(() => {
        resize()
        particlesRef.current = createParticles(canvas.width, canvas.height)
      }, 200)
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY + window.scrollY }
    }

    const handleMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const scrollY = window.scrollY
      const mouse = mouseRef.current

      for (const p of particlesRef.current) {
        const screenY = p.y - scrollY
        if (screenY < -50 || screenY > canvas.height + 50) continue

        const dx = p.x - mouse.x
        const dy = p.y - mouse.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < REPEL_RADIUS && dist > 0) {
          const force = (REPEL_RADIUS - dist) / REPEL_RADIUS * REPEL_FORCE
          p.vx += (dx / dist) * force
          p.vy += (dy / dist) * force
        }

        p.vx += (p.originX - p.x) * RETURN_SPEED
        p.vy += (p.originY - p.y) * RETURN_SPEED

        p.vx *= FRICTION
        p.vy *= FRICTION

        p.x += p.vx
        p.y += p.vy
        p.rotation += p.rotationSpeed

        ctx.save()
        ctx.translate(p.x, screenY)
        ctx.rotate((p.rotation * Math.PI) / 180)
        ctx.globalAlpha = p.opacity
        ctx.fillStyle = p.color

        switch (p.shape) {
          case "circle":
            ctx.beginPath()
            ctx.arc(0, 0, p.size, 0, Math.PI * 2)
            ctx.fill()
            break
          case "square":
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size)
            break
          case "triangle":
            ctx.beginPath()
            ctx.moveTo(0, -p.size)
            ctx.lineTo(-p.size, p.size)
            ctx.lineTo(p.size, p.size)
            ctx.closePath()
            ctx.fill()
            break
          case "line":
            ctx.strokeStyle = p.color
            ctx.lineWidth = 2
            ctx.globalAlpha = p.opacity * 0.8
            ctx.beginPath()
            ctx.moveTo(-p.size, 0)
            ctx.lineTo(p.size, 0)
            ctx.stroke()
            break
        }
        ctx.restore()
      }

      rafRef.current = requestAnimationFrame(animate)
    }

    window.addEventListener("resize", handleResize)
    window.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseleave", handleMouseLeave)
    rafRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseleave", handleMouseLeave)
      cancelAnimationFrame(rafRef.current)
      clearTimeout(resizeTimerRef.current)
    }
  }, [createParticles])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[999]"
      style={{ mixBlendMode: "screen" }}
    />
  )
}

const sessions = [
  {
    id: 1,
    title: "SQL Basics",
    subtitle: "Foundation of Databases",
    description: "Learn SELECT, INSERT, UPDATE, DELETE and master the fundamentals of SQL queries.",
    icon: Database,
    gradient: "from-blue-500 via-indigo-500 to-purple-600",
    glow: "rgba(99,102,241,0.4)",
    topics: ["SELECT Queries", "WHERE Clause", "INSERT & UPDATE", "DELETE Operations"],
  },
  {
    id: 2,
    title: "Advanced Queries",
    subtitle: "Deep Dive into SQL",
    description: "Master JOINs, subqueries, aggregate functions and GROUP BY for complex data retrieval.",
    icon: Code,
    gradient: "from-emerald-500 via-teal-500 to-cyan-600",
    glow: "rgba(20,184,166,0.4)",
    topics: ["INNER & OUTER JOINs", "Subqueries", "Aggregate Functions", "GROUP BY & HAVING"],
  },
  {
    id: 3,
    title: "Database Design",
    subtitle: "Architect Your Data",
    description: "Understand normalization, relationships, ER diagrams and build efficient database schemas.",
    icon: Server,
    gradient: "from-orange-500 via-amber-500 to-yellow-500",
    glow: "rgba(245,158,11,0.4)",
    topics: ["Normalization", "Primary & Foreign Keys", "ER Diagrams", "Schema Design"],
  },
  {
    id: 4,
    title: "Performance & Security",
    subtitle: "Production Ready SQL",
    description: "Optimize queries with indexing, learn transactions, stored procedures and security best practices.",
    icon: Layers,
    gradient: "from-rose-500 via-pink-500 to-fuchsia-600",
    glow: "rgba(236,72,153,0.4)",
    topics: ["Indexing", "Transactions", "Stored Procedures", "SQL Injection Prevention"],
  },
]

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          let current = 0
          const step = Math.ceil(target / 60)
          const interval = setInterval(() => {
            current += step
            if (current >= target) {
              current = target
              clearInterval(interval)
            }
            setCount(current)
          }, 20)
        }
      },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target])

  return <div ref={ref}>{count}{suffix}</div>
}

export default function LandingPage() {
  const navigate = useNavigate()
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [visibleSections, setVisibleSections] = useState<Set<number>>(new Set())
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = Number(entry.target.getAttribute("data-section"))
            setVisibleSections((prev) => new Set(prev).add(id))
          }
        })
      },
      { threshold: 0.2 }
    )
    document.querySelectorAll("[data-section]").forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white overflow-x-hidden">
      <AntigravityCanvas />
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#0a0a1a]/70 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={scrollToTop}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Database size={20} className="text-white" />
            </div>
            <span className="text-xl font-black tracking-tight">
              SQL<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Master</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/login")}
              className="px-5 py-2.5 text-sm font-semibold text-white/80 hover:text-white border border-white/10 rounded-xl hover:border-white/30 hover:bg-white/5 transition-all duration-300"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate("/register")}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105 transition-all duration-300"
            >
              Register
            </button>
          </div>
        </div>
      </nav>

      <section ref={heroRef} id="hero" className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-transparent to-purple-900/20" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/30 rounded-full"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `float-particle ${5 + Math.random() * 10}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-blue-300 mb-8 animate-fade-in-down">
            <Sparkles size={14} className="animate-spin-slow" />
            <span>Start Your SQL Journey Today</span>
          </div>

          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black leading-[0.9] mb-6 animate-fade-in-up">
            Master{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 animate-gradient">
              SQL
            </span>
            <br />
            <span className="text-3xl sm:text-5xl lg:text-6xl text-white/60 font-bold">Like a Pro</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            4 structured sessions to take you from SQL beginner to database expert. Interactive lessons, real-world projects, and hands-on practice.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <button
              onClick={() => navigate("/register")}
              className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl text-lg font-bold shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300 flex items-center gap-2"
            >
              Get Started Free
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => document.getElementById("sessions")?.scrollIntoView({ behavior: "smooth" })}
              className="px-8 py-4 border border-white/10 rounded-2xl text-lg font-semibold text-white/70 hover:text-white hover:bg-white/5 hover:border-white/20 transition-all duration-300"
            >
              Explore Sessions
            </button>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
            {[
              { value: 4, suffix: "", label: "Sessions" },
              { value: 50, suffix: "+", label: "Lessons" },
              { value: 100, suffix: "%", label: "Hands-on" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-sm text-white/40 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-xs text-white/30">Scroll</span>
          <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-white/40 rounded-full animate-scroll-dot" />
          </div>
        </div>
      </section>

      <section id="sessions" className="relative py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20" data-section={0}>
            <h2 className={`text-4xl sm:text-5xl font-black mb-4 transition-all duration-1000 ${visibleSections.has(0) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
              4 Sessions to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Mastery</span>
            </h2>
            <p className={`text-white/40 text-lg max-w-xl mx-auto transition-all duration-1000 delay-200 ${visibleSections.has(0) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
              Each session builds on the last, taking you from zero to hero in SQL
            </p>
          </div>

          <div className="space-y-20">
            {sessions.map((session, idx) => {
              const Icon = session.icon
              const isVisible = visibleSections.has(session.id)
              const isEven = idx % 2 === 0

              return (
                <div
                  key={session.id}
                  data-section={session.id}
                  className={`flex flex-col ${isEven ? "lg:flex-row" : "lg:flex-row-reverse"} items-center gap-10 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"}`}
                  style={{ transitionDelay: `${idx * 100}ms` }}
                >
                  <div className="flex-1 w-full max-w-md">
                    <div
                      className="relative group rounded-3xl p-[1px] overflow-hidden"
                      style={{ background: `linear-gradient(135deg, ${session.glow}, transparent 60%)` }}
                    >
                      <div className="bg-[#12122a] rounded-3xl p-8 relative overflow-hidden">
                        <div
                          className={`absolute -top-20 -right-20 w-60 h-60 rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity duration-700 bg-gradient-to-br ${session.gradient}`}
                        />
                        <div className="absolute top-6 right-6 text-7xl font-black text-white/[0.03] select-none">
                          0{session.id}
                        </div>
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${session.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`} style={{ boxShadow: `0 10px 40px ${session.glow}` }}>
                          <Icon size={28} className="text-white" />
                        </div>
                        <div className="text-xs font-bold text-white/30 uppercase tracking-widest mb-2">
                          Session {session.id}
                        </div>
                        <h3 className="text-2xl font-black mb-1">{session.title}</h3>
                        <p className={`text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r ${session.gradient} mb-3`}>
                          {session.subtitle}
                        </p>
                        <p className="text-white/40 text-sm leading-relaxed">{session.description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 w-full max-w-md space-y-3">
                    {session.topics.map((topic, tIdx) => (
                      <div
                        key={tIdx}
                        className={`flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all duration-500 group/topic ${isVisible ? "opacity-100 translate-x-0" : isEven ? "opacity-0 translate-x-10" : "opacity-0 -translate-x-10"}`}
                        style={{ transitionDelay: `${(idx * 100) + (tIdx * 120)}ms` }}
                      >
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${session.gradient} flex items-center justify-center flex-shrink-0 opacity-60 group-hover/topic:opacity-100 group-hover/topic:scale-110 transition-all duration-300`}>
                          <span className="text-sm font-black text-white">{tIdx + 1}</span>
                        </div>
                        <span className="text-white/60 font-medium group-hover/topic:text-white/90 transition-colors duration-300">{topic}</span>
                        <ChevronRight size={16} className="ml-auto text-white/10 group-hover/topic:text-white/30 group-hover/topic:translate-x-1 transition-all duration-300" />
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="relative py-28 px-6">
        <div className="max-w-5xl mx-auto text-center" data-section={10}>
          <h2 className={`text-4xl sm:text-5xl font-black mb-16 transition-all duration-1000 ${visibleSections.has(10) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
            Why Learn{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">With Us</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: "Interactive Practice", desc: "Hands-on exercises with instant feedback", color: "from-yellow-500 to-orange-500", glow: "rgba(245,158,11,0.3)" },
              { icon: BookOpen, title: "Structured Learning", desc: "Step-by-step curriculum from basics to advanced", color: "from-blue-500 to-cyan-500", glow: "rgba(59,130,246,0.3)" },
              { icon: Trophy, title: "Track Progress", desc: "Gamified learning with scores and achievements", color: "from-purple-500 to-pink-500", glow: "rgba(168,85,247,0.3)" },
            ].map((item, i) => {
              const FIcon = item.icon
              return (
                <div
                  key={i}
                  className={`group p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all duration-700 hover:-translate-y-2 ${visibleSections.has(10) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
                  style={{ transitionDelay: `${i * 150}ms` }}
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-5 mx-auto group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`} style={{ boxShadow: `0 10px 30px ${item.glow}` }}>
                    <FIcon size={24} className="text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                  <p className="text-white/40 text-sm">{item.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="relative py-28 px-6" data-section={11}>
        <div className={`max-w-3xl mx-auto text-center transition-all duration-1000 ${visibleSections.has(11) ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
          <div className="relative p-12 rounded-[2rem] overflow-hidden border border-white/5">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-pink-600/20 blur-xl" />
            <div className="relative z-10">
              <h2 className="text-4xl sm:text-5xl font-black mb-4">
                Ready to Start?
              </h2>
              <p className="text-white/50 text-lg mb-8 max-w-md mx-auto">
                Join now and begin your journey to becoming an SQL expert.
              </p>
              <button
                onClick={() => navigate("/register")}
                className="group px-10 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl text-lg font-bold shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300 inline-flex items-center gap-2"
              >
                Get Started Free
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Database size={18} className="text-blue-400" />
            <span className="font-bold text-sm">SQLMaster</span>
          </div>
          <p className="text-xs text-white/30">© 2026 SQLMaster. All rights reserved.</p>
        </div>
      </footer>

      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 z-50 w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-2xl shadow-blue-500/40 hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center ${showScrollTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"}`}
        aria-label="Scroll to top"
      >
        <ArrowUp size={24} />
      </button>

      <style>{`
        @keyframes float-particle {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
          25% { transform: translateY(-20px) translateX(10px); opacity: 0.8; }
          50% { transform: translateY(-40px) translateX(-10px); opacity: 0.4; }
          75% { transform: translateY(-20px) translateX(15px); opacity: 0.7; }
        }
        @keyframes scroll-dot {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(12px); opacity: 0; }
        }
        .animate-scroll-dot {
          animation: scroll-dot 1.5s ease-in-out infinite;
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.8s ease-out both;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out both;
        }
        @keyframes fade-in-down {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient-shift 4s ease infinite;
        }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-spin-slow {
          animation: spin 4s linear infinite;
        }
      `}</style>
    </div>
  )
}
