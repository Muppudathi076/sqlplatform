import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { submitModelResultsApi,singleQuestionProgressApi } from "../auth/authapi";

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

export type Question = {
  id: number;
  question: string;
  answer: string;
  option?: string | string[];
  methods?: string;
  difficulty?: string;
  model_no?: number;
  [key: string]: any;
};

export type CompletedQuestion = {
  questionId: number;
  userAnswer: string;
  isCorrect: boolean;
  questionDetail?: Question;
};

type QuestionCacheContextType = {
  questions: Question[];
  currentIndex: number;
  completedQuestions: CompletedQuestion[];
  score: number;
  totalScore: number;
  hearts: number;
  modelId: string;
  setAllQuestions: (questions: Question[], modelId: string) => void;
  markComplete: (userAnswer: string) => void;
  navigateToNextQuestion: () => void;
  getCurrentQuestion: () => Question | null;
  isAllDone: () => boolean;
  resetCache: () => void;
  saveAndExit: () => Promise<void>;
  skipQuestion: () => void;
};

const QuestionCacheContext = createContext<QuestionCacheContextType | null>(null);

export function QuestionCacheProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedQuestions, setCompletedQuestions] = useState<CompletedQuestion[]>([]);
  const [score, setScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [modelId, setModelId] = useState("");

  const stateRef = useRef({ questions, currentIndex, completedQuestions, score, totalScore, modelId });

  useEffect(() => {
    stateRef.current = { questions, currentIndex, completedQuestions, score, totalScore, modelId };
  }, [questions, currentIndex, completedQuestions, score, totalScore, modelId]);

const setAllQuestions = (
  questions: Question[],
  modelId: string
) => {
  setQuestions(questions);
  setCurrentIndex(0);
  setCompletedQuestions([]);

  setScore(0);
  setTotalScore(0);
  setHearts(5);

  stateRef.current = {
    questions,
    currentIndex: 0,
    completedQuestions: [],
    score: 0,
    totalScore: 0,
    modelId,
  };
};

  const getCurrentQuestion = useCallback((): Question | null => {
    if (currentIndex < questions.length) {
      return questions[currentIndex];
    }
    return null;
  }, [questions, currentIndex]);

  const isAllDone = useCallback((): boolean => {
    return currentIndex >= questions.length && questions.length > 0;
  }, [currentIndex, questions.length]);

const markComplete = useCallback(async (userAnswer: string) => {
  const currentQ =
    stateRef.current.questions[stateRef.current.currentIndex];

  if (!currentQ) return;

  const isCorrect =
    userAnswer.trim().toLowerCase() ===
    currentQ.answer.trim().toLowerCase();

  if (isCorrect) {
    try {
      const token = localStorage.getItem("access_token") || "";

      await singleQuestionProgressApi(
        currentQ.id,
        true,
        token
      );
    } catch (err) {
      console.error("Question save failed", err);

      toast.error(
        "Failed to save question progress."
      );
    }
  }

  const newIndex = stateRef.current.currentIndex + 1;

  const newCompleted = [
    ...stateRef.current.completedQuestions,
    {
      questionId: currentQ.id,
      userAnswer,
      isCorrect,
      questionDetail: currentQ,
    },
  ];

if (isCorrect) {
  const correctCount = newCompleted.filter(
    (q) => q.isCorrect
  ).length;

  const newScore = Math.round(
    (correctCount / stateRef.current.questions.length) * 100
  );

  const newTotalScore = newScore;

  setScore(newScore);
  setTotalScore(newTotalScore);

  stateRef.current = {
    ...stateRef.current,
    score: newScore,
    totalScore: newTotalScore,
    completedQuestions: newCompleted,
    currentIndex: newIndex,
  };
} else {
  const newHearts = Math.max(hearts - 1, 0);

  setHearts(newHearts);

  stateRef.current = {
    ...stateRef.current,
    completedQuestions: newCompleted,
    currentIndex: newIndex,
  };
}

  // 4. UPDATE CACHE
  setCompletedQuestions(newCompleted);
  setCurrentIndex(newIndex);
  console.log({
    currentIndex: stateRef.current.currentIndex,
    // scorePerQuestion,
    oldTotalScore: stateRef.current.totalScore,
    // newTotalScore,
  });
  console.log("ScoreBar score =", score);
}, [hearts]);

  const navigateToNextQuestion = useCallback(async () => {
    const { questions, currentIndex, completedQuestions, score, modelId } = stateRef.current;

    if (currentIndex >= questions.length) {
      navigate("/api/modal/success", {
        state: {
          modelId,
          totalQuestions: questions.length,
          score,
          completedQuestions,
        },
      });
      return;
    }

    const nextQuestion = questions[currentIndex];
    const method = nextQuestion?.methods;
    const route = method ? routeMap[method] : null;

    if (route) {
      navigate(route);
    } else {
      toast.error("No matching page found for this question type");
    }
  }, [navigate]);

  const skipQuestion = useCallback(() => {
    const { questions, currentIndex } = stateRef.current;
    if (currentIndex >= questions.length) return;

    const currentQ = questions[currentIndex];
    const newQuestions = [
      ...questions.slice(0, currentIndex),
      ...questions.slice(currentIndex + 1),
      currentQ, // push to end for retry
    ];

    setQuestions(newQuestions);
    stateRef.current = { ...stateRef.current, questions: newQuestions };
    // currentIndex unchanged → now points to the next question
  }, []);

  const resetCache = useCallback(() => {
    setQuestions([]);
    setCurrentIndex(0);
    setCompletedQuestions([]);
    setScore(0);
    setHearts(5);
    setModelId("");
  }, []);

  const saveAndExit = useCallback(async () => {
    const { completedQuestions, modelId } = stateRef.current;
    
    if (completedQuestions.length > 0) {
      try {
        const token = localStorage.getItem("access_token") || "";
        await submitModelResultsApi(Number(modelId), completedQuestions, token);
        toast.success("Partial progress saved!");
      } catch (e) {
        console.error("Failed to save partial progress:", e);
      }
    }
    
    resetCache();
    navigate("/api/dashboard");
  }, [navigate, resetCache]);

  return (
    <QuestionCacheContext.Provider
      value={{
        questions,
        currentIndex,
        completedQuestions,
        score,
        totalScore,
        hearts,
        modelId,
        setAllQuestions,
        markComplete,
        navigateToNextQuestion,
        getCurrentQuestion,
        isAllDone,
        resetCache,
        saveAndExit,
        skipQuestion,
      }}
    >
      {children}
    </QuestionCacheContext.Provider>
  );
}

export function useQuestionCache() {
  const context = useContext(QuestionCacheContext);
  if (!context) {
    throw new Error("useQuestionCache must be used within a QuestionCacheProvider");
  }
  return context;
}
