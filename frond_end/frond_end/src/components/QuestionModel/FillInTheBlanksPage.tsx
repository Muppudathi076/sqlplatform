// import { useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import { X, PenLine, CheckCircle2, XCircle, RotateCcw, ArrowRight, SkipForward } from "lucide-react";
import ScoreBar from "../ReusableComponents/ScoreBar";
import { useQuestionCache } from "../../context/QuestionCacheContext";

/** Remove blank entries and case-insensitive duplicates while keeping order. */
function deduplicateOptions(opts: string[]): string[] {
  const seen = new Set<string>();
  return opts.filter((o) => {
    const trimmed = o.trim();
    if (!trimmed) return false;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

type CheckState = "idle" | "correct" | "wrong";

export default function FillInTheBlanksPage() {
  // const navigate = useNavigate();
  const {
    getCurrentQuestion,
    markComplete,
    navigateToNextQuestion,
    skipQuestion,
    totalScore,
    hearts,
    currentIndex,
    questions,
    saveAndExit,
  } = useQuestionCache();

  const questionData = getCurrentQuestion();
  const [userInput, setUserInput] = useState("");
  const [checkingState, setCheckingState] = useState<CheckState>("idle");
  const inputRef = useRef<HTMLInputElement>(null);

  const isAnswered = checkingState !== "idle";

  if (!questionData) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a1a]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-purple-900" />
            <div
              className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500"
              style={{ animation: "fib-spin 0.9s linear infinite" }}
            />
          </div>
          <p className="text-sm font-semibold text-gray-400">Loading question...</p>
        </div>
      </div>
    );
  }

  /* ── Parse question with blanks ── */
  const rawQuestion: string = questionData.question;
  const parts = rawQuestion.split(/_{2,}|\{\{blank\}\}/gi);
  const hasBlank = parts.length > 1;

  /* ── Word bank from options ── */
  let rawWordBank: string[] = [];
  if (questionData.option) {
    if (Array.isArray(questionData.option)) {
      rawWordBank = questionData.option.map((s: string) => String(s).trim());
    } else if (typeof questionData.option === "string") {
      try {
        const parsed = JSON.parse(questionData.option);
        rawWordBank = Array.isArray(parsed)
          ? parsed.map((s: string) => String(s).trim())
          : questionData.option.split(",").map((s: string) => s.trim());
      } catch {
        rawWordBank = questionData.option.split(",").map((s: string) =>
          s.replace(/^\[\"?|\"?\]$/g, "").replace(/(^\"|\"$)/g, "").trim()
        );
      }
    }
  }

  // 🛡️ Safety net: deduplicate word bank before rendering
  const wordBank = deduplicateOptions(rawWordBank);

  const handleCheck = () => {
    if (!userInput.trim()) {
      inputRef.current?.focus();
      return;
    }
    const isCorrect = userInput.trim().toLowerCase() === questionData.answer.trim().toLowerCase();
    setCheckingState(isCorrect ? "correct" : "wrong");
  };

  const handleNext = () => {
    markComplete(userInput.trim());
    setCheckingState("idle");
    setUserInput("");
    navigateToNextQuestion();
  };

  const handleSkip = () => {
    skipQuestion();
    setCheckingState("idle");
    setUserInput("");
    navigateToNextQuestion();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (!isAnswered) handleCheck();
      else handleNext();
    }
  };

  const handleClear = () => {
    setUserInput("");
    inputRef.current?.focus();
  };

  /* ── Question display with inline blank ── */
  const QuestionDisplay = () => (
    <div className="text-lg sm:text-xl font-bold text-white leading-loose flex flex-wrap items-center gap-x-2 gap-y-3">
      {hasBlank ? (
        parts.map((part, i) => (
          <span key={i} className="flex items-center gap-x-2 flex-wrap">
            <span>{part}</span>
            {i < parts.length - 1 && (
              <span
                className="inline-flex items-center min-w-[120px] px-3 py-1 rounded-lg border-b-2 border-dashed font-mono text-base transition-all duration-300"
                style={{
                  borderColor:
                    checkingState === "correct" ? "#22c55e"
                      : checkingState === "wrong" ? "#ef4444"
                      : "#818cf8",
                  background:
                    checkingState === "correct" ? "rgba(34,197,94,0.1)"
                      : checkingState === "wrong" ? "rgba(239,68,68,0.1)"
                      : "rgba(129,140,248,0.1)",
                  color:
                    checkingState === "correct" ? "#22c55e"
                      : checkingState === "wrong" ? "#ef4444"
                      : "#a5b4fc",
                }}
              >
                {userInput || (
                  <span className="opacity-40 text-sm italic">type here</span>
                )}
              </span>
            )}
          </span>
        ))
      ) : (
        <span>{rawQuestion}</span>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0a0a1a]">
      {/* Animated BG */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] left-[-10%] w-[40%] h-[40%] rounded-full opacity-[0.06]"
          style={{ background: "radial-gradient(circle, #6D28D9, transparent 70%)", animation: "fib-float 10s ease-in-out infinite" }} />
        <div className="absolute bottom-[-15%] right-[-10%] w-[35%] h-[35%] rounded-full opacity-[0.06]"
          style={{ background: "radial-gradient(circle, #EB2FF8, transparent 70%)", animation: "fib-float 10s ease-in-out infinite reverse" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50%] h-[50%] rounded-full opacity-[0.03]"
          style={{ background: "radial-gradient(circle, #06b6d4, transparent 60%)" }} />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col max-w-2xl mx-auto px-4 py-5">

        {/* ── SINGLE TOP BAR: Close + ScoreBar + Counter ── */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={saveAndExit}
            className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
            style={{
              background: "rgba(239,68,68,0.12)",
              border: "1.5px solid rgba(239,68,68,0.4)",
            }}
          >
            <X size={16} className="text-red-400" strokeWidth={2.5} />
          </button>

          <div className="flex-1 min-w-0">
            <ScoreBar score={totalScore} maxScore={100} hearts={hearts} title="" />
          </div>

          <div className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold"
            style={{
              background: "linear-gradient(135deg, rgba(109,40,217,0.25), rgba(235,47,248,0.15))",
              border: "1px solid rgba(109,40,217,0.4)",
              color: "#c4b5fd",
            }}
          >
            {currentIndex + 1} / {questions.length}
          </div>
        </div>

        {/* ── QUESTION CARD ── */}
        <div
          className="rounded-2xl p-6 sm:p-8 mb-6 relative overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          {/* Accent line */}
          <div className="absolute top-0 left-0 right-0 h-[2px]"
            style={{ background: "linear-gradient(90deg, #6D28D9, #EB2FF8, #06b6d4)" }} />

          <div className="flex items-center gap-2 mb-4">
            <PenLine size={14} className="text-indigo-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400/80">
              Fill in the Blank
            </span>
          </div>

          <QuestionDisplay />
        </div>

        {/* ── TEXT INPUT ── */}
        <div className="flex flex-col gap-2 mb-4">
          <label className="text-xs font-semibold text-white/40 uppercase tracking-widest pl-1">
            Your Answer
          </label>
          <div className="relative flex items-center">
            <div
              className="flex-1 relative flex items-center rounded-xl overflow-hidden transition-all duration-300"
              style={{
                border:
                  checkingState === "correct" ? "1.5px solid #22c55e"
                    : checkingState === "wrong" ? "1.5px solid #ef4444"
                    : "1.5px solid rgba(129,140,248,0.35)",
                background:
                  checkingState === "correct" ? "rgba(34,197,94,0.07)"
                    : checkingState === "wrong" ? "rgba(239,68,68,0.07)"
                    : "rgba(255,255,255,0.04)",
                boxShadow:
                  checkingState === "correct" ? "0 0 20px rgba(34,197,94,0.2)"
                    : checkingState === "wrong" ? "0 0 20px rgba(239,68,68,0.2)"
                    : "none",
                backdropFilter: "blur(12px)",
              }}
            >
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={(e) => {
                  if (!isAnswered) setUserInput(e.target.value);
                }}
                onKeyDown={handleKeyDown}
                disabled={isAnswered}
                placeholder="Type your answer here..."
                className="w-full px-5 py-4 bg-transparent text-base font-medium text-white placeholder-white/25 outline-none disabled:cursor-not-allowed"
              />

              {/* Clear button */}
              {userInput && !isAnswered && (
                <button
                  onClick={handleClear}
                  className="pr-4 text-white/30 hover:text-white/60 transition-colors"
                >
                  <RotateCcw size={15} />
                </button>
              )}

              {/* State icon */}
              {checkingState === "correct" && (
                <span className="pr-4"><CheckCircle2 size={20} color="#22c55e" /></span>
              )}
              {checkingState === "wrong" && (
                <span className="pr-4"><XCircle size={20} color="#ef4444" /></span>
              )}
            </div>
          </div>

          {/* Show correct answer when wrong */}
          {checkingState === "wrong" && (
            <p className="text-xs font-semibold pl-1 text-green-400">
              ✅ Correct answer: <span className="font-bold">{questionData.answer}</span>
            </p>
          )}
        </div>

        {/* ── WORD BANK ── */}
        {wordBank.length > 0 && (
          <div className="flex flex-col gap-3 mb-6">
            <span className="text-xs font-semibold text-white/35 uppercase tracking-widest pl-1">
              Word Bank
            </span>
            <div className="flex flex-wrap gap-2">
              {wordBank.map((word, i) => {
                const isChosen = userInput === word;
                return (
                  <button
                    key={i}
                    onClick={() => {
                      if (!isAnswered) setUserInput(word);
                    }}
                    disabled={isAnswered}
                    className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95 hover:scale-105 disabled:cursor-not-allowed"
                    style={{
                      background: isChosen
                        ? "linear-gradient(135deg, #6D28D9, #EB2FF8)"
                        : "rgba(255,255,255,0.05)",
                      border: isChosen
                        ? "1.5px solid rgba(109,40,217,0.7)"
                        : "1.5px solid rgba(255,255,255,0.1)",
                      color: isChosen ? "#fff" : "rgba(255,255,255,0.5)",
                      boxShadow: isChosen ? "0 0 14px rgba(109,40,217,0.4)" : "none",
                    }}
                  >
                    {word}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── FEEDBACK BANNER ── */}
        {isAnswered && (
          <div
            className="rounded-2xl px-5 py-4 flex items-start gap-3 mb-2"
            style={
              checkingState === "correct"
                ? { background: "rgba(34,197,94,0.10)", border: "1.5px solid rgba(34,197,94,0.4)", boxShadow: "0 4px 20px rgba(34,197,94,0.15)" }
                : { background: "rgba(239,68,68,0.10)", border: "1.5px solid rgba(239,68,68,0.4)", boxShadow: "0 4px 20px rgba(239,68,68,0.15)" }
            }
          >
            {checkingState === "correct"
              ? <CheckCircle2 size={22} color="#22c55e" className="flex-shrink-0 mt-0.5" />
              : <XCircle size={22} color="#ef4444" className="flex-shrink-0 mt-0.5" />
            }
            <div className="flex flex-col gap-0.5">
              <p className="font-bold text-sm" style={{ color: checkingState === "correct" ? "#22c55e" : "#ef4444" }}>
                {checkingState === "correct" ? "Excellent! That's correct! 🎉" : "Oops! That's wrong."}
              </p>
              {checkingState === "wrong" && (
                <p className="text-sm text-white/60">
                  Correct answer: <span className="font-semibold text-green-400">{questionData.answer}</span>
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── BOTTOM ACTIONS ── */}
        <div className="flex items-center justify-between gap-4 mt-auto pb-6">
          {!isAnswered ? (
            <button
              onClick={handleSkip}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border border-white/10
                text-white/40 hover:text-white/60 hover:bg-white/5 transition-all"
            >
              <SkipForward size={15} /> Skip
            </button>
          ) : <div />}

          {!isAnswered ? (
            <button
              onClick={handleCheck}
              disabled={!userInput.trim()}
              className="relative flex items-center justify-center gap-2 px-8 py-3 rounded-xl
                text-white font-bold text-sm tracking-wide
                transition-all duration-300 hover:scale-105 active:scale-95
                disabled:cursor-not-allowed overflow-hidden min-w-[160px]"
              style={{
                background: userInput.trim() ? "linear-gradient(135deg, #6D28D9, #EB2FF8)" : "rgba(109,40,217,0.3)",
                boxShadow: userInput.trim() ? "0 4px 25px rgba(109,40,217,0.5)" : "none",
                opacity: !userInput.trim() ? 0.5 : 1,
              }}
            >
              {userInput.trim() && (
                <span className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)", animation: "fib-shimmer 2s ease-in-out infinite" }} />
              )}
              Check Answer
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="relative flex items-center justify-center gap-2 px-8 py-3 rounded-xl
                text-white font-bold text-sm tracking-wide
                transition-all duration-300 hover:scale-105 active:scale-95
                overflow-hidden min-w-[160px]"
              style={{
                background: checkingState === "correct" ? "linear-gradient(135deg, #16a34a, #22c55e)" : "linear-gradient(135deg, #2563eb, #6366f1)",
                boxShadow: checkingState === "correct" ? "0 4px 25px rgba(34,197,94,0.45)" : "0 4px 25px rgba(99,102,241,0.45)",
              }}
            >
              <span className="absolute inset-0 opacity-20 pointer-events-none"
                style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)", animation: "fib-shimmer 2s ease-in-out infinite" }} />
              {checkingState === "correct" ? <CheckCircle2 size={16} /> : <ArrowRight size={16} />} Next →
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fib-spin { to { transform: rotate(360deg); } }
        @keyframes fib-shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        @keyframes fib-float {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(15px, -15px); }
        }
      `}</style>
    </div>
  );
}
