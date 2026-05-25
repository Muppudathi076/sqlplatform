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

function LoadingOrbs() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6">
      <div className="relative w-20 h-20">
        <div
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-purple-500 animate-spin"
          style={{ animationDuration: "1s" }}
        />
        <div
          className="absolute inset-2 rounded-full border-4 border-transparent border-b-cyan-400 border-l-indigo-400 animate-spin"
          style={{ animationDuration: "1.5s", animationDirection: "reverse" }}
        />
        <div
          className="absolute inset-4 rounded-full border-4 border-transparent border-t-purple-400 animate-spin"
          style={{ animationDuration: "2s" }}
        />
      </div>
      <div className="flex flex-col items-center gap-2">
        <h2 className="text-lg font-bold text-zinc-800 dark:text-white">Loading Questions...</h2>
        <p className="text-zinc-400 dark:text-white/40 text-sm">Preparing your learning session</p>
      </div>
      <div className="flex justify-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s`, animationDuration: "0.8s" }}
          />
        ))}
      </div>
    </div>
  );
}



function Dashboard() {
  const navigate = useNavigate()
  const [cards, setCards] = useState<any>(null)
  const [dbLevels, setDbLevels] = useState<any[]>([])
  const [showScrollTop, setShowScrollTop] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const hasScrolledRef = useRef(false)
  const [isLoading, setIsLoading] = useState(true)

  const token = localStorage.getItem("access_token") || ""

  const fetching = async () => {
    setIsLoading(true)
    try {
      const res = await userdashboardApi(token)
      setCards(res.cards)
      setDbLevels(res.table || [])
    } catch (e) {
      toast.error("Something went wrong", { duration: 2000 })
    } finally {
      setIsLoading(false)
    }
  }

  const fallbackTitles = [
    { title: "Pre-A1", subtitle: "Starter" },
    { title: "A1", subtitle: "Beginner" },
    { title: "A1+", subtitle: "Elementary" },
    { title: "A2", subtitle: "Pre-Intermediate" },
    { title: "B1", subtitle: "Intermediate" },
    { title: "B1+", subtitle: "Upper-Intermediate" },
    { title: "B2", subtitle: "Advanced" },
    { title: "C1", subtitle: "Proficient" },
    { title: "C2", subtitle: "Mastery" }
  ];

  const dynamicLevels = dbLevels.map((dbLevel: any) => {
    const modelId = Number(dbLevel.topic.replace("Level ", ""));
    const fallback = fallbackTitles[modelId - 1] || { title: `Module ${modelId}`, subtitle: "Expert Level" };
    return {
      id: modelId,
      title: fallback.title,
      subtitle: fallback.subtitle,
      sets: dbLevel.total,
      progress: parseInt(dbLevel.progress) || 0
    };
  }).sort((a, b) => a.id - b.id);

  const nextLevelIdx = dynamicLevels.findIndex((l: any) => l.progress < 100);

  useEffect(() => {
    if (!hasScrolledRef.current && dynamicLevels.length > 0 && !isLoading && nextLevelIdx !== -1) {
      hasScrolledRef.current = true;
      setTimeout(() => {
        const el = document.getElementById(`level-node-${nextLevelIdx}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [dynamicLevels, isLoading, nextLevelIdx]);

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
    <div className="h-screen bg-slate-900 dark:bg-black p-5 pb-28 lg:pb-5 overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none transition-opacity duration-1000 overflow-hidden">
        <div className="stars-container w-full h-full">
          <div className="nebula absolute inset-0 z-0 opacity-50 dark:opacity-100" />
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

            <h3 className="text-3xl font-black text-white mb-10 tracking-tight italic drop-shadow-md">
              COSMIC <span className="text-blue-400">JOURNEY</span>
            </h3>

            {isLoading ? (
              <LoadingOrbs />
            ) : dynamicLevels.length > 0 ? dynamicLevels.map((level, idx) => {
              const IconComp = levelIcons[idx % levelIcons.length];
              const color = nodeColors[idx % nodeColors.length];
              const isEven = idx % 2 === 0;
              const isCompleted = level.progress >= 100;
              const isNext = !isCompleted && idx === nextLevelIdx;
              const horizontalOffset = isEven ? "sm:translate-x-24" : "sm:-translate-x-24";
              const rotation = isEven ? "rotate-3" : "-rotate-3";

              return (
                <div
                  key={idx}
                  id={`level-node-${idx}`}
                  className={`relative flex flex-col items-center transition-all duration-700 ${horizontalOffset}`}
                  style={{
                    animation: isNext ? "db-unlock 0.7s cubic-bezier(0.34,1.56,0.64,1) both" : undefined,
                  }}
                >
                  <div
                    onClick={() => {
                      if (!isCompleted) {
                        navigate(`/api/modal/${level.id}`)
                      }
                    }}
                    className={`group relative flex flex-col items-center ${isCompleted ? 'cursor-not-allowed' : 'cursor-pointer'} ${rotation}`}
                  >
                    <div className="relative animate-float" style={{ animationDelay: `${idx * 0.3}s` }}>
                      {/* Next unlock glow ring */}
                      {isNext && (
                        <div
                          className="absolute inset-[-12px] rounded-full z-0"
                          style={{
                            boxShadow: "0 0 40px 16px rgba(250,204,21,0.55), 0 0 80px 32px rgba(250,204,21,0.2)",
                            animation: "db-ring 1.2s ease-in-out infinite",
                          }}
                        />
                      )}

                      <div className={`absolute inset-[-20px] rounded-full blur-2xl opacity-40 ${isCompleted ? '' : 'group-hover:opacity-70'} transition-opacity duration-500 bg-gradient-to-br ${color.bg}`} style={{ filter: isCompleted ? 'grayscale(100%)' : 'none' }} />

                      <div
                        className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br ${color.bg} flex items-center justify-center border-4 z-10 relative overflow-hidden ${isCompleted ? '' : 'group-hover:scale-110'} transition-transform duration-500`}
                        style={{
                          borderColor: isNext ? "#facc15" : (isCompleted ? "rgba(150,150,150,0.5)" : "rgba(255,255,255,0.2)"),
                          boxShadow: isNext ? `0 0 40px rgba(250,204,21,0.7)` : undefined,
                          filter: isCompleted ? "grayscale(100%)" : undefined,
                          transition: "all 0.4s ease",
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-50" />
                        <IconComp size={40} className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] z-20 group-hover:rotate-12 transition-transform duration-300" />
                      </div>

                      {isNext && (
                        <div className="absolute -top-4 -right-4 bg-yellow-400 text-black text-[10px] font-black px-2 py-1 rounded-full shadow-lg z-30 animate-bounce">
                          🔓 NEXT
                        </div>
                      )}
                      {isCompleted && (
                        <div className="absolute -top-2 -right-2 bg-gray-500 text-white text-[10px] font-black px-2 py-1 rounded-full shadow-lg z-30">
                          ✓ DONE
                        </div>
                      )}
                    </div>

                    <div className={`mt-6 text-center bg-black/40 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 shadow-xl ${isCompleted ? '' : 'group-hover:-translate-y-1'} transition-transform duration-300`}>
                      <p className={`font-black text-base uppercase tracking-wider ${isCompleted ? 'text-gray-500' : 'text-white'}`}>{level.title}</p>
                      <p className={`text-xs font-bold ${isCompleted ? 'text-gray-600' : 'text-blue-400'}`}>{level.subtitle}</p>
                      <div className="mt-1 h-1 w-full bg-gray-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div className={`h-full bg-gradient-to-r ${isCompleted ? 'from-gray-400 to-gray-600' : color.bg}`} style={{ width: `${level.progress}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="text-center text-gray-500 py-10">No models found in the database.</div>
            )}

            <style>{`
              @keyframes db-fire {
                from { transform: scale(1) rotate(-6deg); filter: brightness(1); }
                to   { transform: scale(1.25) rotate(6deg); filter: brightness(1.3); }
              }
              @keyframes db-ring {
                0%, 100% { opacity: 0.7; transform: scale(1); }
                50%       { opacity: 1;   transform: scale(1.08); }
              }
              @keyframes db-unlock {
                from { opacity: 0; transform: scale(0.6) translateY(40px); }
                to   { opacity: 1; transform: scale(1) translateY(0); }
              }
            `}</style>
          </div>
        </div>

        <div className="hidden lg:block w-full lg:w-1/4 bg-transparent rounded-2xl p-5 h-fit lg:sticky lg:top-5 self-start transition-all duration-500 order-1 lg:order-2">
          <div className="space-y-4">
            <div className="border border-white/10 bg-black/40 backdrop-blur-sm hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:-translate-y-1 transition-all duration-500 hover:scale-105 rounded-xl p-1 shadow-xl cursor-pointer">
              <ReusableCard title="Global Ranking" value={cards?.global_rank} color="#ef4444" Icon={Globe} />
            </div>
            <div className="border border-white/10 bg-black/40 backdrop-blur-sm hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:-translate-y-1 transition-all duration-500 hover:scale-105 rounded-xl p-1 shadow-xl cursor-pointer">
              <ReusableCard title="Total Courses" value={cards?.total_courses} color="#f59e0b" Icon={GraduationCap} />
            </div>
          </div>
          <div className="mt-8 border border-white/10 bg-black/40 backdrop-blur-sm hover:shadow-[0_0_20px_rgba(109,40,217,0.4)] hover:-translate-y-1 transition-all duration-500 hover:scale-105 rounded-xl p-2 shadow-xl cursor-pointer">
            <ScoreBar score={cards?.total_score || 0} maxScore={100} hearts={5} title="Score" />
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-md border-t border-white/10 p-3 lg:hidden transition-all duration-500">
          <div className="flex items-center justify-around gap-3">
            <div className="flex items-center gap-2"><Globe size={18} className="text-red-500" /><div><p className="text-[10px] text-gray-400">Rank</p><p className="text-sm font-bold text-white">{cards?.global_rank || 0}</p></div></div>
            <div className="flex items-center gap-2"><GraduationCap size={18} className="text-amber-500" /><div><p className="text-[10px] text-gray-400">Courses</p><p className="text-sm font-bold text-white">{cards?.total_courses || 0}</p></div></div>
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