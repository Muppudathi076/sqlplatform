import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Brain, CheckCircle, ChevronRight, Loader, Star } from "lucide-react";
import { getAssessmentQuestionsApi, submitAssessmentApi } from "../auth/authapi";

function AssessmentPage() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const token = localStorage.getItem("access_token") || "";

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const res = await getAssessmentQuestionsApi(token);
      if (res.success) {
        setQuestions(res.questions);
      }
    } catch (e) {
      toast.error("Failed to load assessment");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await submitAssessmentApi(token, answers);
      if (res.success) {
        setResult(res);
      }
    } catch (e) {
      toast.error("Error submitting assessment");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Loader className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (result) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-6 text-center">
        <div className="bg-gray-800 p-8 rounded-2xl max-w-md w-full shadow-2xl border border-gray-700">
          <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Star className="w-10 h-10 text-blue-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Assessment Complete!</h2>
          <p className="text-gray-400 mb-6">
            You scored {result.score} / {result.total}
          </p>
          <div className="p-4 bg-gray-700/50 rounded-xl mb-6">
            <p className="text-sm text-gray-300">Determined Level:</p>
            <p className="text-2xl font-black text-blue-400 uppercase tracking-widest mt-1">
              {result.level}
            </p>
          </div>
          <p className="text-gray-300 text-sm italic mb-8">"{result.feedback}"</p>
          <button
            onClick={() => navigate("/api/dashboard")}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl transition-all"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!questions.length) return null;

  const currentQ = questions[currentIdx];

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Brain className="text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold">Initial Assessment</h1>
          </div>
          <div className="text-sm font-medium text-gray-400">
            Question {currentIdx + 1} of {questions.length}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-gray-800 rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Question Box */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 md:p-8 mb-6 shadow-xl">
          <div className="inline-block px-3 py-1 bg-gray-700 text-xs font-semibold rounded-full mb-4 text-gray-300 capitalize">
            {currentQ.difficulty} • {currentQ.type}
          </div>
          <h2 className="text-xl md:text-2xl font-semibold mb-8 leading-relaxed">
            {currentQ.question}
          </h2>

          {currentQ.type === "mcq" ? (
            <div className="space-y-3">
              {currentQ.options?.map((opt: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setAnswers({ ...answers, [currentQ.id]: opt })}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    answers[currentQ.id] === opt
                      ? "bg-blue-500/20 border-blue-500 text-white"
                      : "bg-gray-900/50 border-gray-700 text-gray-300 hover:border-gray-500 hover:bg-gray-800"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          ) : (
            <textarea
              className="w-full h-32 bg-gray-900/50 border border-gray-700 rounded-xl p-4 text-white font-mono text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              placeholder="Write your SQL query here..."
              value={answers[currentQ.id] || ""}
              onChange={(e) => setAnswers({ ...answers, [currentQ.id]: e.target.value })}
            />
          )}
        </div>

        {/* Footer actions */}
        <div className="flex justify-end">
          {currentIdx < questions.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={!answers[currentQ.id]}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-medium transition-all"
            >
              Next Question
              <ChevronRight size={18} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!answers[currentQ.id] || submitting}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-bold transition-all"
            >
              {submitting ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Submit Assessment
                  <CheckCircle size={18} />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default AssessmentPage;
