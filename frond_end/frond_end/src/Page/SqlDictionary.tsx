import { useState, useEffect } from "react"
import { getSqlDictionaryApi } from "../auth/authapi"
import toast from "react-hot-toast"
import { Search, Asterisk, Database, Filter, PlusCircle, Trash2, FilePlus, BookOpen, Check, X, ArrowRight } from "lucide-react"

// Map string icon names to Lucide components
const IconMap: Record<string, any> = {
  Search,
  Asterisk,
  Database,
  Filter,
  PlusCircle,
  Trash2,
  FilePlus
}

export default function SqlDictionary() {
  const [dictionary, setDictionary] = useState<any[]>([])
  const [activeItem, setActiveItem] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Test Mode States
  const [testMode, setTestMode] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [testCompleted, setTestCompleted] = useState(false)

  // Reset test mode when active item changes
  useEffect(() => {
    setTestMode(false)
    setCurrentQuestionIndex(0)
    setScore(0)
    setTestCompleted(false)
  }, [activeItem])

  const handleAnswer = (selectedOption: string) => {
    const currentQ = activeItem.questions[currentQuestionIndex]
    if (selectedOption === currentQ.answer) {
      toast.success("Correct Answer!", { duration: 1500 })
      setScore(s => s + 1)
    } else {
      toast.error(`Wrong! Correct answer: ${currentQ.answer}`, { duration: 2500 })
    }
    
    if (currentQuestionIndex + 1 < activeItem.questions.length) {
      setTimeout(() => setCurrentQuestionIndex(i => i + 1), 1000)
    } else {
      setTimeout(() => setTestCompleted(true), 1000)
    }
  }

  const fetchDictionary = async () => {
    try {
      const token = localStorage.getItem("access_token") || ""
      const res = await getSqlDictionaryApi(token)
      if (res.success && res.data) {
        setDictionary(res.data)
        if (res.data.length > 0) setActiveItem(res.data[0])
      }
    } catch (e) {
      toast.error("Failed to load dictionary")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDictionary()
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-5">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!dictionary.length) {
    return <div className="p-5 text-white">No dictionary found.</div>
  }

  const ActiveIcon = activeItem?.icon && IconMap[activeItem.icon] ? IconMap[activeItem.icon] : BookOpen

  return (
    <div className="h-[90vh] flex flex-col md:flex-row bg-white dark:bg-black p-4 gap-6 overflow-hidden">
      {/* Left Sidebar (List) */}
      <div className="w-full md:w-1/3 lg:w-1/4 shrink-0 md:h-full flex flex-col border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden bg-gray-50 dark:bg-zinc-900/50 shadow-sm">
        <div className="p-4 md:p-5 bg-gradient-to-r from-blue-600 to-indigo-600 shrink-0">
          <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
            <BookOpen size={24} />
            SQL Dictionary
          </h2>
          <p className="text-blue-100 text-sm mt-1 opacity-90 hidden md:block">Master the magic spells of Data</p>
        </div>
        
        <div className="flex flex-row overflow-x-auto md:flex-col md:overflow-y-auto p-3 gap-3 md:gap-0 md:space-y-2 pb-4">
          {dictionary.map((item, idx) => {
            const ItemIcon = item.icon && IconMap[item.icon] ? IconMap[item.icon] : BookOpen
            const isActive = activeItem?.keyword === item.keyword
            return (
              <button
                key={idx}
                onClick={() => setActiveItem(item)}
                className={`w-fit min-w-[200px] max-w-[280px] md:w-full md:max-w-none shrink-0 text-left flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${isActive ? 'bg-blue-100 dark:bg-blue-900/40 border border-blue-500 shadow-md scale-[1.02] md:scale-[1.02]' : 'bg-white dark:bg-black border border-gray-200 dark:border-gray-800 hover:border-blue-400 dark:hover:border-blue-500 md:hover:-translate-y-1'}`}
              >
                <div className={`p-2 rounded-lg bg-gradient-to-br ${item.color || 'from-gray-400 to-gray-600'} text-white`}>
                  <ItemIcon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-bold text-sm truncate ${isActive ? 'text-blue-700 dark:text-blue-400' : 'text-gray-800 dark:text-gray-200'}`}>{item.keyword}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.meaning}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 min-h-0 overflow-y-auto rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-zinc-900/30 p-6 md:p-10 relative shadow-sm">
        <div key={activeItem?.keyword} className="animate-fade-in-up pb-10">
          
          <div className="flex items-start gap-6 mb-8">
            <div className={`p-5 rounded-2xl bg-gradient-to-br ${activeItem?.color || 'from-blue-400 to-blue-600'} text-white shadow-lg shadow-blue-500/20 shrink-0`}>
              <ActiveIcon size={48} />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">{activeItem?.keyword}</h1>
              <p className="text-lg md:text-xl font-medium text-blue-600 dark:text-blue-400 mt-2">{activeItem?.meaning}</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            
            <div className="bg-white dark:bg-black rounded-2xl p-6 md:col-span-2 lg:col-span-1 border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden group">
              <div className="absolute -top-4 -right-4 p-4 opacity-[0.03] text-gray-900 dark:text-white group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                <BookOpen size={150} />
              </div>
              <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span> Real-world Analogy
              </h3>
              <p className="text-gray-800 dark:text-gray-200 leading-relaxed text-lg relative z-10 font-medium">
                {activeItem?.analogy}
              </p>
            </div>

            <div className="space-y-6 md:col-span-2 lg:col-span-1 flex flex-col justify-between">
              <div className="bg-white dark:bg-black rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm flex-1">
                <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-pink-500"></span> Syntax
                </h3>
                <div className="bg-gray-100 dark:bg-zinc-900 p-4 rounded-xl border border-gray-300 dark:border-zinc-700">
                  <code className="text-pink-600 dark:text-pink-400 font-mono text-sm md:text-base break-words">{activeItem?.syntax}</code>
                </div>
              </div>

              <div className="bg-white dark:bg-black rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm flex-1">
                <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span> Example Query
                </h3>
                <div className="bg-gray-900 p-4 rounded-xl shadow-inner relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                  <code className="text-green-400 font-mono text-sm md:text-base break-words">{activeItem?.example_query}</code>
                </div>
              </div>
            </div>

          </div>
          
          {/* Test Button */}
          {activeItem?.questions && activeItem.questions.length > 0 && (
            <div className="mt-10 flex justify-end">
              <button 
                onClick={() => setTestMode(true)} 
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-all flex items-center gap-2 transform hover:scale-105"
              >
                <Check size={20} /> Take a Quick Test
              </button>
            </div>
          )}

        </div>
        
        {/* Test Mode Overlay */}
        {testMode && (
          <div className="absolute inset-0 z-50 bg-white dark:bg-black p-6 md:p-10 animate-fade-in-up flex flex-col">
            <button 
              onClick={() => setTestMode(false)} 
              className="absolute top-6 right-6 p-2 bg-gray-100 dark:bg-zinc-800 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
            >
              <X size={20} className="text-gray-600 dark:text-gray-300" />
            </button>
            
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-2 flex items-center gap-3">
              <Check className="text-blue-500" size={32} />
              {activeItem.keyword} Knowledge Check
            </h2>
            <div className="w-full h-1 bg-gray-200 dark:bg-zinc-800 rounded-full mb-8 overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-500" 
                style={{ width: `${testCompleted ? 100 : ((currentQuestionIndex) / activeItem.questions.length) * 100}%` }}
              ></div>
            </div>

            {!testCompleted ? (
              <div className="flex-1 flex flex-col justify-center max-w-3xl mx-auto w-full">
                <p className="text-sm font-bold text-blue-500 mb-2 uppercase tracking-widest">
                  Question {currentQuestionIndex + 1} of {activeItem.questions.length}
                </p>
                <p className="text-2xl md:text-3xl font-medium text-gray-800 dark:text-gray-100 mb-8 leading-tight">
                  {activeItem.questions[currentQuestionIndex].question}
                </p>
                
                <div className="grid gap-4 md:grid-cols-2">
                  {activeItem.questions[currentQuestionIndex].options.map((opt: string, i: number) => (
                    <button 
                      key={i}
                      onClick={() => handleAnswer(opt)}
                      className="p-5 bg-gray-50 dark:bg-zinc-900 hover:bg-blue-50 dark:hover:bg-blue-900/30 border-2 border-gray-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-500 rounded-2xl text-left font-medium text-lg text-gray-700 dark:text-gray-300 transition-all transform hover:-translate-y-1 group flex justify-between items-center"
                    >
                      <span>{opt}</span>
                      <ArrowRight size={20} className="opacity-0 group-hover:opacity-100 text-blue-500 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center animate-fade-in-up">
                <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-green-500/20">
                  <Check size={48} />
                </div>
                <h3 className="text-4xl font-black text-gray-900 dark:text-white mb-2">Test Completed!</h3>
                <p className="text-xl text-gray-500 dark:text-gray-400 font-medium mb-8">
                  You scored <span className="text-blue-500 font-bold">{score}</span> out of {activeItem.questions.length}
                </p>
                <button 
                  onClick={() => setTestMode(false)} 
                  className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-black font-bold rounded-xl hover:scale-105 transition-transform"
                >
                  Back to Dictionary
                </button>
              </div>
            )}
          </div>
        )}
        
        <style>{`
          @keyframes fade-in-up {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-up {
            animation: fade-in-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        `}</style>
      </div>
    </div>
  )
}
