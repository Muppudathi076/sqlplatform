import toast from "react-hot-toast"
import { CheckCircle, AlertTriangle, RefreshCw, ArrowLeft, ServerCrash } from "lucide-react"
import StatusPage from "./StatusPage"
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { questionapiApi } from "../auth/authapi";
import { useQuestionCache } from "../context/QuestionCacheContext";
import LevelLockedPage from "./LevelLockedPage";

const routeMap: Record<string, string> = {
  "choose the best answer": "/api/modal/choose/answer",
  "true or false": "/api/modal/true-false",
  "fill the missing query": "/api/modal/fling/blangs",
  "drag and drop": "/api/modal/drag-drop",
  code_output: "/api/output",
  syntax_fix: "/api/syntax-fix",
  order_query: "/api/order-query",
  join_match: "/api/join-match",
  error_find: "/api/error-find",
  sql_write: "/api/sql-write",
  sql_result: "/api/sql-result",
  guess_output: "/api/guess-output",
  true_false: "/api/true-false",
  puzzle: "/api/puzzle",
  case_study: "/api/case-study",
};

/* ─── Error Page Component ─── */
function ErrorPage({ errorMessage, onRetry }: { errorMessage: string; onRetry: () => void }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0d0d1a] relative overflow-hidden">
      {/* Background ambient orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full opacity-[0.08]"
          style={{ background: "radial-gradient(circle, #f59e0b, transparent 70%)" }}
        />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[350px] h-[350px] rounded-full opacity-[0.08]"
          style={{ background: "radial-gradient(circle, #ef4444, transparent 70%)" }}
        />
      </div>

      <div
        className="relative z-10 w-full max-w-md bg-white/[0.04] border border-white/10 rounded-[2rem] p-8 sm:p-10 text-center backdrop-blur-xl"
        style={{ boxShadow: "0 20px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)" }}
      >
        {/* Animated Icon */}
        <div className="flex justify-center mb-8 relative">
          <div className="absolute inset-0 rounded-full bg-amber-500/20 animate-ping" style={{ animationDuration: "2.5s" }} />
          <div
            className="relative w-32 h-32 rounded-full bg-gradient-to-br from-amber-500/10 to-orange-900/30 border-2 border-amber-500/50 flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.3)] animate-pulse"
            style={{ animationDuration: "2.5s" }}
          >
            <div className="animate-bounce" style={{ animationDuration: "2s" }}>
              <ServerCrash size={56} className="text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.8)]" strokeWidth={2} />
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-white mb-2 tracking-wide">
          Oops! Something Went Wrong
        </h1>

        <div className="inline-block px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 mb-4">
          <p className="text-amber-400 font-bold text-base flex items-center gap-2 justify-center">
            <AlertTriangle size={18} />
            {errorMessage}
          </p>
        </div>

        {/* Friendly Message */}
        <p className="text-gray-400 text-sm mb-8 leading-relaxed">
          We couldn't load the questions for this level. This might be a server issue or network problem. Please try again!
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onRetry}
            className="w-full py-3.5 rounded-xl text-white font-bold tracking-wide flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105 active:scale-95"
            style={{
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              boxShadow: "0 4px 20px rgba(245, 158, 11, 0.4)",
            }}
          >
            <RefreshCw size={18} />
            Try Again
          </button>
          <button
            onClick={() => navigate("/api/dashboard")}
            className="w-full py-3.5 rounded-xl text-white/70 font-bold tracking-wide flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105 active:scale-95 border border-white/10 hover:bg-white/5"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

function LoadingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0d1a] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-[0.06]"
          style={{ background: "radial-gradient(circle, #6366f1, transparent 70%)" }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-[0.06]"
          style={{ background: "radial-gradient(circle, #8b5cf6, transparent 70%)" }}
        />
      </div>

      <div className="relative z-10 text-center">
        <div className="flex justify-center mb-8">
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
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">Loading Questions...</h2>
        <p className="text-white/40 text-sm">Preparing your learning session</p>

        <div className="flex justify-center gap-1.5 mt-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s`, animationDuration: "0.8s" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Model() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [showCompleted, setShowCompleted] = useState(false);
  const [lockedMessage, setLockedMessage] = useState<string | null>(null);
  const [pendingRoute, setPendingRoute] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { setAllQuestions, questions } = useQuestionCache();

  const token = localStorage.getItem("access_token") || "";

  useEffect(() => {
    if (pendingRoute && questions.length > 0) {
      console.log("Questions cached, navigating to:", pendingRoute);
      navigate(pendingRoute);
      setPendingRoute(null);
    }
  }, [pendingRoute, questions, navigate]);

  const fetchData = async () => {
    if (!id) return;
    setErrorMessage(null);

    try {
      const response = await questionapiApi(Number(id), token);

      const responseStatus = response.status;

      switch (responseStatus) {
        case "questions":
        case "success": {
          const questionList = response.questions;

          if (!questionList || questionList.length === 0) {
            setErrorMessage("No questions found for this level");
            return;
          }

          setAllQuestions(questionList, id);

          const method = questionList[0]?.methods;
          const route = method ? routeMap[method] : null;

          console.log("Method:", method);
          console.log("Route:", route);
          console.log("Total questions to cache:", questionList.length);

          if (route) {
            setPendingRoute(route);
          } else {
            setErrorMessage(`No matching page found for method: "${method || "unknown"}"`);
          }
          break;
        }

        case "redirect":
          toast.success(`Level ${id} completed`);
          navigate(`/api/modal/${response.next_model}`);
          break;

        case "completed":
          setShowCompleted(true);
          break;

        case "locked":
          setLockedMessage(response.message);
          break;

        default:
          setErrorMessage(`Unexpected response from server (status: "${responseStatus}")`);
      }
    } catch (e: any) {
      console.error("Model fetch error:", e);
      const msg = e?.response?.data?.detail || e?.response?.data?.message || e?.message || "Something went wrong";
      setErrorMessage(msg);
    }
  };

  useEffect(() => {
    fetchData();
    setShowCompleted(false);
    setLockedMessage(null);
    setErrorMessage(null);
  }, [id]);

  if (lockedMessage) {
    return <LevelLockedPage message={lockedMessage} />;
  }

  if (showCompleted) {
    return (
      <StatusPage
        title="Congratulations "
        message="You have successfully completed all SQL questions. Great job!"
        buttonText="Go to Dashboard"
        redirectPath="/api/dashboard"
        icon={<CheckCircle size={80} className="text-green-500" />}
      />
    );
  }

  if (errorMessage) {
    return <ErrorPage errorMessage={errorMessage} onRetry={fetchData} />;
  }

  return <LoadingPage />;
}

export default Model;