import { useState, useEffect } from "react";

type ScoreBarProps = {
  score: number | string
  title: string
  maxScore?: number
  hearts?: number
  progress?: number  // 0-100 completion % (questions answered / total). If omitted, falls back to score.
}

export default function ScoreBar({
  score,
  maxScore = 100,
  hearts = 5,
  title,
  progress,
}: ScoreBarProps) {
  const [currentPercentage, setCurrentPercentage] = useState(0);
  const [barPct, setBarPct] = useState(0);

  // Normalize score — handle both number (e.g. 45.5) and string (e.g. "45.5%" or "45.5")
  const normalizeScore = (raw: number | string): number => {
    if (typeof raw === "number") return raw;
    const parsed = parseFloat(raw.replace("%", ""));
    return isNaN(parsed) ? 0 : parsed;
  };

  useEffect(() => {
    const numericScore = normalizeScore(score);
    const timer = setTimeout(() => {
      setCurrentPercentage(Math.min(numericScore, 100));
      // Bar tracks progress (completion %) if provided, else falls back to score
      setBarPct(Math.min(progress !== undefined ? progress : numericScore, 100));
    }, 150);
    return () => clearTimeout(timer);
  }, [score, maxScore, progress]);

  return (
    <div className="w-full px-4 py-3">
      {title && (
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base font-bold text-black dark:text-white tracking-wide">
            {title}
          </h2>
          <span className="text-sm font-black bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            {currentPercentage.toFixed(1)}%
          </span>
        </div>
      )}

      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-4 bg-gray-200 dark:bg-zinc-800 rounded-full overflow-hidden relative border border-white/5">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${barPct}%`,
              background: "linear-gradient(90deg, #6D28D9, #EB2FF8)",
              boxShadow: "0 0 10px rgba(235,47,248,0.5)",
            }}
          />
          <span className="absolute inset-0 flex items-center justify-center text-white text-[10px] font-semibold drop-shadow-md">
            {barPct > 8 ? `${barPct.toFixed(0)}%` : ""}
          </span>
        </div>

        <div className="flex items-center gap-1 text-red-500 font-semibold text-base transition-transform hover:scale-110 cursor-default select-none">
          ❤️ <span>{hearts}</span>
        </div>
      </div>

      {/* Score label */}
      <p className="text-[10px] text-gray-400 mt-1.5 text-right">
        Score: <span className="font-bold text-gray-600 dark:text-gray-300">{normalizeScore(score).toFixed(1)} / {maxScore}</span>
      </p>
    </div>
  )
}