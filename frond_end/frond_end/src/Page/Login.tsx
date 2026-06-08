import { useEffect, useState, useRef, useCallback } from "react"
import Validation from "../utils/validation"
import { useNavigate } from "react-router-dom"
import { loginApi } from "../auth/authapi"
import toast from "react-hot-toast"
import { Database, Mail, Lock, LogIn, Sparkles } from "lucide-react"

interface ErrorType {
  email?: string
  password?: string
}

function AnimatedBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: -1, y: -1 })
  const rafRef = useRef(0)

  interface Orb {
    x: number; y: number; r: number; vx: number; vy: number
    hue: number; alpha: number
  }

  const createOrbs = useCallback((w: number, h: number): Orb[] => {
    return Array.from({ length: 50 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 2 + Math.random() * 4,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      hue: 220 + Math.random() * 120,
      alpha: 0.3 + Math.random() * 0.5,
    }))
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    let orbs = createOrbs(canvas.width, canvas.height)
    let time = 0

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      orbs = createOrbs(canvas.width, canvas.height)
    }

    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }

    const animate = () => {
      time += 0.01
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const gradient1X = canvas.width * 0.3 + Math.sin(time * 0.7) * 200
      const gradient1Y = canvas.height * 0.4 + Math.cos(time * 0.5) * 150
      const g1 = ctx.createRadialGradient(gradient1X, gradient1Y, 0, gradient1X, gradient1Y, 350)
      g1.addColorStop(0, "rgba(99, 102, 241, 0.15)")
      g1.addColorStop(1, "transparent")
      ctx.fillStyle = g1
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const gradient2X = canvas.width * 0.7 + Math.cos(time * 0.6) * 200
      const gradient2Y = canvas.height * 0.6 + Math.sin(time * 0.8) * 150
      const g2 = ctx.createRadialGradient(gradient2X, gradient2Y, 0, gradient2X, gradient2Y, 300)
      g2.addColorStop(0, "rgba(168, 85, 247, 0.12)")
      g2.addColorStop(1, "transparent")
      ctx.fillStyle = g2
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const gradient3X = canvas.width * 0.5 + Math.sin(time * 0.4) * 300
      const gradient3Y = canvas.height * 0.3 + Math.cos(time * 0.9) * 200
      const g3 = ctx.createRadialGradient(gradient3X, gradient3Y, 0, gradient3X, gradient3Y, 250)
      g3.addColorStop(0, "rgba(6, 182, 212, 0.1)")
      g3.addColorStop(1, "transparent")
      ctx.fillStyle = g3
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const mx = mouseRef.current.x
      const my = mouseRef.current.y

      for (const orb of orbs) {
        if (mx > 0) {
          const dx = orb.x - mx
          const dy = orb.y - my
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 150 && dist > 0) {
            const force = (150 - dist) / 150 * 2
            orb.vx += (dx / dist) * force * 0.3
            orb.vy += (dy / dist) * force * 0.3
          }
        }

        orb.vx *= 0.98
        orb.vy *= 0.98
        orb.x += orb.vx
        orb.y += orb.vy

        if (orb.x < 0 || orb.x > canvas.width) orb.vx *= -1
        if (orb.y < 0 || orb.y > canvas.height) orb.vy *= -1

        ctx.beginPath()
        ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${orb.hue}, 80%, 65%, ${orb.alpha * (0.5 + 0.5 * Math.sin(time * 2 + orb.hue))})`
        ctx.shadowBlur = 15
        ctx.shadowColor = `hsla(${orb.hue}, 80%, 65%, 0.5)`
        ctx.fill()
        ctx.shadowBlur = 0

        for (const other of orbs) {
          if (other === orb) continue
          const d = Math.sqrt((orb.x - other.x) ** 2 + (orb.y - other.y) ** 2)
          if (d < 120) {
            ctx.beginPath()
            ctx.moveTo(orb.x, orb.y)
            ctx.lineTo(other.x, other.y)
            ctx.strokeStyle = `hsla(${(orb.hue + other.hue) / 2}, 70%, 60%, ${0.08 * (1 - d / 120)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      rafRef.current = requestAnimationFrame(animate)
    }

    window.addEventListener("resize", handleResize)
    window.addEventListener("mousemove", handleMouse)
    rafRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("mousemove", handleMouse)
      cancelAnimationFrame(rafRef.current)
    }
  }, [createOrbs])

  return <canvas ref={canvasRef} className="fixed inset-0 z-0" />
}

function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<ErrorType>({})
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handlesubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError({})
    const validationErrors = Validation(email, password,"","login")

    if (Object.keys(validationErrors).length > 0) {
      Object.values(validationErrors).forEach((msg) => {
        toast.error(msg)
      })
      setError(validationErrors)
      return
    }

    setIsLoading(true)
    try {
      const response = await loginApi(email, password)
      console.log("role:", response.role)
      if (response.role === "admin") {
        navigate("/api/admin/dashboard")
      } else if (response.role === "user") {
        navigate("/api/dashboard")
      }
      localStorage.setItem("access_token", response.access)
      localStorage.setItem("user", response.name)
      localStorage.setItem("email", response.admin_name)
      localStorage.setItem("role", response.role)
      toast.success("login success", { duration: 2000 })
    } catch (e) {
      console.log("erorrs :", e)
      toast.error("Something thing wrong", { duration: 2000 })
    } finally {
      setIsLoading(false)
    }
  }

  const token = localStorage.getItem("access_token")
  useEffect(() => {
    if (!token) {
      navigate("/login")
    }
  }, [])

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#060618] relative overflow-hidden">
      <AnimatedBg />

      <div
        className={`relative z-10 w-full max-w-[420px] mx-4 transition-all duration-1000 ${mounted ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"
          }`}
      >
        <div
          className="relative rounded-[2rem] p-8 sm:p-10 overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(24px)",
            boxShadow: "0 25px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-500/20 rounded-full blur-[80px] animate-pulse" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/15 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: "1s" }} />

          <div className="flex flex-col items-center mb-8">
            <div
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-4 animate-bounce"
              style={{ animationDuration: "3s" }}
            >
              <Database size={28} className="text-white" />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">
              Welcome Back
            </h2>
            <p className="text-white/40 text-sm mt-1 flex items-center gap-1">
              <Sparkles size={12} className="text-indigo-400" />
              Sign in to continue your SQL journey
            </p>
          </div>

          <form onSubmit={handlesubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white/50 uppercase tracking-wider pl-1">Email</label>
              <div className="relative group">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-indigo-400 transition-colors duration-300" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl text-white text-sm font-medium placeholder:text-white/20 outline-none transition-all duration-300 focus:ring-2 focus:ring-indigo-500/50"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                />
              </div>
              {error.email && <p className="text-red-400 text-xs pl-1">{error.email}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white/50 uppercase tracking-wider pl-1">Password</label>
              <div className="relative group">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-indigo-400 transition-colors duration-300" />
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl text-white text-sm font-medium placeholder:text-white/20 outline-none transition-all duration-300 focus:ring-2 focus:ring-indigo-500/50"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full py-3.5 rounded-xl text-white font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7)",
                boxShadow: "0 4px 25px rgba(99,102,241,0.4)",
              }}
            >
              <span
                className="absolute inset-0 opacity-0 group-hover:opacity-20 pointer-events-none transition-opacity duration-500"
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)",
                  animation: "shimmer 2s ease-in-out infinite",
                }}
              />
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={16} />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/30 text-sm">
              Don't have an account?{" "}
              <a
                href="/register"
                className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors duration-200"
              >
                Register
              </a>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  )
}
export default Login