import { useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

interface Column {
  header: string
  accessor: string
  cell?: (row: Record<string, any>, index: number) => React.ReactNode
}

interface ReusableTableProps {
  columns: Column[]
  data: Record<string, any>[]
  actions?: (row: Record<string, any>) => React.ReactNode
  onRowClick?: (row: Record<string, any>) => void
  height?: string
  pagination?: boolean
  hasData?: boolean
  isLoading?: boolean
}

function ReusableTable({
  columns,
  data,
  actions,
  onRowClick,
  height = "320px",
  pagination,
  hasData,
  isLoading,
}: ReusableTableProps) {
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [currentPage, setCurrentPage] = useState(1)
  const [hoveredRow, setHoveredRow] = useState<number | null>(null)

  const totalPages = Math.ceil(data.length / rowsPerPage)

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage
    return data.slice(start, start + rowsPerPage)
  }, [data, currentPage, rowsPerPage])

  const handleRowsChange = (value: number) => {
    setRowsPerPage(value)
    setCurrentPage(1)
  }

  const rowVariants = {
    hidden: { opacity: 0, x: -14 },
    show: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        type: "spring" as const,
        stiffness: 300,
        damping: 26,
      },
    }),
    exit: { opacity: 0, x: 12, transition: { duration: 0.15 } },
  }

  const paginationButtons = [
    { icon: <ChevronsLeft size={14} />, action: () => setCurrentPage(1), disabled: currentPage === 1, label: "First" },
    { icon: <ChevronLeft size={14} />, action: () => setCurrentPage(p => p - 1), disabled: currentPage === 1, label: "Prev" },
    { icon: <ChevronRight size={14} />, action: () => setCurrentPage(p => p + 1), disabled: !hasData || currentPage === totalPages || totalPages === 0, label: "Next" },
    { icon: <ChevronsRight size={14} />, action: () => setCurrentPage(totalPages), disabled: !hasData || currentPage === totalPages || totalPages === 0, label: "Last" },
  ]

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-xl overflow-hidden transition-colors duration-300">
      {/* ── Table scroll area ── */}
      <div className="w-full overflow-x-auto overflow-y-auto" style={{ height }}>
        <table className="min-w-[430px] w-full text-sm border-collapse">
          {/* Header */}
          <thead className="sticky top-0 z-10">
            <tr className="bg-gray-100 dark:bg-gray-700 border-b-2 border-gray-200 dark:border-gray-600">
              {columns.map((col, index) => (
                <th
                  key={index}
                  className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 whitespace-nowrap"
                >
                  {col.header}
                </th>
              ))}
              {actions && (
                <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 whitespace-nowrap">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.tr
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <td colSpan={columns.length + (actions ? 1 : 0)} className="text-center py-20">
                    <div className="flex justify-center items-center gap-2">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-3 h-3 bg-blue-500 rounded-full"
                          animate={{
                            y: ["0%", "-100%", "0%"],
                            scale: [1, 0.8, 1],
                            opacity: [1, 0.5, 1]
                          }}
                          transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: i * 0.15
                          }}
                        />
                      ))}
                    </div>
                  </td>
                </motion.tr>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((row, rowIndex) => {
                  const isHovered = hoveredRow === rowIndex
                  return (
                    <motion.tr
                      key={`${currentPage}-${rowIndex}`}
                      custom={rowIndex}
                      variants={rowVariants}
                      initial="hidden"
                      animate="show"
                      exit="exit"
                      onClick={() => onRowClick?.(row)}
                      onMouseEnter={() => setHoveredRow(rowIndex)}
                      onMouseLeave={() => setHoveredRow(null)}
                      style={{
                        background: isHovered
                          ? "rgba(59,130,246,0.07)"
                          : rowIndex % 2 === 0
                            ? undefined
                            : "rgba(0,0,0,0.015)",
                        boxShadow: isHovered ? "inset 3px 0 0 #3b82f6" : "none",
                      }}
                      className={`
                        border-b border-gray-100 dark:border-gray-700
                        transition-all duration-200
                        ${onRowClick ? "cursor-pointer" : "cursor-default"}
                      `}
                    >
                      {columns.map((col, colIndex) => (
                        <td
                          key={colIndex}
                          className={`px-4 py-3 text-center break-words text-sm transition-colors duration-200 ${isHovered ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-200"}`}
                        >
                          {col.cell ? col.cell(row, rowIndex) : (row[col.accessor] ?? "—")}
                        </td>
                      ))}

                      {actions && (
                        <td className="px-4 py-3 text-center">
                          {actions(row)}
                        </td>
                      )}
                    </motion.tr>
                  )
                })
              ) : (
                <motion.tr
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <td
                    colSpan={columns.length + (actions ? 1 : 0)}
                    className="text-center py-16 text-gray-400 dark:text-gray-500"
                  >
                    <div className="flex flex-col items-center justify-center gap-4">
                      {/* Animated Empty State SVG */}
                      <motion.div 
                        className="relative w-32 h-32 flex items-center justify-center"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", bounce: 0.5 }}
                      >
                        {/* Background glowing circle */}
                        <motion.div 
                           className="absolute inset-0 bg-blue-100/50 dark:bg-blue-900/20 rounded-full"
                           animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
                           transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        />
                        
                        {/* Empty Box SVG */}
                        <svg className="w-20 h-20 text-gray-300 dark:text-gray-600 z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>

                        {/* Animated Magnifying Glass */}
                        <motion.div 
                          className="absolute z-20"
                          animate={{ 
                            x: [-15, 15, -15],
                            y: [-5, 5, -5],
                            rotate: [-10, 10, -10]
                          }}
                          transition={{ 
                            duration: 3, 
                            repeat: Infinity, 
                            ease: "easeInOut" 
                          }}
                        >
                          <svg className="w-10 h-10 text-blue-500 drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </motion.div>
                      </motion.div>

                      <div className="space-y-1">
                        <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300">No data found</h3>
                        <p className="text-sm text-gray-400 dark:text-gray-500 max-w-[280px]">
                          We couldn't find any data matching your filters. Try adjusting them or add new questions.
                        </p>
                      </div>
                    </div>
                  </td>
                </motion.tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      {pagination && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 transition-colors duration-300"
        >
          {/* Rows per page + page info */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-gray-500 dark:text-gray-400 whitespace-nowrap">Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => handleRowsChange(Number(e.target.value))}
              className="border border-gray-300 dark:border-gray-500 rounded-lg px-2 py-1 text-xs bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              {[5, 10, 50, 100, 200].map((num) => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
            <span className="text-gray-500 dark:text-gray-400 whitespace-nowrap">
              Page{" "}
              <span className="font-bold text-gray-800 dark:text-white">{currentPage}</span>
              {" "}of{" "}
              <span className="font-bold text-gray-800 dark:text-white">{totalPages || 1}</span>
            </span>
          </div>

          {/* Page nav buttons */}
          <div className="flex items-center gap-1.5">
            {paginationButtons.map((btn, i) => (
              <motion.button
                key={i}
                onClick={btn.action}
                disabled={btn.disabled}
                whileHover={!btn.disabled ? { scale: 1.12, y: -1 } : {}}
                whileTap={!btn.disabled ? { scale: 0.92 } : {}}
                title={btn.label}
                className={`
                  w-9 h-9 flex items-center justify-center rounded-lg text-xs font-semibold
                  border transition-all duration-200 select-none
                  ${btn.disabled
                    ? "opacity-10 cursor-not-allowed bg-transparent border-gray-200 dark:border-gray-800"
                    : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:shadow-lg hover:shadow-blue-500/40 dark:hover:bg-blue-600 dark:hover:border-blue-600"
                  }
                `}
              >
                <div className={btn.disabled ? "text-gray-300 dark:text-gray-700" : "text-gray-800 dark:text-gray-100"}>
                  {btn.icon}
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default ReusableTable