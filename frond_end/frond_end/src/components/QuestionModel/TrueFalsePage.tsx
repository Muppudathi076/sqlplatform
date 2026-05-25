import { useState } from "react";
import { X, CheckCircle2, XCircle, ArrowRight, Zap, SkipForward } from "lucide-react";
import ScoreBar from "../ReusableComponents/ScoreBar";
import { useQuestionCache } from "../../context/QuestionCacheContext";

type CheckState = "idle" | "correct" | "wrong";

export default function TrueFalsePage() {
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
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [checkingState, setCheckingState] = useState<CheckState>("idle");

  const isAnswered = checkingState !== "idle";

  if (!questionData) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d0d1a]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-purple-900" />
            <div
              className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500"
              style={{ animation: "tf-spin 0.9s linear infinite" }}
            />
          </div>
          <p className="text-sm font-semibold text-gray-400">Loading question...</p>
        </div>
      </div>
    );
  }

  const correctAnswer = questionData.answer.trim().toLowerCase();
  const isTrueCorrect = correctAnswer === "true";

  const handleSelect = (choice: string) => {
    if (isAnswered) return;
    setSelectedOption(choice);
  };

  const handleCheck = () => {
    if (!selectedOption) return;
    const isCorrect = selectedOption.toLowerCase() === correctAnswer;
    setCheckingState(isCorrect ? "correct" : "wrong");
  };

  const handleNext = () => {
    markComplete(selectedOption);
    setCheckingState("idle");
    setSelectedOption("");
    navigateToNextQuestion();
  };

  const handleSkip = () => {
    skipQuestion();
    setCheckingState("idle");
    setSelectedOption("");
    navigateToNextQuestion();
  };

  // Get styling for True button
  const getTrueStyle = () => {
    const isSelected = selectedOption === "True";
    const showCorrect = isAnswered && isTrueCorrect;
    const showWrong = isAnswered && isSelected && !isTrueCorrect;

    if (showCorrect) return { bg: "rgba(34,197,94,0.15)", border: "#22c55e", shadow: "0 0 35px rgba(34,197,94,0.35)", ring: "rgba(34,197,94,0.3)" };
    if (showWrong) return { bg: "rgba(239,68,68,0.15)", border: "#ef4444", shadow: "0 0 35px rgba(239,68,68,0.35)", ring: "rgba(239,68,68,0.3)" };
    if (isSelected) return { bg: "rgba(16,185,129,0.12)", border: "#10b981", shadow: "0 0 25px rgba(16,185,129,0.25)", ring: "rgba(16,185,129,0.2)" };
    return { bg: "rgba(255,255,255,0.03)", border: "rgba(16,185,129,0.25)", shadow: "0 4px 20px rgba(0,0,0,0.15)", ring: "transparent" };
  };

  // Get styling for False button
  const getFalseStyle = () => {
    const isSelected = selectedOption === "False";
    const showCorrect = isAnswered && !isTrueCorrect;
    const showWrong = isAnswered && isSelected && isTrueCorrect;

    if (showCorrect) return { bg: "rgba(34,197,94,0.15)", border: "#22c55e", shadow: "0 0 35px rgba(34,197,94,0.35)", ring: "rgba(34,197,94,0.3)" };
    if (showWrong) return { bg: "rgba(239,68,68,0.15)", border: "#ef4444", shadow: "0 0 35px rgba(239,68,68,0.35)", ring: "rgba(239,68,68,0.3)" };
    if (isSelected) return { bg: "rgba(239,68,68,0.12)", border: "#ef4444", shadow: "0 0 25px rgba(239,68,68,0.25)", ring: "rgba(239,68,68,0.2)" };
    return { bg: "rgba(255,255,255,0.03)", border: "rgba(239,68,68,0.25)", shadow: "0 4px 20px rgba(0,0,0,0.15)", ring: "transparent" };
  };

  const trueStyle = getTrueStyle();
  const falseStyle = getFalseStyle();

  const trueShowCorrect = isAnswered && isTrueCorrect;
  const trueShowWrong = isAnswered && selectedOption === "True" && !isTrueCorrect;
  const falseShowCorrect = isAnswered && !isTrueCorrect;
  const falseShowWrong = isAnswered && selectedOption === "False" && isTrueCorrect;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0a0a1a]">
      {/* Animated BG */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] left-[-10%] w-[45%] h-[45%] rounded-full opacity-[0.05]"
          style={{ background: "radial-gradient(circle, #10b981, transparent 70%)", animation: "tf-float 8s ease-in-out infinite" }} />
        <div className="absolute bottom-[-15%] right-[-10%] w-[45%] h-[45%] rounded-full opacity-[0.05]"
          style={{ background: "radial-gradient(circle, #ef4444, transparent 70%)", animation: "tf-float 8s ease-in-out infinite reverse" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full opacity-[0.03]"
          style={{ background: "radial-gradient(circle, #8b5cf6, transparent 60%)" }} />
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
              background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(168,85,247,0.1))",
              border: "1px solid rgba(139,92,246,0.35)",
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
          {/* Accent line top */}
          <div className="absolute top-0 left-0 right-0 h-[2px]"
            style={{ background: "linear-gradient(90deg, #10b981, #8b5cf6, #ef4444)" }} />

          <div className="flex items-center gap-2 mb-4">
            <Zap size={14} className="text-amber-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400/80">
              True or False
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
            {questionData.question}
          </h2>
        </div>

        {/* ── VS BATTLE: TRUE vs FALSE ── */}
        <div className="flex-1 flex flex-col gap-4 mb-6">

          {/* VS Divider label */}
          <div className="flex items-center gap-4 px-2">
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/20">
              Choose your answer
            </span>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
          </div>

          {/* TRUE Card */}
          <button
            onClick={() => handleSelect("True")}
            disabled={isAnswered}
            className="relative flex items-center gap-5 p-5 rounded-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-default group"
            style={{
              background: trueStyle.bg,
              border: `2px solid ${trueStyle.border}`,
              boxShadow: trueStyle.shadow,
            }}
          >
            {/* Pulse ring */}
            {selectedOption === "True" && !isAnswered && (
              <div className="absolute inset-0 rounded-2xl animate-pulse" style={{ boxShadow: `inset 0 0 30px ${trueStyle.ring}` }} />
            )}

            {/* Icon */}
            <div className="relative flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center transition-transform duration-300"
              style={{
                background: trueShowCorrect ? "rgba(34,197,94,0.25)" : trueShowWrong ? "rgba(239,68,68,0.25)" : "rgba(16,185,129,0.12)",
                transform: selectedOption === "True" ? "scale(1.1)" : "scale(1)",
              }}
            >
              {trueShowCorrect ? <CheckCircle2 size={32} className="text-green-400" />
                : trueShowWrong ? <XCircle size={32} className="text-red-400" />
                : <span className="text-3xl">✅</span>
              }
            </div>

            {/* Text */}
            <div className="flex-1 text-left">
              <p className={`text-xl font-black uppercase tracking-widest transition-colors duration-300 ${
                trueShowCorrect ? "text-green-400" : trueShowWrong ? "text-red-400" : "text-emerald-400"
              }`}>True</p>
              <p className="text-[11px] text-white/30 mt-0.5">This statement is correct</p>
            </div>

            {/* Radio */}
            <div className="flex-shrink-0">
              {trueShowCorrect ? (
                <div className="w-7 h-7 rounded-full bg-green-500/20 border-2 border-green-400 flex items-center justify-center">
                  <CheckCircle2 size={14} className="text-green-400" />
                </div>
              ) : trueShowWrong ? (
                <div className="w-7 h-7 rounded-full bg-red-500/20 border-2 border-red-400 flex items-center justify-center">
                  <XCircle size={14} className="text-red-400" />
                </div>
              ) : selectedOption === "True" ? (
                <div className="w-7 h-7 rounded-full border-2 border-emerald-400 flex items-center justify-center">
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-400" />
                </div>
              ) : (
                <div className="w-7 h-7 rounded-full border-2 border-white/15 group-hover:border-emerald-400/50 transition-colors" />
              )}
            </div>
          </button>

          {/* VS Badge */}
          <div className="flex items-center justify-center">
            <div className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, rgba(139,92,246,0.15), rgba(168,85,247,0.08))",
                border: "1px solid rgba(139,92,246,0.3)",
              }}
            >
              <span className="text-xs font-black text-purple-400">VS</span>
            </div>
          </div>

          {/* FALSE Card */}
          <button
            onClick={() => handleSelect("False")}
            disabled={isAnswered}
            className="relative flex items-center gap-5 p-5 rounded-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-default group"
            style={{
              background: falseStyle.bg,
              border: `2px solid ${falseStyle.border}`,
              boxShadow: falseStyle.shadow,
            }}
          >
            {/* Pulse ring */}
            {selectedOption === "False" && !isAnswered && (
              <div className="absolute inset-0 rounded-2xl animate-pulse" style={{ boxShadow: `inset 0 0 30px ${falseStyle.ring}` }} />
            )}

            {/* Icon */}
            <div className="relative flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center transition-transform duration-300"
              style={{
                background: falseShowCorrect ? "rgba(34,197,94,0.25)" : falseShowWrong ? "rgba(239,68,68,0.25)" : "rgba(239,68,68,0.12)",
                transform: selectedOption === "False" ? "scale(1.1)" : "scale(1)",
              }}
            >
              {falseShowCorrect ? <CheckCircle2 size={32} className="text-green-400" />
                : falseShowWrong ? <XCircle size={32} className="text-red-400" />
                : <span className="text-3xl">❌</span>
              }
            </div>

            {/* Text */}
            <div className="flex-1 text-left">
              <p className={`text-xl font-black uppercase tracking-widest transition-colors duration-300 ${
                falseShowCorrect ? "text-green-400" : falseShowWrong ? "text-red-400" : "text-red-400"
              }`}>False</p>
              <p className="text-[11px] text-white/30 mt-0.5">This statement is incorrect</p>
            </div>

            {/* Radio */}
            <div className="flex-shrink-0">
              {falseShowCorrect ? (
                <div className="w-7 h-7 rounded-full bg-green-500/20 border-2 border-green-400 flex items-center justify-center">
                  <CheckCircle2 size={14} className="text-green-400" />
                </div>
              ) : falseShowWrong ? (
                <div className="w-7 h-7 rounded-full bg-red-500/20 border-2 border-red-400 flex items-center justify-center">
                  <XCircle size={14} className="text-red-400" />
                </div>
              ) : selectedOption === "False" ? (
                <div className="w-7 h-7 rounded-full border-2 border-red-400 flex items-center justify-center">
                  <span className="w-3.5 h-3.5 rounded-full bg-red-400" />
                </div>
              ) : (
                <div className="w-7 h-7 rounded-full border-2 border-white/15 group-hover:border-red-400/50 transition-colors" />
              )}
            </div>
          </button>
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
        <div className="flex items-center justify-between gap-4 pb-6">
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
              disabled={!selectedOption}
              className="relative flex items-center justify-center gap-2 px-8 py-3 rounded-xl
                text-white font-bold text-sm tracking-wide
                transition-all duration-300 hover:scale-105 active:scale-95
                disabled:cursor-not-allowed overflow-hidden min-w-[160px]"
              style={{
                background: selectedOption ? "linear-gradient(135deg, #8b5cf6, #a855f7)" : "rgba(139,92,246,0.3)",
                boxShadow: selectedOption ? "0 4px 25px rgba(139,92,246,0.45)" : "none",
                opacity: !selectedOption ? 0.5 : 1,
              }}
            >
              {selectedOption && (
                <span className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)", animation: "tf-shimmer 2s ease-in-out infinite" }} />
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
                style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)", animation: "tf-shimmer 2s ease-in-out infinite" }} />
              {checkingState === "correct" ? <CheckCircle2 size={16} /> : <ArrowRight size={16} />} Next →
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes tf-spin { to { transform: rotate(360deg); } }
        @keyframes tf-shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        @keyframes tf-float {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(20px, -20px); }
        }
      `}</style>
    </div>
  );
}
