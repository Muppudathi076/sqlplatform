import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

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
  hearts: number;
  modelId: string;
  setAllQuestions: (questions: Question[], modelId: string) => void;
  markComplete: (userAnswer: string) => void;
  navigateToNextQuestion: () => void;
  getCurrentQuestion: () => Question | null;
  isAllDone: () => boolean;
  resetCache: () => void;
};

const QuestionCacheContext = createContext<QuestionCacheContextType | null>(null);

export function QuestionCacheProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedQuestions, setCompletedQuestions] = useState<CompletedQuestion[]>([]);
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [modelId, setModelId] = useState("");

  const stateRef = useRef({ questions, currentIndex, completedQuestions, score, modelId });

  useEffect(() => {
    stateRef.current = { questions, currentIndex, completedQuestions, score, modelId };
  }, [questions, currentIndex, completedQuestions, score, modelId]);

  const setAllQuestions = useCallback((qs: Question[], mId: string) => {
    setQuestions(qs);
    setModelId(mId);
    setCurrentIndex(0);
    setCompletedQuestions([]);
    setScore(0);
    setHearts(5);
  }, []);

  const getCurrentQuestion = useCallback((): Question | null => {
    if (currentIndex < questions.length) {
      return questions[currentIndex];
    }
    return null;
  }, [questions, currentIndex]);

  const isAllDone = useCallback((): boolean => {
    return currentIndex >= questions.length && questions.length > 0;
  }, [currentIndex, questions.length]);

  const markComplete = useCallback((userAnswer: string) => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    const isCorrect =
      userAnswer.trim().toLowerCase() === currentQ.answer.trim().toLowerCase();

    if (isCorrect) {
      const scorePerQuestion = Math.round(100 / questions.length);
      setScore((prev) => Math.min(prev + scorePerQuestion, 100));
      setCompletedQuestions((prev) => [
        ...prev,
        { questionId: currentQ.id, userAnswer, isCorrect: true, questionDetail: currentQ },
      ]);
      setCurrentIndex((prev) => prev + 1);
    } else {
      setHearts((prev) => Math.max(prev - 1, 0));
    }
  }, [questions, currentIndex]);

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

  const resetCache = useCallback(() => {
    setQuestions([]);
    setCurrentIndex(0);
    setCompletedQuestions([]);
    setScore(0);
    setHearts(5);
    setModelId("");
  }, []);

  return (
    <QuestionCacheContext.Provider
      value={{
        questions,
        currentIndex,
        completedQuestions,
        score,
        hearts,
        modelId,
        setAllQuestions,
        markComplete,
        navigateToNextQuestion,
        getCurrentQuestion,
        isAllDone,
        resetCache,
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
