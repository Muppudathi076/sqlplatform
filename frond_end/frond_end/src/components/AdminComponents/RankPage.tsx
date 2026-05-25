import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { UserGetAllApi } from "../../auth/AdminAuthApi"
import { Loader2, Trophy, X, Star, Clock, Crown, Medal } from "lucide-react"
import confetti from "canvas-confetti"

export default function RankPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<any | null>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("access_token") || ""
      try {
        const res = await UserGetAllApi(token)
        const data = Array.isArray(res?.data) ? res.data : []
        
        const getLevelNumber = (modelStr: string) => {
          if (!modelStr) return 0;
          const match = modelStr.match(/\d+/);
          return match ? parseInt(match[0], 10) : 0;
        }

        // Sort descending by Level first, then by Score
        data.sort((a: any, b: any) => {
          const levelA = getLevelNumber(a.model);
          const levelB = getLevelNumber(b.model);
          
          if (levelA !== levelB) {
            return levelB - levelA;
          }
          return (parseFloat(b.score) || 0) - (parseFloat(a.score) || 0);
        })
        
        setUsers(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    (function frame() {
      // left edge
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 1 },
        colors: ['#fbbf24', '#f59e0b', '#3b82f6', '#8b5cf6']
      });
      // right edge
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 1 },
        colors: ['#fbbf24', '#f59e0b', '#3b82f6', '#8b5cf6']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] bg-transparent gap-4">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
          <Loader2 size={44} className="text-amber-500" />
        </motion.div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-gray-500 dark:text-gray-400 text-sm font-medium">
          Loading Ranks…
        </motion.p>
      </div>
    )
  }

  const top3 = users.slice(0, 3)
  
  const rank1 = top3[0] ? { ...top3[0], rank: 1, color: "from-amber-400 via-yellow-500 to-orange-500", glow: "shadow-[0_0_60px_rgba(245,158,11,0.6)]" } : null;
  const rank2 = top3[1] ? { ...top3[1], rank: 2, color: "from-slate-300 via-gray-400 to-slate-500", glow: "shadow-[0_0_40px_rgba(148,163,184,0.5)]" } : null;
  const rank3 = top3[2] ? { ...top3[2], rank: 3, color: "from-orange-400 via-orange-500 to-red-500", glow: "shadow-[0_0_40px_rgba(249,115,22,0.4)]" } : null;
  return (
    <div className="p-5 md:p-8 min-h-screen bg-transparent transition-colors duration-500 flex flex-col items-center overflow-x-hidden">
      
      <div className="fixed top-20 left-1/2 -translate-x-1/2 w-3/4 h-[500px] bg-gradient-to-b from-amber-500/10 to-transparent blur-3xl pointer-events-none rounded-full" />
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="text-center mb-10 md:mb-16 mt-4 relative z-10"
      >
        <motion.div 
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-amber-200 to-amber-500 dark:from-amber-500/20 dark:to-amber-500/5 rounded-full mb-6 shadow-xl shadow-amber-500/20 border border-amber-300 dark:border-amber-500/30"
        >
          <Trophy size={40} className="text-amber-600 dark:text-amber-400" />
        </motion.div>
        <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 tracking-tight mb-4 uppercase" style={{ filter: "drop-shadow(0 4px 10px rgba(245, 158, 11, 0.2))" }}>
          Hall of Fame
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-base md:text-lg font-medium tracking-widest uppercase">Elite E-Sports Rankings</p>
      </motion.div>

      {/* Olympics Podium Layout */}
      <div className="relative w-full max-w-4xl flex items-end justify-center mt-20 pb-20 px-4">
        
        {/* RANK 2 - SILVER (LEFT) */}
        {rank2 && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
            className="cursor-pointer group flex flex-col items-center relative z-20 w-1/3 max-w-[160px]"
            onClick={() => {
              setSelectedUser(rank2)
              triggerConfetti()
            }}
          >
            <motion.div 
              whileHover={{ y: -10 }}
              className="flex flex-col items-center mb-4"
            >
              <div className={`w-20 h-20 md:w-28 md:h-28 rounded-full border-4 border-slate-300 dark:border-gray-800 bg-gradient-to-br ${rank2.color} flex items-center justify-center shadow-xl ${rank2.glow} relative`}>
                <span className="text-3xl font-black text-white">{rank2.name?.charAt(0).toUpperCase() || "?"}</span>
              </div>
              <div className="text-center mt-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/20">
                <h3 className="text-sm md:text-base font-bold text-gray-900 dark:text-white truncate w-24 md:w-32">{rank2.name}</h3>
                <p className="text-xs md:text-sm font-black text-slate-500">{rank2.score || 0} pts</p>
              </div>
            </motion.div>

            {/* Silver Step */}
            <div className="w-full h-40 md:h-56 bg-gradient-to-t from-slate-400 to-slate-200 dark:from-slate-700 dark:to-slate-500 rounded-tl-lg border-t-4 border-l-4 border-slate-300 dark:border-slate-400 shadow-[inset_0_0_20px_rgba(0,0,0,0.1)] flex items-start justify-center pt-4 relative overflow-hidden group-hover:brightness-110 transition-all">
               <span className="text-5xl font-black text-slate-500/50 dark:text-slate-300/50">2</span>
            </div>
          </motion.div>
        )}

        {/* RANK 1 - GOLD (CENTER) */}
        {rank1 && (
          <motion.div
            initial={{ opacity: 0, y: 150 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
            className="cursor-pointer group flex flex-col items-center relative z-30 w-1/3 max-w-[180px] -mx-2 md:-mx-4"
            onClick={() => {
              setSelectedUser(rank1)
              triggerConfetti()
            }}
          >
            <motion.div 
              whileHover={{ y: -10 }}
              className="flex flex-col items-center mb-4 relative"
            >
              <div className="absolute -top-8 text-amber-400 drop-shadow-lg z-10 animate-bounce">
                <Crown size={36} fill="currentColor" />
              </div>
              <div className={`w-28 h-28 md:w-36 md:h-36 rounded-full border-[6px] border-amber-300 dark:border-gray-800 bg-gradient-to-br ${rank1.color} flex items-center justify-center shadow-2xl ${rank1.glow} relative`}>
                <span className="text-5xl font-black text-white">{rank1.name?.charAt(0).toUpperCase() || "?"}</span>
              </div>
              <div className="text-center mt-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md px-4 py-2 rounded-xl border border-amber-200/50 shadow-lg">
                <h3 className="text-base md:text-lg font-black text-gray-900 dark:text-white truncate w-28 md:w-36">{rank1.name}</h3>
                <p className="text-sm md:text-base font-black text-amber-600 dark:text-amber-400">{rank1.score || 0} pts</p>
              </div>
            </motion.div>

            {/* Gold Step */}
            <div className="w-full h-56 md:h-72 bg-gradient-to-t from-amber-500 to-yellow-300 dark:from-amber-700 dark:to-amber-500 rounded-t-xl border-t-4 border-x-4 border-amber-200 dark:border-amber-400 shadow-[0_-10px_30px_rgba(245,158,11,0.3)] flex items-start justify-center pt-4 relative overflow-hidden group-hover:brightness-110 transition-all">
               <span className="text-7xl font-black text-amber-600/40 dark:text-amber-300/40">1</span>
            </div>
          </motion.div>
        )}

        {/* RANK 3 - BRONZE (RIGHT) */}
        {rank3 && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, type: "spring", stiffness: 100 }}
            className="cursor-pointer group flex flex-col items-center relative z-20 w-1/3 max-w-[160px]"
            onClick={() => {
              setSelectedUser(rank3)
              triggerConfetti()
            }}
          >
            <motion.div 
              whileHover={{ y: -10 }}
              className="flex flex-col items-center mb-4"
            >
              <div className={`w-20 h-20 md:w-28 md:h-28 rounded-full border-4 border-orange-300 dark:border-gray-800 bg-gradient-to-br ${rank3.color} flex items-center justify-center shadow-xl ${rank3.glow} relative`}>
                <span className="text-3xl font-black text-white">{rank3.name?.charAt(0).toUpperCase() || "?"}</span>
              </div>
              <div className="text-center mt-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/20">
                <h3 className="text-sm md:text-base font-bold text-gray-900 dark:text-white truncate w-24 md:w-32">{rank3.name}</h3>
                <p className="text-xs md:text-sm font-black text-orange-600 dark:text-orange-400">{rank3.score || 0} pts</p>
              </div>
            </motion.div>

            {/* Bronze Step */}
            <div className="w-full h-32 md:h-44 bg-gradient-to-t from-orange-500 to-orange-300 dark:from-orange-800 dark:to-orange-600 rounded-tr-lg border-t-4 border-r-4 border-orange-300 dark:border-orange-500 shadow-[inset_0_0_20px_rgba(0,0,0,0.1)] flex items-start justify-center pt-4 relative overflow-hidden group-hover:brightness-110 transition-all">
               <span className="text-5xl font-black text-orange-600/50 dark:text-orange-300/50">3</span>
            </div>
          </motion.div>
        )}

      </div>

      {/* Modal Popup with Full Animation */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
            onClick={() => setSelectedUser(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 100, rotateX: 45 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: 100, rotateX: -45 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-[2rem] p-8 max-w-sm w-full shadow-[0_0_80px_rgba(0,0,0,0.5)] relative overflow-hidden border border-gray-100 dark:border-gray-700"
            >
              {/* Dynamic decorative bg element based on rank */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className={`absolute -top-32 -right-32 w-64 h-64 rounded-full blur-3xl opacity-30 bg-gradient-to-br ${selectedUser.color}`} 
              />
              
              <button 
                onClick={() => setSelectedUser(null)}
                className="absolute top-4 right-4 p-2.5 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors z-20"
              >
                <X size={20} className="text-gray-500 dark:text-gray-400" />
              </button>

              <div className="flex flex-col items-center relative z-10 pt-4">
                <motion.div 
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", delay: 0.2, stiffness: 200 }}
                  className={`w-28 h-28 rounded-full bg-gradient-to-br flex items-center justify-center text-5xl font-black text-white shadow-2xl mb-6 relative border-4 border-white dark:border-gray-800 ${selectedUser.color}`}
                >
                  {selectedUser.name?.charAt(0).toUpperCase() || "?"}
                  
                  {selectedUser.rank === 1 && (
                    <div className="absolute -top-6 text-amber-400 drop-shadow-md">
                      <Crown size={40} fill="currentColor" />
                    </div>
                  )}

                  <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full flex items-center justify-center shadow-lg text-lg font-black border-2 border-white dark:border-gray-800">
                    #{selectedUser.rank}
                  </div>
                </motion.div>
                
                <motion.h2 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl font-black text-gray-900 dark:text-white mb-1 text-center truncate w-full"
                >
                  {selectedUser.name || "Unknown User"}
                </motion.h2>
                
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-sm text-gray-500 dark:text-gray-400 mb-8 text-center"
                >
                  {selectedUser.email || "No email provided"}
                </motion.p>

                <div className="w-full grid grid-cols-2 gap-4 mb-4">
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5, type: "spring" }}
                    className="bg-gray-50 dark:bg-gray-700/50 p-5 rounded-2xl flex flex-col items-center text-center border border-gray-100 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <Star size={24} className={`${selectedUser.rank === 1 ? 'text-amber-500' : selectedUser.rank === 2 ? 'text-slate-400' : 'text-orange-500'} mb-2`} fill="currentColor" />
                    <span className="text-3xl font-black text-gray-900 dark:text-white">{selectedUser.score || 0}</span>
                    <span className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">Score</span>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6, type: "spring" }}
                    className="bg-gray-50 dark:bg-gray-700/50 p-5 rounded-2xl flex flex-col items-center text-center border border-gray-100 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <Medal size={24} className="text-blue-500 mb-2" />
                    <span className="text-2xl font-bold text-gray-900 dark:text-white mt-1 truncate max-w-full">{selectedUser.model || "—"}</span>
                    <span className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">Level</span>
                  </motion.div>
                </div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, type: "spring" }}
                  className="w-full bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl flex justify-between items-center border border-blue-100 dark:border-blue-800/30"
                >
                  <div className="flex items-center gap-2">
                    <Clock size={18} className="text-blue-500" />
                    <span className="text-sm font-bold text-blue-700 dark:text-blue-300">Play Time</span>
                  </div>
                  <span className="font-black text-blue-900 dark:text-blue-100 text-lg">{selectedUser.total_time || "0m"}</span>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
