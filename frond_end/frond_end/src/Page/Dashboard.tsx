import { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Globe, GraduationCap, ArrowUp, Star, BookOpen, Trophy, Zap, Award, Target, Crown } from "lucide-react"
import ReusableCard from "../components/ReusableComponents/ReusableCard"
import { userdashboardApi } from "../auth/authapi"
import toast from "react-hot-toast"
import ScoreBar from "../components/ReusableComponents/ScoreBar"

const levelIcons = [Star, BookOpen, Trophy, Zap, Award, Target, Crown, Star, BookOpen];

const nodeColors = [
  { bg: "from-blue-400 to-indigo-600", shadow: "rgba(59,130,246,0.5)", glow: "rgba(30,58,138,0.3)" },
  { bg: "from-emerald-400 to-teal-600", shadow: "rgba(16,185,129,0.5)", glow: "rgba(6,78,59,0.3)" },
  { bg: "from-fuchsia-400 to-purple-600", shadow: "rgba(192,38,211,0.5)", glow: "rgba(74,4,78,0.3)" },
  { bg: "from-amber-400 to-orange-600", shadow: "rgba(245,158,11,0.5)", glow: "rgba(120,53,15,0.3)" },
  { bg: "from-rose-400 to-red-600", shadow: "rgba(244,63,94,0.5)", glow: "rgba(136,19,55,0.3)" },
  { bg: "from-cyan-400 to-sky-600", shadow: "rgba(6,182,212,0.5)", glow: "rgba(8,51,68,0.3)" },
  { bg: "from-lime-400 to-green-600", shadow: "rgba(132,204,22,0.5)", glow: "rgba(20,83,45,0.3)" },
  { bg: "from-violet-400 to-indigo-700", shadow: "rgba(139,92,246,0.5)", glow: "rgba(46,16,101,0.3)" },
  { bg: "from-pink-400 to-rose-600", shadow: "rgba(236,72,153,0.5)", glow: "rgba(131,24,67,0.3)" },
];

function Dashboard() {
  const navigate = useNavigate()
  const [cards, setCards] = useState<any>(null)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const token = localStorage.getItem("access_token") || ""

  const fetching = async () => {
    try {
      const res = await userdashboardApi(token)
      setCards(res.cards)
    } catch (e) {
      toast.error("Something went wrong", { duration: 2000 })
    }
  }

  const levels = [
    { id: 1, title: "Pre-A1", subtitle: "Starter", sets: 21 },
    { id: 2, title: "A1", subtitle: "Beginner", sets: 72 },
    { id: 3, title: "A1+", subtitle: "Elementary", sets: 72 },
    { id: 4, title: "A2", subtitle: "Pre-Intermediate", sets: 72 },
    { id: 5, title: "B1", subtitle: "Intermediate", sets: 72 },
    { id: 6, title: "B1+", subtitle: "Upper-Intermediate", sets: 72 },
    { id: 7, title: "B2", subtitle: "Advanced", sets: 72 },
    { id: 8, title: "C1", subtitle: "Proficient", sets: 72 },
    { id: 9, title: "C2", subtitle: "Mastery", sets: 72 },
  ];

  const handleScroll = () => {
    if (scrollRef.current) {
      setShowScrollTop(scrollRef.current.scrollTop > 300)
    }
  }

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" })
  }

  useEffect(() => {
    fetching()
  }, [])

  return (
    <div className="h-screen bg-white dark:bg-black p-5 pb-28 lg:pb-5 overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none opacity-0 dark:opacity-100 transition-opacity duration-1000 overflow-hidden">
        <div className="stars-container w-full h-full">
          <div className="nebula absolute inset-0 z-0" />
          {[...Array(5)].map((_, i) => (
            <div key={`shooting-${i}`} className="shooting-star" style={{ top: Math.random() * 100 + '%', left: Math.random() * 100 + '%', animationDelay: `${Math.random() * 5}s`, animationDuration: `${2 + Math.random() * 3}s` }} />
          ))}
          {[...Array(60)].map((_, i) => (
            <div key={i} className="star absolute bg-white rounded-full z-1" style={{ width: Math.random() * 2 + 1 + 'px', height: Math.random() * 2 + 1 + 'px', top: Math.random() * 100 + '%', left: Math.random() * 100 + '%', opacity: 0.2 + Math.random() * 0.8, boxShadow: i % 5 === 0 ? '0 0 10px #fff' : 'none', animation: `twinkle ${3 + Math.random() * 4}s infinite alternate ${Math.random() * 3}s` }} />
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-full relative z-10">

        <div ref={scrollRef} onScroll={handleScroll} className="w-full lg:w-3/4 h-full overflow-y-auto scrollbar-hide order-2 lg:order-1">
          <div className="flex flex-col items-center gap-12 pb-32 pt-10 px-4 relative">

            <svg className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-visible opacity-20 dark:opacity-30" viewBox="0 0 200 1000">
              <path
                d="M 100,0 Q 180,100 100,200 T 100,400 T 100,600 T 100,800 T 100,1000"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="10,10"
                className="text-gray-400 dark:text-blue-500"
              />
            </svg>

            <h3 className="text-3xl font-black text-zinc-800 dark:text-white mb-10 tracking-tight italic">
              COSMIC <span className="text-blue-500">JOURNEY</span>
            </h3>

            {levels.map((level, idx) => {
              const IconComp = levelIcons[idx % levelIcons.length];
              const color = nodeColors[idx % nodeColors.length];
              const isFirst = idx === 0;
              const isEven = idx % 2 === 0;

              const horizontalOffset = isEven ? "sm:translate-x-24" : "sm:-translate-x-24";
              const rotation = isEven ? "rotate-3" : "-rotate-3";

              return (
                <div key={idx} className={`relative flex flex-col items-center transition-all duration-700 ${horizontalOffset}`}>

                  <div
                    onClick={() => navigate(`/api/modal/${level.id}`)}
                    className={`group relative flex flex-col items-center cursor-pointer ${rotation}`}
                  >
                    <div className="relative animate-float" style={{ animationDelay: `${idx * 0.3}s` }}>
                      <div className={`absolute inset-[-20px] rounded-full blur-2xl opacity-40 group-hover:opacity-70 transition-opacity duration-500 bg-gradient-to-br ${color.bg}`} />

                      <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br ${color.bg} flex items-center justify-center border-4 border-white/20 dark:border-black/30 shadow-[0_0_30px_${color.shadow}] z-10 relative overflow-hidden group-hover:scale-110 transition-transform duration-500`}>
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-50" />
                        <IconComp size={40} className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] z-20 group-hover:rotate-12 transition-transform duration-300" />
                      </div>

                      {isFirst && (
                        <div className="absolute -top-4 -right-4 bg-yellow-400 text-black text-[10px] font-black px-2 py-1 rounded-full shadow-lg z-30 animate-pulse">
                          ACTIVE
                        </div>
                      )}
                    </div>

                    <div className="mt-6 text-center bg-white/5 dark:bg-black/40 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 dark:border-white/5 shadow-xl group-hover:-translate-y-1 transition-transform duration-300">
                      <p className="text-zinc-800 dark:text-white font-black text-base uppercase tracking-wider">{level.title}</p>
                      <p className="text-zinc-500 dark:text-blue-400 text-xs font-bold">{level.subtitle}</p>
                      <div className="mt-1 h-1 w-full bg-gray-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div className={`h-full bg-gradient-to-r ${color.bg} w-1/3`} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="hidden lg:block w-full lg:w-1/4 bg-transparent rounded-2xl p-5 h-fit lg:sticky lg:top-5 self-start transition-all duration-500 order-1 lg:order-2">
          <div className="space-y-4">
            <div className="border border-white/10 dark:border-zinc-700/50 bg-transparent hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:-translate-y-1 transition-all duration-500 hover:scale-105 rounded-xl p-1 shadow-sm cursor-pointer">
              <ReusableCard title="Global Ranking" value={cards?.global_rank} color="#ef4444" Icon={Globe} />
            </div>
            <div className="border border-white/10 dark:border-zinc-700/50 bg-transparent hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:-translate-y-1 transition-all duration-500 hover:scale-105 rounded-xl p-1 shadow-sm cursor-pointer">
              <ReusableCard title="Total Courses" value={cards?.total_courses} color="#f59e0b" Icon={GraduationCap} />
            </div>
          </div>
          <div className="mt-8 border border-white/10 dark:border-zinc-700/50 bg-transparent hover:shadow-[0_0_20px_rgba(109,40,217,0.4)] hover:-translate-y-1 transition-all duration-500 hover:scale-105 rounded-xl p-2 shadow-sm cursor-pointer">
            <ScoreBar score={cards?.total_score || 0} maxScore={100} hearts={5} title="Score" />
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 z-40 bg-transparent p-3 lg:hidden transition-all duration-500">
          <div className="flex items-center justify-around gap-3">
            <div className="flex items-center gap-2"><Globe size={18} className="text-red-500" /><div><p className="text-[10px] text-gray-400">Rank</p><p className="text-sm font-bold text-black dark:text-white">{cards?.global_rank || 0}</p></div></div>
            <div className="flex items-center gap-2"><GraduationCap size={18} className="text-amber-500" /><div><p className="text-[10px] text-gray-400">Courses</p><p className="text-sm font-bold text-black dark:text-white">{cards?.total_courses || 0}</p></div></div>
            <div className="flex-1 max-w-[200px]"><ScoreBar score={cards?.total_score || 0} maxScore={100} hearts={5} title="" /></div>
          </div>
        </div>

        {showScrollTop && (
          <button onClick={scrollToTop} className="fixed bottom-44 lg:bottom-24 right-6 z-50 w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-[0_10px_30px_rgba(59,130,246,0.5)] hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center animate-bounce">
            <ArrowUp size={28} />
          </button>
        )}
      </div>
    </div>
  )
}

export default Dashboard