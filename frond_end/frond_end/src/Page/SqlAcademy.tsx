import { useState, useEffect } from "react";
import Confetti from "react-confetti";
import { Rocket, CheckCircle, ArrowRight, Play, Database, Loader2, Lightbulb } from "lucide-react";
import { getSqlAcademyApi, updateSqlAcademyApi } from "../auth/authapi";

export default function SqlAcademy() {
  const [missions, setMissions] = useState<any[]>([]);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [query, setQuery] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMissions = async () => {
      try {
        const token = localStorage.getItem("access_token") || "";
        const res = await getSqlAcademyApi(token);
        if (res.success && res.data) {
          setMissions(res.data);
          // Resume from last saved level (don't overflow if questions changed)
          const savedLevel = typeof res.currentLevel === 'number' ? res.currentLevel : 0;
          setCurrentLevel(Math.min(savedLevel, res.data.length - 1));
        }
      } catch (err) {
        console.error("Failed to load academy questions", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMissions();
  }, []);

  if (loading) {
    return (
      <div className="h-[90vh] flex items-center justify-center bg-white dark:bg-black">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (missions.length === 0) {
    return (
      <div className="h-[90vh] flex items-center justify-center bg-white dark:bg-black text-gray-500">
        No academy missions found.
      </div>
    );
  }

  const mission = missions[currentLevel];

  const explainQuery = (query: string) => {
    const explanations: any[] = [];
    const q = query.toUpperCase();

    if (q.includes("SELECT")) explanations.push({ keyword: "SELECT", desc: "Gets the data you want to view." });
    if (q.includes("*")) explanations.push({ keyword: "*", desc: "Means 'Everything' (all columns)." });
    if (q.includes("FROM")) explanations.push({ keyword: "FROM", desc: "Specifies which table to get the data from." });
    if (q.includes("WHERE")) explanations.push({ keyword: "WHERE", desc: "Filters the data based on a condition." });
    if (q.includes("ORDER BY")) explanations.push({ keyword: "ORDER BY", desc: "Sorts the data." });
    if (q.includes("DESC")) explanations.push({ keyword: "DESC", desc: "Descending order (highest to lowest)." });
    if (q.includes("ASC")) explanations.push({ keyword: "ASC", desc: "Ascending order (lowest to highest)." });
    if (q.includes("LIMIT")) explanations.push({ keyword: "LIMIT", desc: "Restricts how many rows are returned." });
    if (q.includes("COUNT")) explanations.push({ keyword: "COUNT", desc: "Counts the total number of items." });
    if (q.includes("JOIN")) explanations.push({ keyword: "JOIN", desc: "Combines data from multiple tables." });
    if (q.includes("GROUP BY")) explanations.push({ keyword: "GROUP BY", desc: "Groups rows that have the same values." });

    if (explanations.length === 0) explanations.push({ keyword: "QUERY", desc: "Executes the SQL command." });
    return explanations;
  };

  const handleRunQuery = () => {
    // Normalize string to ignore case and spaces
    const cleanUserQuery = query.toLowerCase().replace(/\s+/g, " ").replace(/"/g, "'").trim();
    const cleanExpected = mission.expectedQuery.toLowerCase().replace(/\s+/g, " ").trim();

    if (cleanUserQuery === cleanExpected) {
      setErrorMsg("");
      setShowResult(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    } else {
      setShowResult(false);
      // Friendly error handling
      if (!cleanUserQuery.includes("select")) {
        setErrorMsg("Oops! Did you forget the 'SELECT' keyword?");
      } else if (!cleanUserQuery.includes("from")) {
        setErrorMsg("Hmm... I don't see 'FROM'. Where are we getting the data from?");
      } else {
        setErrorMsg("Not quite right! Check your spelling or look at the hint.");
      }
    }
  };

  const nextLevel = async () => {
    if (currentLevel < missions.length - 1) {
      const newLevel = currentLevel + 1;
      setCurrentLevel(newLevel);
      setQuery("");
      setShowResult(false);
      setErrorMsg("");
      // Save progress to backend
      try {
        const token = localStorage.getItem("access_token") || "";
        await updateSqlAcademyApi(newLevel, token);
      } catch (err) {
        console.error("Failed to save academy progress", err);
      }
    }
  };

  return (
    <div className="min-h-[90vh] h-auto md:h-[90vh] flex flex-col md:flex-row bg-slate-50 dark:bg-black p-4 gap-6 overflow-y-auto md:overflow-hidden relative">
      {showConfetti && <Confetti recycle={false} numberOfPieces={300} />}

      {/* Left Panel: Story & Instructions */}
      <div className="w-full md:w-1/3 lg:w-1/4 h-auto md:h-full flex flex-col border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900/50 shadow-sm shrink-0">
        <div className="p-5 bg-gradient-to-r from-purple-600 to-indigo-600 shrink-0">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Rocket size={24} />
            Cosmic Academy
          </h2>
          <p className="text-purple-100 text-sm mt-1 opacity-90">Start your SQL journey here</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-bold rounded-full uppercase tracking-wider">
                Mission {mission.id} / {missions.length}
              </span>
            </div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4">{mission.title}</h3>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed text-lg font-medium">
              {mission.instruction}
            </p>

            {showResult ? (
              <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-xl animate-fade-in-up">
                <p className="text-sm font-bold text-green-700 dark:text-green-500 mb-3 flex items-center gap-2">
                  <CheckCircle size={16} /> Code Explanation
                </p>
                <div className="space-y-3">
                  {explainQuery(mission.expectedQuery).map((exp, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm">
                      <code className="text-green-700 dark:text-green-400 font-bold bg-green-100 dark:bg-green-900/40 px-1.5 py-0.5 rounded shadow-sm">
                        {exp.keyword}
                      </code>
                      <span className="text-green-800 dark:text-green-300 mt-0.5 leading-tight">- {exp.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 rounded-xl">
                <p className="text-sm font-bold text-yellow-700 dark:text-yellow-500 mb-1 flex items-center gap-2">
                  <Lightbulb size={16} /> Hint
                </p>
                <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-4">{mission.hint}</p>
                <div className="inline-flex items-center bg-yellow-100 dark:bg-yellow-900/40 px-3 py-2 rounded-lg border border-yellow-300 dark:border-yellow-700/50">
                  <span className="text-xs font-bold text-yellow-800 dark:text-yellow-300 uppercase tracking-widest mr-3">Type:</span>
                  <code className="text-sm font-mono font-bold text-gray-900 dark:text-white select-all">{mission.expectedQuery}</code>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6">
            <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${((currentLevel) / missions.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Data & Terminal */}
      <div className="flex-1 flex flex-col gap-6 min-h-0">

        {/* Top Right: Visual Table */}
        <div className="order-2 md:order-1 min-h-[280px] md:min-h-0 md:h-1/2 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm overflow-hidden flex flex-col relative">
          <div className="p-4 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30 flex items-center gap-2">
            <Database size={20} className="text-blue-500" />
            <h3 className="font-bold text-gray-700 dark:text-gray-300">Database View</h3>
          </div>

          <div className="flex-1 overflow-auto p-4 bg-white dark:bg-black/50">
            {showResult ? (
              <div className="animate-fade-in-up">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      {mission.columns.map((col: any, i: number) => (
                        <th key={i} className="p-3 border-b-2 border-slate-200 dark:border-zinc-800 text-sm font-bold text-slate-600 dark:text-gray-400 uppercase tracking-wider">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {mission.tableData.map((row: any, i: number) => (
                      <tr key={i} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors border-b border-slate-100 dark:border-zinc-900">
                        {mission.columns.map((col: any, j: number) => (
                          <td key={j} className="p-3 text-gray-800 dark:text-gray-200 font-medium">
                            {row[col as keyof typeof row]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 space-y-4">
                <div className="p-4 rounded-full bg-slate-100 dark:bg-zinc-900">
                  <Database size={48} className="opacity-50" />
                </div>
                <p className="font-medium text-lg">Run a successful query to view the data</p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Right: Code Editor */}
        <div className="order-1 md:order-2 flex-1 min-h-[350px] md:min-h-0 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden flex flex-col">
          <div className="p-3 border-b border-slate-200 dark:border-gray-800 bg-slate-100 dark:bg-black flex items-center justify-between">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <span className="text-gray-500 text-sm font-mono">SQL Terminal</span>
          </div>

          <div className="flex-1 p-4 flex flex-col relative">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full flex-1 bg-transparent text-green-700 dark:text-green-400 font-mono text-xl md:text-2xl outline-none resize-none placeholder-slate-300 dark:placeholder-gray-700 p-2"
              placeholder="Type your SQL spell here..."
              spellCheck="false"
            />

            {errorMsg && (
              <div className="absolute bottom-20 left-4 right-4 bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-sm font-medium animate-pulse">
                {errorMsg}
              </div>
            )}

            {showResult && (
              <div className="absolute bottom-20 left-4 right-4 bg-green-500/10 border border-green-500/30 p-4 rounded-xl flex items-center justify-between animate-fade-in-up backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <CheckCircle size={24} className="text-green-500" />
                  <span className="text-green-400 font-bold">{mission.successMsg}</span>
                </div>
                {currentLevel < missions.length - 1 ? (
                  <button onClick={nextLevel} className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold flex items-center gap-2 transition-all">
                    Next Mission <ArrowRight size={18} />
                  </button>
                ) : (
                  <span className="px-4 py-2 bg-purple-600 text-white rounded-lg font-bold">Academy Completed! </span>
                )}
              </div>
            )}

            <div className="mt-4 flex justify-end">
              <button
                onClick={handleRunQuery}
                disabled={showResult && currentLevel === missions.length - 1}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                <Play size={18} /> Run Query
              </button>
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
