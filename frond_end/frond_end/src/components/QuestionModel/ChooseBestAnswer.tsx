import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { X, Brain, CheckCircle2, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import ScoreBar from "../ReusableComponents/ScoreBar";
import { useQuestionCache } from "../../context/QuestionCacheContext";

const OPTION_LABELS = ["A", "B", "C", "D"];

const OPTION_ACCENTS = [
  { border: "#818cf8", bg: "rgba(129,140,248,0.13)", label: "#818cf8" },
  { border: "#34d399", bg: "rgba(52,211,153,0.13)", label: "#34d399" },
  { border: "#fb923c", bg: "rgba(251,146,60,0.13)", label: "#fb923c" },
  { border: "#f472b6", bg: "rgba(244,114,182,0.13)", label: "#f472b6" },
];

type CheckState = "idle" | "checking" | "correct" | "wrong";

function ChooseBestAnswer() {
  const navigate = useNavigate();
  const {
    getCurrentQuestion,
    markComplete,
    navigateToNextQuestion,
    score,
    hearts,
    currentIndex,
    questions,
  } = useQuestionCache();

  const questionData = getCurrentQuestion();
  const [selectedOption, setSelectedOption] = useState("");
  const [checkingState, setCheckingState] = useState<CheckState>("idle");
  const [isAnswered, setIsAnswered] = useState(false);

  if (!questionData) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-[#0d0d1a]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-violet-200 dark:border-violet-900" />
            <div
              className="absolute inset-0 rounded-full border-4 border-transparent border-t-violet-500"
              style={{ animation: "spin 0.9s linear infinite" }}
            />
          </div>
          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Loading question...</p>
        </div>
      </div>
    );
  }

  let parsedOptions: string[] = [];
  if (Array.isArray(questionData.option)) {
    parsedOptions = questionData.option;
  } else if (typeof questionData.option === "string") {
    try {
      const parsed = JSON.parse(questionData.option);
      parsedOptions = Array.isArray(parsed) ? parsed : questionData.option.split(",");
    } catch {
      parsedOptions = questionData.option
        .split(",")
        .map((opt: string) =>
          opt.replace(/^\[\"?|\"?\]$/g, "").replace(/(^\"|\"$)/g, "").trim()
        );
    }
  }

  const options = parsedOptions;

  const handleCheck = () => {
    if (!selectedOption) {
      toast.error("Please select an option first!");
      return;
    }

    const isCorrect =
      selectedOption.trim().toLowerCase() ===
      questionData.answer.trim().toLowerCase();

    if (isCorrect) {
      setCheckingState("correct");
      toast.success("Correct! Great job ");
    } else {
      setCheckingState("wrong");
      toast.error("Oops! Wrong answer ");
    }
    setIsAnswered(true);
  };

  const handleNext = () => {
    markComplete(selectedOption);
    setCheckingState("idle");
    setSelectedOption("");
    setIsAnswered(false);
    navigateToNextQuestion();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-50 dark:bg-[#0d0d1a] transition-colors duration-300">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-[-100px] left-[-100px] w-[350px] h-[350px] rounded-full opacity-0 dark:opacity-[0.06]"
          style={{ background: "radial-gradient(circle, #6D28D9, transparent 70%)" }}
        />
        <div
          className="absolute bottom-[-80px] right-[-80px] w-[280px] h-[280px] rounded-full opacity-0 dark:opacity-[0.06]"
          style={{ background: "radial-gradient(circle, #EB2FF8, transparent 70%)" }}
        />
      </div>

      <div className="relative min-h-screen flex flex-col max-w-2xl mx-auto px-4 py-6 gap-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/api/dashboard")}
            title="Exit"
            aria-label="Exit quiz"
            className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 group"
            style={{
              background: "linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.08))",
              border: "1.5px solid rgba(239,68,68,0.45)",
              boxShadow: "0 2px 8px rgba(239,68,68,0.2)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "linear-gradient(135deg, rgba(239,68,68,0.35), rgba(239,68,68,0.2))";
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 4px 16px rgba(239,68,68,0.4)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.08))";
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 2px 8px rgba(239,68,68,0.2)";
            }}
          >
            <X size={18} style={{ color: "#f87171", strokeWidth: 2.5 }} />
          </button>

          <div className="flex-1 min-w-0">
            <ScoreBar score={score} maxScore={100} hearts={hearts} title="" />
          </div>

          <div
            className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold"
            style={{
              background: "linear-gradient(135deg, rgba(109,40,217,0.25), rgba(235,47,248,0.15))",
              border: "1px solid rgba(109,40,217,0.4)",
              color: "#c4b5fd",
            }}
          >
            {currentIndex + 1}
            <span className="opacity-40">/</span>
            {questions.length}
          </div>
        </div>

        <div
          className="rounded-2xl p-5 sm:p-7"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(16px)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Brain size={14} className="text-violet-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-violet-400">
              Choose Best Answer
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white leading-relaxed">
            {questionData.question}
          </h2>
        </div>

        <div className="flex flex-col gap-3">
          {options.map((opt: string, index: number) => {
            const isSelected = selectedOption === opt;
            const accent = OPTION_ACCENTS[index % OPTION_ACCENTS.length];

            let borderColor = "rgba(255,255,255,0.06)";
            let bgStyle = "rgba(255,255,255,0.03)";
            let labelBg = "#6b7280";
            let ringGlow = "none";
            let accentLine = "transparent";

            if (isSelected) {
              if (checkingState === "correct") {
                borderColor = "#22c55e";
                bgStyle = "rgba(34,197,94,0.10)";
                labelBg = "#22c55e";
                ringGlow = "0 0 20px rgba(34,197,94,0.35)";
                accentLine = "#22c55e";
              } else if (checkingState === "wrong") {
                borderColor = "#ef4444";
                bgStyle = "rgba(239,68,68,0.10)";
                labelBg = "#ef4444";
                ringGlow = "0 0 20px rgba(239,68,68,0.35)";
                accentLine = "#ef4444";
              } else {
                borderColor = accent.border;
                bgStyle = accent.bg;
                labelBg = accent.label;
                ringGlow = `0 0 16px ${accent.border}55`;
                accentLine = accent.border;
              }
            }

            return (
              <button
                key={index}
                onClick={() => { if (checkingState === "idle") setSelectedOption(opt); }}
                disabled={checkingState !== "idle"}
                className="relative flex items-center gap-4 w-full text-left px-4 py-4 rounded-xl transition-all duration-250 transform active:scale-[0.985] disabled:cursor-default"
                style={{
                  border: `1.5px solid ${borderColor}`,
                  background: bgStyle,
                  boxShadow: ringGlow,
                  backdropFilter: "blur(10px)",
                }}
              >
                {/* Left accent strip */}
                <div
                  className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full transition-all duration-300"
                  style={{ background: accentLine }}
                />

                {/* Letter label */}
                <span
                  className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white transition-all duration-300"
                  style={{
                    background: labelBg,
                    boxShadow: isSelected ? `0 0 10px ${labelBg}88` : "none",
                    transform: isSelected ? "scale(1.1)" : "scale(1)",
                  }}
                >
                  {OPTION_LABELS[index] ?? index + 1}
                </span>

                {/* Option text */}
                <span className="flex-1 text-sm sm:text-base font-medium text-gray-700 dark:text-white/85 leading-snug">
                  {opt}
                </span>

                {/* Right state indicator */}
                <span className="flex-shrink-0">
                  {isSelected && checkingState === "correct" && (
                    <CheckCircle2 size={22} color="#22c55e" />
                  )}
                  {isSelected && checkingState === "wrong" && (
                    <XCircle size={22} color="#ef4444" />
                  )}
                  {isSelected && (checkingState === "idle" || checkingState === "checking") && (
                    <span
                      className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                      style={{ borderColor: accent.border }}
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: accent.border }} />
                    </span>
                  )}
                  {!isSelected && (
                    <span className="w-5 h-5 rounded-full border-2 border-gray-200 dark:border-white/10 block" />
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── BOTTOM ACTIONS ── */}
        <div className="flex items-center justify-between gap-4 pt-1 pb-6">
          {/* Skip */}
          <button
            disabled={isAnswered}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 dark:border-white/10
              text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white/70
              hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-200
              disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Skip
          </button>

          {/* Check / Next button */}
          {!isAnswered ? (
            <button
              onClick={handleCheck}
              disabled={!selectedOption}
              className="relative flex items-center justify-center gap-2 px-8 py-3 rounded-xl
                text-white font-bold text-sm tracking-wide
                transition-all duration-300 transform hover:scale-105 active:scale-95
                disabled:cursor-not-allowed overflow-hidden min-w-[160px]"
              style={{
                background: "linear-gradient(135deg, #6D28D9, #EB2FF8)",
                boxShadow: "0 4px 20px rgba(109,40,217,0.5)",
                opacity: !selectedOption ? 0.5 : 1,
              }}
            >
              {/* Shimmer on idle+selected */}
              {selectedOption && (
                <span
                  className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)",
                    animation: "shimmer 2.2s ease-in-out infinite",
                  }}
                />
              )}
              Check Answer →
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="relative flex items-center justify-center gap-2 px-8 py-3 rounded-xl
                text-white font-bold text-sm tracking-wide
                transition-all duration-300 transform hover:scale-105 active:scale-95
                overflow-hidden min-w-[160px]"
              style={{
                background:
                  checkingState === "correct"
                    ? "linear-gradient(135deg, #16a34a, #22c55e)"
                    : "linear-gradient(135deg, #2563eb, #6366f1)",
                boxShadow:
                  checkingState === "correct"
                    ? "0 4px 20px rgba(34,197,94,0.45)"
                    : "0 4px 20px rgba(99,102,241,0.45)",
              }}
            >
              {/* Shimmer */}
              <span
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)",
                  animation: "shimmer 2.2s ease-in-out infinite",
                }}
              />
              {checkingState === "correct" ? (
                <><CheckCircle2 size={16} /> Next →</>
              ) : (
                <><XCircle size={16} /> Next →</>
              )}
            </button>
          )}
        </div>

      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default ChooseBestAnswer;