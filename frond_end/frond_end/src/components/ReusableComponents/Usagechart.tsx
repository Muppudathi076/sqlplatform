import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

type ChartItem = {
  label: string
  value: number
}

interface FilterOption {
  key: string
  label: string
  data: ChartItem[]
}

interface ReusableChartProps {
  title: string
  filters: FilterOption[]
  color?: string
  height?: number
}

const PALETTES = [
  { from: "#6366f1", to: "#8b5cf6" },
  { from: "#3b82f6", to: "#06b6d4" },
  { from: "#f59e0b", to: "#ef4444" },
  { from: "#22c55e", to: "#10b981" },
  { from: "#ec4899", to: "#a855f7" },
  { from: "#14b8a6", to: "#6366f1" },
  { from: "#f97316", to: "#eab308" },
]

export default function UsageChart({
  title,
  filters,
  height = 260,
}: ReusableChartProps) {
  const [selectedFilter, setSelectedFilter] = useState(filters[0]?.key)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const activeData =
    filters.find((item) => item.key === selectedFilter)?.data || []

  const maxValue = Math.max(...activeData.map((d) => d.value), 1)
  const total = activeData.reduce((a, b) => a + b.value, 0)

  return (
    <div>
      {/* Header */}
      {(title || filters.length > 1) && (
        <div className="flex items-center justify-between mb-6">
          {title && (
            <h3 className="text-base font-bold text-gray-900 dark:text-white">{title}</h3>
          )}
          {filters.length > 1 && (
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-700/60 p-1 rounded-xl">
              {filters.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setSelectedFilter(f.key)}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-300 ${
                    selectedFilter === f.key
                      ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Chart — Vertical column bars */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedFilter}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          style={{ height: height + 60 }}
          className="flex flex-row items-end justify-around gap-2 overflow-x-auto pb-4 pt-8 custom-scrollbar scroll-smooth w-full"
        >
          {activeData.map((item, i) => {
            const pct = (item.value / maxValue) * 100
            const sharePct = total > 0 ? ((item.value / total) * 100).toFixed(1) : "0"
            const palette = PALETTES[i % PALETTES.length]
            const isHovered = hoveredIndex === i

            return (
              <motion.div
                key={`${selectedFilter}-${i}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: i * 0.07,
                  type: "spring" as const,
                  stiffness: 260,
                  damping: 22,
                }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="group cursor-default flex-1 flex flex-col items-center gap-2 min-w-[60px] max-w-[100px] h-full justify-end"
              >
                {/* Value row (top) */}
                <div className="flex flex-col items-center gap-1 min-h-[40px] justify-end relative">
                  <AnimatePresence>
                    {isHovered && (
                      <motion.span
                        initial={{ opacity: 0, y: 5, scale: 0.9 }}
                        animate={{ opacity: 1, y: -5, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.9 }}
                        className="absolute bottom-6 text-xs font-bold px-2 py-1 rounded-md text-white whitespace-nowrap z-10 shadow-lg"
                        style={{ background: `linear-gradient(135deg, ${palette.from}, ${palette.to})` }}
                      >
                        {sharePct}%
                        {/* Tooltip arrow */}
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45" style={{ background: palette.to }}></div>
                      </motion.span>
                    )}
                  </AnimatePresence>
                  <span className={`text-sm font-bold transition-colors duration-300 ${isHovered ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'} mt-auto`}>
                    {item.value}
                  </span>
                </div>

                {/* Vertical Bar (No empty track) */}
                <div className="relative w-10 flex-grow flex items-end min-h-[150px] justify-center">
                  {/* Animated fill */}
                  <motion.div
                    className="w-full rounded-t-xl rounded-b-sm relative overflow-hidden flex flex-col justify-end items-center"
                    initial={{ height: 0 }}
                    animate={{ height: `${pct}%` }}
                    transition={{
                      delay: 0.1 + i * 0.07,
                      duration: 0.9,
                      ease: [0.34, 1.2, 0.64, 1],
                    }}
                    style={{
                      background: `linear-gradient(0deg, ${palette.from}, ${palette.to})`,
                      boxShadow: isHovered
                        ? `0 0 20px ${palette.from}55`
                        : "none",
                      transition: "box-shadow 0.3s ease",
                    }}
                  >
                    {/* Shimmer sweep */}
                    <motion.div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(0deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)",
                        backgroundSize: "100% 200%",
                      }}
                      animate={{ backgroundPositionY: ["200%", "-200%"] }}
                      transition={{
                        delay: 0.6 + i * 0.07,
                        duration: 1.5,
                        ease: "easeInOut",
                      }}
                    />
                    
                    {/* Hover pulse ring inside the filled bar */}
                    <AnimatePresence>
                      {isHovered && (
                        <motion.div
                          className="absolute inset-0 rounded-t-xl rounded-b-sm border-2 pointer-events-none"
                          style={{ borderColor: "rgba(255, 255, 255, 0.4)" }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        />
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>
                
                {/* Label row (bottom) */}
                <div className="flex items-center gap-1.5 mt-2 h-6">
                  <motion.div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${palette.from}, ${palette.to})` }}
                    animate={{ scale: isHovered ? 1.4 : 1 }}
                    transition={{ type: "spring" as const, stiffness: 400, damping: 20 }}
                  />
                  <span className={`text-xs font-semibold whitespace-nowrap truncate max-w-[60px] transition-colors duration-300 ${isHovered ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`} title={item.label}>
                    {item.label}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </AnimatePresence>

      {/* Summary footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-wrap gap-4"
      >
        {activeData.map((item, i) => {
          const palette = PALETTES[i % PALETTES.length]
          const sharePct = total > 0 ? ((item.value / total) * 100).toFixed(0) : "0"
          return (
            <div key={i} className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: `linear-gradient(135deg, ${palette.from}, ${palette.to})` }}
              />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {item.label} <span className="font-semibold text-gray-700 dark:text-gray-200">{sharePct}%</span>
              </span>
            </div>
          )
        })}
        <div className="ml-auto text-xs text-gray-400 dark:text-gray-500 font-medium">
          Total: <span className="text-gray-700 dark:text-gray-200 font-bold">{total}</span>
        </div>
      </motion.div>
    </div>
  )
}