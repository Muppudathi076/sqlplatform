import { useState } from "react";
import { X, CheckCircle2, XCircle, MousePointerClick, Undo2, ArrowRight, Trash2, SkipForward } from "lucide-react";
import ScoreBar from "../ReusableComponents/ScoreBar";
import { useQuestionCache } from "../../context/QuestionCacheContext";

type CheckState = "idle" | "correct" | "wrong";

export default function DragAndDropPage() {
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
  const [droppedItems, setDroppedItems] = useState<string[]>([]);
  const [checkingState, setCheckingState] = useState<CheckState>("idle");

  const isAnswered = checkingState !== "idle";
  console.log("Passing score:", totalScore);
  if (!questionData) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a1a]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-purple-900" />
            <div
              className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500"
              style={{ animation: "dd-spin 0.9s linear infinite" }}
            />
          </div>
          <p className="text-sm font-semibold text-gray-400">Loading question...</p>
        </div>
      </div>
    );
  }

  // Parse draggable options
  let draggableOptions: string[] = [];
  if (questionData.option) {
    if (Array.isArray(questionData.option)) {
      draggableOptions = questionData.option;
    } else if (typeof questionData.option === "string") {
      try {
        const parsed = JSON.parse(questionData.option);
        draggableOptions = Array.isArray(parsed) ? parsed : questionData.option.split(",").map((s: string) => s.trim());
      } catch {
        draggableOptions = questionData.option.split(",").map((s: string) =>
          s.replace(/^\[\"?|\"?\]$/g, "").replace(/(^\"|\"$)/g, "").trim()
        );
      }
    }
  }

  const correctAnswer = questionData.answer.trim().toLowerCase();

  // Add item to drop zone
  const handleAddItem = (item: string) => {
    if (isAnswered) return;
    if (droppedItems.includes(item)) return; // already added
    setDroppedItems((prev) => [...prev, item]);
  };

  // Remove item from drop zone
  const handleRemoveItem = (item: string) => {
    if (isAnswered) return;
    setDroppedItems((prev) => prev.filter((i) => i !== item));
  };

  // Clear all from drop zone
  const handleClearAll = () => {
    if (isAnswered) return;
    setDroppedItems([]);
  };

  // Check answer — join all dropped items and compare
  const handleCheck = () => {
    if (droppedItems.length === 0) return;
    const userAnswer = droppedItems.join(" ").trim().toLowerCase();
    setCheckingState(userAnswer === correctAnswer ? "correct" : "wrong");
  };

  const handleNext = async() => {
    await markComplete(droppedItems.join(" "));
    setCheckingState("idle");
    setDroppedItems([]);
    navigateToNextQuestion();
  };

  const handleSkip = () => {
    skipQuestion();
    setCheckingState("idle");
    setDroppedItems([]);
    navigateToNextQuestion();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0a0a1a]">
      {/* Animated BG */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] right-[-10%] w-[40%] h-[40%] rounded-full opacity-[0.06]"
          style={{ background: "radial-gradient(circle, #8b5cf6, transparent 70%)", animation: "dd-float 10s ease-in-out infinite" }} />
        <div className="absolute bottom-[-15%] left-[-10%] w-[35%] h-[35%] rounded-full opacity-[0.05]"
          style={{ background: "radial-gradient(circle, #f472b6, transparent 70%)", animation: "dd-float 10s ease-in-out infinite reverse" }} />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col max-w-2xl mx-auto px-4 py-5">

        {/* ── SINGLE TOP BAR ── */}
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
              background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(244,114,182,0.1))",
              border: "1px solid rgba(139,92,246,0.35)",
              color: "#c4b5fd",
            }}
          >
            {currentIndex + 1} / {questions.length}
          </div>
        </div>

        {/* ── QUESTION ── */}
        <div
          className="rounded-2xl p-6 sm:p-8 mb-6 relative overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-[2px]"
            style={{ background: "linear-gradient(90deg, #8b5cf6, #d946ef, #f472b6)" }} />

          <div className="flex items-center gap-2 mb-4">
            <MousePointerClick size={14} className="text-purple-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400/80">
              Drag & Drop — Arrange in Order
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
            {questionData.question}
          </h2>
        </div>

        {/* ── DROP ZONE — Ordered items appear here ── */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-white/40 uppercase tracking-widest pl-1">
              Your Arrangement
            </span>
            {droppedItems.length > 0 && !isAnswered && (
              <button
                onClick={handleClearAll}
                className="flex items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-bold text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all uppercase tracking-wider bg-transparent"
              >
                <Trash2 size={11} /> Clear All
              </button>
            )}
          </div>

          <div
            className="min-h-[80px] rounded-2xl p-4 flex flex-wrap gap-2 items-center transition-all duration-300"
            style={{
              background: droppedItems.length > 0
                ? checkingState === "correct" ? "rgba(34,197,94,0.08)" : checkingState === "wrong" ? "rgba(239,68,68,0.08)" : "rgba(139,92,246,0.06)"
                : "rgba(255,255,255,0.02)",
              border: droppedItems.length > 0
                ? checkingState === "correct" ? "2px solid rgba(34,197,94,0.4)" : checkingState === "wrong" ? "2px solid rgba(239,68,68,0.4)" : "2px dashed rgba(139,92,246,0.3)"
                : "2px dashed rgba(255,255,255,0.08)",
              boxShadow: checkingState === "correct" ? "0 0 20px rgba(34,197,94,0.15)" : checkingState === "wrong" ? "0 0 20px rgba(239,68,68,0.15)" : "none",
            }}
          >
            {droppedItems.length === 0 ? (
              <p className="text-white/20 text-sm w-full text-center py-2">
                Tap the options below to arrange them in correct order
              </p>
            ) : (
              droppedItems.map((item, i) => (
                <button
                  key={`${item}-${i}`}
                  onClick={() => handleRemoveItem(item)}
                  disabled={isAnswered}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 disabled:cursor-default group"
                  style={{
                    background:
                      checkingState === "correct" ? "rgba(34,197,94,0.15)"
                        : checkingState === "wrong" ? "rgba(239,68,68,0.15)"
                        : "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(168,85,247,0.15))",
                    border:
                      checkingState === "correct" ? "1px solid rgba(34,197,94,0.5)"
                        : checkingState === "wrong" ? "1px solid rgba(239,68,68,0.5)"
                        : "1px solid rgba(139,92,246,0.35)",
                    color:
                      checkingState === "correct" ? "#4ade80"
                        : checkingState === "wrong" ? "#f87171"
                        : "#c4b5fd",
                  }}
                >
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black"
                    style={{
                      background: checkingState === "correct" ? "rgba(34,197,94,0.3)" : checkingState === "wrong" ? "rgba(239,68,68,0.3)" : "rgba(139,92,246,0.3)",
                    }}
                  >
                    {i + 1}
                  </span>
                  {item}
                  {!isAnswered && (
                    <X size={12} className="opacity-0 group-hover:opacity-70 transition-opacity text-white/50" />
                  )}
                  {checkingState === "correct" && <CheckCircle2 size={14} className="text-green-400" />}
                  {checkingState === "wrong" && i === droppedItems.length - 1 && <XCircle size={14} className="text-red-400" />}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Show correct answer on wrong */}
        {checkingState === "wrong" && (
          <div className="px-2 mb-4">
            <p className="text-xs font-semibold text-green-400">
              ✅ Correct order: <span className="font-bold">{questionData.answer}</span>
            </p>
          </div>
        )}

        {/* ── OPTIONS TO PICK FROM ── */}
        <div className="flex flex-col gap-3 mb-6">
          <span className="text-xs font-semibold text-white/35 uppercase tracking-widest pl-1 text-center">
            Available Options
          </span>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-1">
            {draggableOptions.map((opt, i) => {
              const isUsed = droppedItems.includes(opt);
              return (
                <button
                  key={i}
                  onClick={() => handleAddItem(opt)}
                  disabled={isUsed || isAnswered}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all duration-300 transform disabled:cursor-not-allowed"
                  style={{
                    background: isUsed ? "rgba(255,255,255,0.02)" : "linear-gradient(135deg, #8b5cf6, #c084fc)",
                    border: isUsed ? "1px dashed rgba(255,255,255,0.08)" : "1px solid rgba(255,255,255,0.1)",
                    color: isUsed ? "rgba(255,255,255,0.15)" : "#fff",
                    boxShadow: isUsed ? "none" : "0 4px 15px rgba(139,92,246,0.3)",
                    opacity: isUsed ? 0.3 : 1,
                    transform: isUsed ? "scale(0.95)" : "scale(1)",
                  }}
                >
                  {isUsed ? (
                    <CheckCircle2 size={14} className="opacity-30" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-white/40" />
                  )}
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

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
                {checkingState === "correct" ? "Excellent! Perfect order! " : "Oops! Wrong order."}
              </p>
              {checkingState === "wrong" && (
                <p className="text-sm text-white/60">
                  Correct order: <span className="font-semibold text-green-400">{questionData.answer}</span>
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
                text-white/40 hover:text-white/60 hover:bg-white/5 transition-all bg-transparent"
            >
              <SkipForward size={15} /> Skip
            </button>
          ) : (
            <button
              onClick={handleClearAll}
              disabled
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border border-white/10
                text-white/20 opacity-30 cursor-not-allowed bg-transparent"
            >
              <Undo2 size={14} /> Reset
            </button>
          )}

          {!isAnswered ? (
            <button
              onClick={handleCheck}
              disabled={droppedItems.length === 0}
              className="relative flex items-center justify-center gap-2 px-8 py-3 rounded-xl
                text-white font-bold text-sm tracking-wide
                transition-all duration-300 hover:scale-105 active:scale-95
                disabled:cursor-not-allowed overflow-hidden min-w-[160px]"
              style={{
                background: droppedItems.length > 0 ? "linear-gradient(135deg, #8b5cf6, #d946ef)" : "rgba(139,92,246,0.3)",
                boxShadow: droppedItems.length > 0 ? "0 4px 25px rgba(139,92,246,0.5)" : "none",
                opacity: droppedItems.length === 0 ? 0.5 : 1,
              }}
            >
              {droppedItems.length > 0 && (
                <span className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)", animation: "dd-shimmer 2s ease-in-out infinite" }} />
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
                style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)", animation: "dd-shimmer 2s ease-in-out infinite" }} />
              {checkingState === "correct" ? <CheckCircle2 size={16} /> : <ArrowRight size={16} />} Next →
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes dd-spin { to { transform: rotate(360deg); } }
        @keyframes dd-shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        @keyframes dd-float {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(15px, -15px); }
        }
      `}</style>
    </div>
  );
}
