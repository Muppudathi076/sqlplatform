import { useNavigate } from "react-router-dom"
import {
  Star, BookOpen, Trophy, Zap, Award, Target, Crown,
  Lock, CheckCircle, PlayCircle, ChevronRight, Layers,
  Clock, BarChart2, Flame
} from "lucide-react"
import { useEffect, useState } from "react"
import { userdashboardApi } from "../auth/authapi"
import toast from "react-hot-toast"

const levelIcons = [Star, BookOpen, Trophy, Zap, Award, Target, Crown, Star, BookOpen]

const levelMetadata = [
  {
    subtitle: "Starter",
    description: "Begin your SQL journey! Learn the very basics of database concepts and simple SELECT queries.",
    topics: ["Introduction to SQL", "Basic SELECT", "WHERE clause"],
    color: { from: "#3b82f6", to: "#6366f1", glow: "rgba(99,102,241,0.4)" }
  },
  {
    subtitle: "Beginner",
    description: "Get comfortable with filtering data, ordering results, and using basic aggregate functions.",
    topics: ["ORDER BY", "LIMIT", "COUNT / SUM / AVG"],
    color: { from: "#10b981", to: "#0d9488", glow: "rgba(16,185,129,0.4)" }
  },
  {
    subtitle: "Elementary",
    description: "Unlock GROUP BY, HAVING, and start thinking about data relationships.",
    topics: ["GROUP BY", "HAVING", "DISTINCT"],
    color: { from: "#c026d3", to: "#7c3aed", glow: "rgba(192,38,211,0.4)" }
  },
  {
    subtitle: "Pre-Intermediate",
    description: "Explore JOIN operations — the heart of relational databases.",
    topics: ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN"],
    color: { from: "#f59e0b", to: "#ea580c", glow: "rgba(245,158,11,0.4)" }
  },
  {
    subtitle: "Intermediate",
    description: "Dive into subqueries and advanced filtering techniques.",
    topics: ["Subqueries", "IN / EXISTS", "CASE WHEN"],
    color: { from: "#f43f5e", to: "#be123c", glow: "rgba(244,63,94,0.4)" }
  },
  {
    subtitle: "Upper-Intermediate",
    description: "Work with window functions and complex analytical queries.",
    topics: ["ROW_NUMBER", "RANK", "PARTITION BY"],
    color: { from: "#06b6d4", to: "#0284c7", glow: "rgba(6,182,212,0.4)" }
  },
  {
    subtitle: "Advanced",
    description: "Master CTEs, recursive queries and performance tuning basics.",
    topics: ["WITH (CTE)", "Recursive CTE", "Indexes"],
    color: { from: "#84cc16", to: "#16a34a", glow: "rgba(132,204,22,0.4)" }
  },
  {
    subtitle: "Proficient",
    description: "Tackle stored procedures, triggers, and transaction control.",
    topics: ["Stored Procedures", "Triggers", "Transactions"],
    color: { from: "#8b5cf6", to: "#4f46e5", glow: "rgba(139,92,246,0.4)" }
  },
  {
    subtitle: "Mastery",
    description: "Achieve SQL mastery with optimization, partitioning and advanced design patterns.",
    topics: ["Query Optimization", "Partitioning", "Normalization"],
    color: { from: "#ec4899", to: "#be185d", glow: "rgba(236,72,153,0.4)" }
  },
]

function ModelsPage() {
  const navigate = useNavigate()
  const [completedLevels, setCompletedLevels] = useState<number[]>([])
  const [dynamicLevels, setDynamicLevels] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const token = localStorage.getItem("access_token") || ""

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await userdashboardApi(token)
        const completed: number[] = []
        if (res.table) {
          const loadedLevels = res.table.map((item: any, idx: number) => {
            const levelId = Number(item.topic.replace("Level ", ""))
            if (item.progress === "100%") {
              completed.push(levelId)
            }
            
            const meta = levelMetadata[idx % levelMetadata.length]
            return {
              id: levelId,
              title: item.topic,
              subtitle: meta.subtitle,
              sets: item.total,
              solved: item.solved,
              progressRaw: parseInt(item.progress.replace("%", "")),
              description: meta.description,
              topics: meta.topics,
              color: meta.color,
              badge: idx === 0 ? "ACTIVE" : null,
              badgeColor: idx === 0 ? "#facc15" : "",
            }
          })
          
          loadedLevels.sort((a: any, b: any) => a.id - b.id)
          setDynamicLevels(loadedLevels)
        }
        setCompletedLevels(completed)
      } catch {
        // silently ignore, show locked state
      } finally {
        setIsLoading(false)
      }
    }
    fetch()
  }, [token])

  const handlePlay = (levelId: number, isCompleted: boolean) => {
    if (isCompleted) {
      toast.success("You've already conquered this level! ", { icon: "" })
      return
    }
    navigate(`/api/modal/${levelId}`)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white transition-colors duration-500 relative overflow-x-hidden">

      {/* ── Background decorations ── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full opacity-[0.06] dark:opacity-[0.12]"
          style={{ background: "radial-gradient(circle, #6366f1, transparent 70%)" }} />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full opacity-[0.06] dark:opacity-[0.12]"
          style={{ background: "radial-gradient(circle, #ec4899, transparent 70%)" }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-10">

        {/* ── Header ── */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-500 text-xs font-bold uppercase tracking-widest mb-4">
            <Layers size={14} />
            All Modules
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            SQL Learning <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">Modules</span>
          </h1>
          <p className="mt-3 text-gray-500 dark:text-gray-400 text-sm sm:text-base max-w-xl mx-auto">
            Progress through 9 carefully crafted levels — from complete beginner to SQL master.
          </p>

          {/* Quick stats row */}
          <div className="flex justify-center gap-6 mt-6">
            {[
              { icon: Flame, label: "Levels", value: isLoading ? "-" : String(dynamicLevels.length), color: "text-orange-500" },
              { icon: BarChart2, label: "Completed", value: isLoading ? "-" : String(completedLevels.length), color: "text-green-500" },
              { icon: Clock, label: "Est. Time", value: "30h+", color: "text-blue-500" },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="flex flex-col items-center">
                <Icon size={20} className={`${color} mb-1`} />
                <p className="text-lg font-black text-slate-900 dark:text-white">{value}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Level Cards Grid ── */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20 text-gray-500 dark:text-gray-400 font-medium">
            <span className="animate-pulse">Loading modules...</span>
          </div>
        ) : dynamicLevels.length === 0 ? (
          <div className="flex justify-center items-center py-20 text-gray-500 dark:text-gray-400 font-medium">
            No active modules found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {dynamicLevels.map((level, idx) => {
            const IconComp = levelIcons[idx % levelIcons.length]
            const isCompleted = completedLevels.includes(level.id)

            // A level is locked if the previous level is not completed (except level 1)
            const isLocked = level.id > 1 && !completedLevels.includes(level.id - 1) && !isCompleted

            return (
              <div
                key={level.id}
                className="group relative rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 backdrop-blur-sm overflow-hidden transition-all duration-500 hover:-translate-y-1 shadow-sm"
                style={{
                  boxShadow: `0 0 0 1px transparent`,
                }}
                onMouseEnter={e => {
                  if (!isLocked) (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 30px ${level.color.glow}`
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 1px transparent`
                }}
              >
                {/* Top gradient strip */}
                <div
                  className="h-1.5 w-full"
                  style={{ background: `linear-gradient(90deg, ${level.color.from}, ${level.color.to})` }}
                />

                {/* Completed overlay */}
                {isCompleted && (
                  <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-green-500/15 border border-green-500/30 text-green-500 text-[10px] font-bold px-2 py-1 rounded-full">
                    <CheckCircle size={11} />
                    Completed
                  </div>
                )}

                {/* Locked overlay */}
                {isLocked && (
                  <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-gray-500/15 border border-gray-500/30 text-gray-400 text-[10px] font-bold px-2 py-1 rounded-full">
                    <Lock size={11} />
                    Locked
                  </div>
                )}

                {/* ACTIVE badge */}
                {level.badge && !isCompleted && (
                  <div
                    className="absolute top-3 right-3 z-10 text-[10px] font-black px-2 py-1 rounded-full animate-pulse"
                    style={{ background: level.badgeColor, color: "#000" }}
                  >
                    {level.badge}
                  </div>
                )}

                <div className="p-5">
                  {/* Icon + title row */}
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-500 ${!isLocked ? "group-hover:scale-110" : "grayscale opacity-50"}`}
                      style={{ background: `linear-gradient(135deg, ${level.color.from}, ${level.color.to})` }}
                    >
                      {isLocked
                        ? <Lock size={24} className="text-white" />
                        : <IconComp size={24} className="text-white" />
                      }
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-black text-slate-900 dark:text-white">{level.title}</span>
                        <span className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider border border-slate-200 dark:border-zinc-700 px-1.5 py-0.5 rounded">
                          {level.subtitle}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5 text-xs text-gray-400">
                        <BarChart2 size={12} />
                        <span>{level.sets} questions</span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className={`text-sm leading-relaxed mb-4 ${isLocked ? "text-gray-400 dark:text-gray-600" : "text-gray-600 dark:text-gray-400"}`}>
                    {level.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {level.topics.map((topic: string) => (
                      <span
                        key={topic}
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${isLocked
                          ? "border-slate-300 dark:border-zinc-700 text-slate-400 dark:text-gray-600"
                          : "border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-gray-400"
                          }`}
                      >
                        {topic}
                      </span>
                    ))}
                  </div>

                  {/* Progress bar */}
                  <div className="mb-4">
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${level.progressRaw}%`,
                          background: `linear-gradient(90deg, ${level.color.from}, ${level.color.to})`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between mt-1 text-[10px] text-gray-400">
                      <span>{level.progressRaw}% progress</span>
                      <span>{level.sets} sets</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => {
                      if (isLocked) {
                        toast.error("Complete the previous level to unlock this! 🔒")
                        return
                      }
                      handlePlay(level.id, isCompleted)
                    }}
                    disabled={isLocked}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${isLocked
                      ? "bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                      : isCompleted
                        ? "bg-green-500/10 border border-green-500/30 text-green-500 hover:bg-green-500/20"
                        : "text-white hover:brightness-110 hover:scale-[1.02] active:scale-[0.98]"
                      }`}
                    style={
                      !isLocked && !isCompleted
                        ? { background: `linear-gradient(135deg, ${level.color.from}, ${level.color.to})` }
                        : {}
                    }
                  >
                    {isLocked ? (
                      <><Lock size={15} /> Locked</>
                    ) : isCompleted ? (
                      <><CheckCircle size={15} /> Revisit Level</>
                    ) : (
                      <><PlayCircle size={15} /> Start Level <ChevronRight size={15} /></>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

        {/* ── Footer note ── */}
        <p className="text-center text-xs text-gray-400 mt-10">
          Complete each level in order to unlock the next one. Keep going! 🚀
        </p>
      </div>
    </div>
  )
}

export default ModelsPage
