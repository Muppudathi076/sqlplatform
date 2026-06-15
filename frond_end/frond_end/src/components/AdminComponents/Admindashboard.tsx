import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Users, BookOpen, Clock, Trophy,
  ArrowRight, Sparkles,
  XCircle, BarChart3, Loader2
} from "lucide-react"
import UsageChart from "../ReusableComponents/Usagechart"
import { UserGetAllApi, QuestionGetAllApi, getAdminAiInsightsApi } from "../../auth/AdminAuthApi"
import { motion, AnimatePresence } from "framer-motion"
import toast from "react-hot-toast"
import { FaTrophy } from "react-icons/fa";

function useCounter(target: number, duration = 1200, delay = 0) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (target === 0) { setCount(0); return }
    const timeout = setTimeout(() => {
      const start = performance.now()
      const tick = (now: number) => {
        const elapsed = now - start
        const progress = Math.min(elapsed / duration, 1)
        // ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3)
        setCount(Math.round(eased * target))
        if (progress < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, delay)
    return () => clearTimeout(timeout)
  }, [target, duration, delay])
  return count
}

/* ─── Stat card sub-component ─── */
function StatCard({
  title, target, color, bg, border, Icon, delay
}: {
  title: string; target: number; color: string; bg: string;
  border: string; Icon: React.ElementType; delay: number
}) {
  const count = useCounter(target, 1100, delay)

  return (
    <motion.div
      whileHover={{
        scale: 1.05,
        y: -6,
        boxShadow: `0 16px 40px ${color}33`,
      }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring" as const, stiffness: 300, damping: 22 }}
      className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${bg} ${border} p-5 bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm cursor-default transition-colors duration-300`}
    >
      {/* Floating glow blob */}
      <div
        className="absolute -top-8 -right-8 w-28 h-28 rounded-full opacity-20 blur-xl pointer-events-none"
        style={{ background: color }}
      />

      <div className="flex items-center justify-between mb-4">
        <motion.div
          className="p-2.5 rounded-xl"
          style={{ background: `${color}25` }}
          whileHover={{ rotate: [0, -10, 10, -6, 0], scale: 1.15 }}
          transition={{ duration: 0.5 }}
        >
          <Icon size={20} style={{ color }} />
        </motion.div>
<span className="text-xs bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-1 rounded-full border border-amber-200 dark:border-amber-500/20 font-medium inline-flex items-center gap-1.5">
  <FaTrophy className="text-sm" />
  <span>Live</span>
</span>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</p>

      <h2 className="text-4xl font-black mt-1 tabular-nums" style={{ color }}>
        {count}
      </h2>

      <motion.div
        className="absolute bottom-0 left-0 h-1 rounded-b-2xl"
        style={{ background: `linear-gradient(90deg, ${color}, ${color}66)` }}
        initial={{ width: 0 }}
        animate={{ width: "100%" }}
        transition={{ delay: delay / 1000 + 0.5, duration: 0.8, ease: "easeOut" }}
      />
    </motion.div>
  )
}

function AdminDashboard() {
  const token = localStorage.getItem("access_token") || ""
  const navigate = useNavigate()
  console.log("AdminDashboard token:", token) 
  const [users, setUsers] = useState<any[]>([])
  const [questions, setQuestions] = useState<any[]>([])
  const [aiInsights, setAiInsights] = useState<string>("Generating insights...")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      const token = localStorage.getItem("access_token") || ""
      try {
        const [usersRes, questionsRes, insightsRes] = await Promise.all([
          UserGetAllApi(token),
          QuestionGetAllApi(token),
          getAdminAiInsightsApi(token).catch(() => ({ insights: "Insights unavailable" }))
        ])
        const userData = Array.isArray(usersRes) ? usersRes : (usersRes?.data ?? [])
        const questionData = Array.isArray(questionsRes) ? questionsRes : (questionsRes?.data ?? [])
        setUsers(userData)
        setQuestions(questionData)
        if (insightsRes && insightsRes.insights) {
          setAiInsights(insightsRes.insights)
        }
      } catch (e) {
        console.error(e)
        toast.error("Failed to load dashboard data", { duration: 2000 })
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [token])

  /* Derived stats */
  const totalUsers = users.length
  const totalQuestions = questions.length
  const activeUsers = users.filter((u: any) => u.active !== false && u.active !== "Inactive").length
  const avgScore = totalUsers
    ? Math.round(users.reduce((s: number, u: any) => s + (parseFloat(u.score) || 0), 0) / totalUsers)
    : 0

  const cardData = [
    { title: "Total Users",     target: totalUsers,    color: "#3b82f6", bg: "from-blue-500/10 to-blue-600/5",   border: "border-blue-500/20",   Icon: Users,    delay: 0 },
    { title: "Total Questions", target: totalQuestions, color: "#22c55e", bg: "from-green-500/10 to-green-600/5", border: "border-green-500/20",  Icon: BookOpen, delay: 100 },
    { title: "Active Users",    target: activeUsers,   color: "#f59e0b", bg: "from-amber-500/10 to-amber-600/5", border: "border-amber-500/20",  Icon: Clock,    delay: 200 },
    { title: "Avg Score",       target: avgScore,      color: "#a855f7", bg: "from-purple-500/10 to-purple-600/5",border: "border-purple-500/20", Icon: Trophy,   delay: 300 },
  ]

  /* Helper to extract level number */
  const getLevelNumber = (modelStr: string) => {
    if (!modelStr) return 0;
    const match = modelStr.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  }

  /* Top 6 by level, then score */
  const topUsers = [...users]
    .sort((a, b) => {
      const levelA = getLevelNumber(a.model);
      const levelB = getLevelNumber(b.model);
      if (levelA !== levelB) return levelB - levelA;
      return (parseFloat(b.score) || 0) - (parseFloat(a.score) || 0);
    })
    .slice(0, 6)

  /* Difficulty from DB questions */
  const difficulties = ["easy", "medium", "hard"]
  const diffCounts = difficulties.map(d => ({
    label: d.charAt(0).toUpperCase() + d.slice(1),
    count: questions.filter((q: any) => q.difficulty === d).length,
    color: d === "easy" ? "#22c55e" : d === "medium" ? "#f59e0b" : "#ef4444",
  }))
  const maxDiff = Math.max(...diffCounts.map(d => d.count), 1)

  /* Chart data derived from questions */
  const modelNos: number[] = [...new Set(questions.map((q: any) => q.model_no))].sort((a, b) => a - b) as number[]
  const chartData = modelNos.slice(0, 8).map(m => ({
    label: `M${m}`,
    value: questions.filter((q: any) => q.model_no === m).length,
  }))

  const topAcademyUsers = [...users]
    .sort((a, b) => (b.sql_academy_level ?? 0) - (a.sql_academy_level ?? 0))
    .slice(0, 10)
    .map(u => ({
      label: u.name || "—",
      value: Math.min(u.sql_academy_level ?? 0, 100)
    }))

  const chartFilters = [
    { key: "models", label: "By Model", data: chartData.length ? chartData : [{ label: "No data", value: 0 }] },
    {
      key: "academy", label: "Top 10 (SQL Academy)",
      data: topAcademyUsers.length ? topAcademyUsers : [{ label: "No users", value: 0 }]
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 260, damping: 22 } },
  }

  /* Loading */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 gap-4">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
          <Loader2 size={44} className="text-blue-500" />
        </motion.div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-gray-500 dark:text-gray-400 text-sm">
          Loading dashboard…
        </motion.p>
      </div>
    )
  }

  return (
    <AnimatePresence>
      <motion.div
        className="p-5 md:p-8 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-500"
        initial="hidden"
        animate="show"
        variants={containerVariants}
      >
        {/* ── Header ── */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Admin Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
              Real-time platform overview — <span className="font-semibold text-blue-500">{totalUsers} users</span> · <span className="font-semibold text-green-500">{totalQuestions} questions</span>
            </p>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/30 cursor-default w-fit"
          >
            <BarChart3 size={16} />
            <span className="text-sm font-semibold">Live Platform</span>
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          </motion.div>
        </motion.div>

        {/* ── Stat Cards ── */}
        <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {cardData.map((card, i) => (
            <motion.div key={i} variants={itemVariants}>
              <StatCard {...card} />
            </motion.div>
          ))}
        </motion.div>

        {/* ── AI Insights ── */}
        <motion.div variants={itemVariants} className="mb-10 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={20} className="text-indigo-500" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Gemini AI Student Insights</h3>
          </div>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
            {aiInsights}
          </p>
        </motion.div>

        {/* ── Middle Row: Top Scorers + Difficulty Bars ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">

          {/* Top Scorers */}
          <motion.div variants={itemVariants} className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 transition-colors duration-500">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Top Scorers</h3>
<span className="text-xs bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-1 rounded-full border border-amber-200 dark:border-amber-500/20 font-medium inline-flex items-center gap-1">
  <div className="flex items-center justify-center w-4 h-4">
    <FaTrophy className="text-xs" />
  </div>
  <span>Live</span>
</span>            </div>
            <div className="space-y-3">
              {topUsers.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">No users yet</p>
              ) : topUsers.map((u: any, i) => (
                <motion.div
                  key={u.id || i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.07, type: "spring" as const, stiffness: 260, damping: 22 }}
                  whileHover={{ x: 4 }}
                  className="flex items-center gap-3 cursor-default"
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 
                    ${i === 0 ? "bg-amber-400 text-white shadow-md shadow-amber-300/40" : 
                      i === 1 ? "bg-slate-300 dark:bg-slate-400 text-slate-800 shadow-md shadow-slate-300/40" : 
                      i === 2 ? "bg-orange-400 text-white shadow-md shadow-orange-400/40" : 
                      i === 3 ? "bg-emerald-400 text-white shadow-md shadow-emerald-400/40" : 
                                "bg-indigo-400 text-white shadow-md shadow-indigo-400/40"}`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{u.name || "—"}</p>
                    <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          background: i === 0 ? "linear-gradient(to right, #fbbf24, #f59e0b)" : 
                                      i === 1 ? "linear-gradient(to right, #cbd5e1, #94a3b8)" : 
                                      i === 2 ? "linear-gradient(to right, #fb923c, #f97316)" : 
                                      i === 3 ? "linear-gradient(to right, #34d399, #10b981)" : 
                                                "linear-gradient(to right, #818cf8, #6366f1)"
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((parseFloat(u.score) || 0), 100)}%` }}
                        transition={{ delay: 0.4 + i * 0.08, duration: 0.7, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-black text-gray-900 dark:text-white flex-shrink-0">{u.score ?? "—"}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Difficulty Breakdown */}
          <motion.div variants={itemVariants} className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 transition-colors duration-500">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Question Difficulty Breakdown</h3>
              <button 
                onClick={() => navigate("/api/admin/modalpage")}
                className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 font-medium transition-colors cursor-pointer"
              >
                Details <ArrowRight size={12} />
              </button>
            </div>
            
            {questions.length === 0 ? (
              <div className="flex flex-col items-center py-10 gap-2 h-full justify-center">
                <XCircle size={32} className="text-gray-300 dark:text-gray-600" />
                <p className="text-sm text-gray-400">No questions in DB yet</p>
              </div>
            ) : (
              <div className="space-y-6 pt-2">
                {diffCounts.map((d, i) => (
                  <motion.div 
                    key={d.label}
                    className="relative group"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.1, type: "spring" as const, stiffness: 260, damping: 22 }}
                  >
                    <div className="flex justify-between items-end mb-2">
                      <div className="flex items-center gap-2">
                        <motion.div 
                          className="w-2 h-2 rounded-full" 
                          style={{ background: d.color }} 
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 2, delay: i * 0.4 }}
                        />
                        <span className="font-bold text-gray-800 dark:text-gray-200 text-sm tracking-wide">{d.label}</span>
                      </div>
                      <span className="text-2xl font-black tabular-nums" style={{ color: d.color }}>{d.count}</span>
                    </div>
                    
                    {/* Animated interactive bar */}
                    <motion.div 
                      className="w-full h-5 bg-gray-100 dark:bg-gray-700/60 rounded-full overflow-hidden relative cursor-crosshair"
                      whileHover={{ scaleY: 1.25, boxShadow: `0 4px 12px ${d.color}44` }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    >
                      <motion.div
                        className="h-full rounded-full relative overflow-hidden"
                        style={{ background: d.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${(d.count / maxDiff) * 100}%` }}
                        transition={{ delay: 0.4 + i * 0.12, duration: 1, ease: [0.34, 1.2, 0.64, 1] }}
                      >
                        {/* Shimmer sweep effect */}
                        <motion.div
                          className="absolute inset-0"
                          style={{
                            background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)",
                            backgroundSize: "200% 100%",
                          }}
                          animate={{ backgroundPositionX: ["-200%", "200%"] }}
                          transition={{ delay: 0.8 + i * 0.2, duration: 1.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 4 }}
                        />
                      </motion.div>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>


        {/* ── Dynamic Chart (Questions Analytics) ── */}
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors duration-500"
          whileHover={{ boxShadow: "0 8px 30px rgba(0,0,0,0.09)" }}
        >
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 size={18} className="text-blue-500" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Questions Analytics</h3>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-5 ml-6">
            Questions distribution and SQL Academy user progression
          </p>
          <UsageChart title="" filters={chartFilters} color="#3b82f6" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default AdminDashboard