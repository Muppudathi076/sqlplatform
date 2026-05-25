import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, ArrowRight, Loader2, Trophy, Target, Sparkles } from "lucide-react";
import { useQuestionCache } from "../../context/QuestionCacheContext";
import { submitModelResultsApi } from "../../auth/authapi";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function ModelSuccessPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { resetCache } = useQuestionCache();

  const modelId = state?.modelId || "?";
  const totalQuestions = state?.totalQuestions || 0;
  const score = state?.score || 0;
  const completedQuestions = state?.completedQuestions || [];

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Submit results to backend on page load, then auto-navigate to dashboard
  useEffect(() => {
    setMounted(true);

    const submitResults = async () => {
      if (isSubmitted || completedQuestions.length === 0) return;

      setIsSubmitting(true);
      try {
        const token = localStorage.getItem("access_token") || "";
        await submitModelResultsApi(Number(modelId), completedQuestions, token);
        setIsSubmitted(true);
        toast.success("Progress saved successfully!", { duration: 3000 });

        // Auto-navigation removed so user can manually click "Next Level" or "Dashboard"
      } catch (e) {
        console.error("Failed to submit results:", e);
        toast.error("Failed to save progress, but you can retry");
      } finally {
        setIsSubmitting(false);
      }
    };

    submitResults();
  }, []);

  const handleNextModel = () => {
    resetCache();
    // Navigate to Model page for next level — this will hit the API for next level
    navigate(`/api/modal/${Number(modelId) + 1}`);
  };

  const handleDashboard = () => {
    resetCache();
    navigate("/api/dashboard");
  };

  const correctCount = completedQuestions.filter((q: any) => q.isCorrect).length;

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a1a] flex items-center justify-center p-6 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-[0.08]"
          style={{ background: "radial-gradient(circle, #22c55e, transparent 70%)" }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-[0.08]"
          style={{ background: "radial-gradient(circle, #6366f1, transparent 70%)" }}
        />
        {/* Confetti particles */}
        {mounted && [...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: ["#22c55e", "#6366f1", "#f59e0b", "#ec4899", "#06b6d4"][i % 5],
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `confetti-fall ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
              opacity: 0.6,
            }}
          />
        ))}
      </div>

      <div
        className={`relative z-10 w-full max-w-lg transition-all duration-1000 ${
          mounted ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"
        }`}
      >
        <div
          className="rounded-[2rem] p-8 sm:p-10 text-center overflow-hidden relative"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(24px)",
            boxShadow: "0 25px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          {/* Glow */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-green-500/20 rounded-full blur-[80px] animate-pulse" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-indigo-500/15 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: "1s" }} />

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div
              className="relative w-24 h-24 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-900/30 border-2 border-green-500/50 flex items-center justify-center shadow-[0_0_40px_rgba(34,197,94,0.3)]"
            >
              <CheckCircle size={48} className="text-green-400 animate-bounce" style={{ animationDuration: "2s" }} />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-black text-white mb-2 flex items-center justify-center gap-2">
            <Sparkles size={24} className="text-yellow-400" />
            Level {modelId} Complete!
            <Sparkles size={24} className="text-yellow-400" />
          </h1>
          <p className="text-white/40 text-sm mb-8">
            Great job! You've completed all questions in this level.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            <div
              className="rounded-2xl p-4"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <Target size={20} className="text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-black text-white">{totalQuestions}</p>
              <p className="text-[10px] text-white/40 uppercase tracking-wider font-bold">Questions</p>
            </div>
            <div
              className="rounded-2xl p-4"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <Trophy size={20} className="text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-black text-green-400">{correctCount}</p>
              <p className="text-[10px] text-white/40 uppercase tracking-wider font-bold">Correct</p>
            </div>
            <div
              className="rounded-2xl p-4"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <Sparkles size={20} className="text-purple-400 mx-auto mb-2" />
              <p className="text-2xl font-black text-purple-400">{score}%</p>
              <p className="text-[10px] text-white/40 uppercase tracking-wider font-bold">Score</p>
            </div>
          </div>

          {/* Submission status */}
          {isSubmitting && (
            <div className="flex items-center justify-center gap-2 mb-4 text-white/50 text-sm">
              <Loader2 size={14} className="animate-spin" />
              Saving progress to server...
            </div>
          )}
          {isSubmitted && (
            <div className="flex items-center justify-center gap-2 mb-4 text-green-400 text-sm font-semibold">
              <CheckCircle size={14} />
              Progress saved!
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleNextModel}
              disabled={isSubmitting}
              className="group w-full py-3.5 rounded-xl text-white font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 overflow-hidden relative"
              style={{
                background: "linear-gradient(135deg, #6D28D9, #EB2FF8)",
                boxShadow: "0 4px 25px rgba(109,40,217,0.4)",
              }}
            >
              <span
                className="absolute inset-0 opacity-0 group-hover:opacity-20 pointer-events-none"
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)",
                  animation: "shimmer 2s ease-in-out infinite",
                }}
              />
              Next Level <ArrowRight size={16} />
            </button>
            <button
              onClick={handleDashboard}
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl text-white/60 font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] border border-white/10 hover:bg-white/5 disabled:opacity-50"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes confetti-fall {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.6; }
          25% { transform: translateY(-30px) rotate(90deg); opacity: 1; }
          50% { transform: translateY(-10px) rotate(180deg); opacity: 0.8; }
          75% { transform: translateY(-40px) rotate(270deg); opacity: 0.5; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
