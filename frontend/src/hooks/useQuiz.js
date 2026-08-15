import { useCallback, useEffect, useRef, useState } from 'react';
import { completeAttempt, getErrorMessage, getPublicTest, submitAnswer } from '../services/api.js';

export const quizStorageKey = (testCode) => `ft_quiz_${testCode}`;

export function loadQuizProgress(testCode) {
  try {
    const raw = localStorage.getItem(quizStorageKey(testCode));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearQuizProgress(testCode) {
  try {
    localStorage.removeItem(quizStorageKey(testCode));
  } catch {
    /* ignore */
  }
}

/**
 * Manages the one-question-at-a-time quiz:
 * - loads the public test (correct answers are never sent to the client)
 * - restores an in-progress attempt from localStorage (refresh safety)
 * - submits answers to the backend for validation
 * - completes the attempt and returns the final result
 */
export function useQuiz({ testCode, initialTest }) {
  const [test, setTest] = useState(initialTest ?? null);
  const [loading, setLoading] = useState(!initialTest);
  const [error, setError] = useState(null);

  // Restore an in-progress attempt synchronously so a refresh doesn't lose the quiz
  const [attempt, setAttempt] = useState(() => {
    const saved = loadQuizProgress(testCode);
    return saved?.attemptId
      ? { attemptId: saved.attemptId, participantName: saved.participantName }
      : null;
  });
  const [currentIndex, setCurrentIndex] = useState(() => {
    const saved = loadQuizProgress(testCode);
    return typeof saved?.currentIndex === 'number' ? saved.currentIndex : 0;
  });

  const [feedback, setFeedback] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const finishingRef = useRef(false);

  // Fetch the public test when one wasn't passed in (e.g. page refresh)
  useEffect(() => {
    let cancelled = false;
    if (test) return undefined;
    setLoading(true);
    getPublicTest(testCode)
      .then((data) => {
        if (!cancelled) setTest(data);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err, 'Could not load this test.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [testCode, test]);

  // Persist progress whenever it changes
  useEffect(() => {
    if (!attempt) return;
    try {
      localStorage.setItem(quizStorageKey(testCode), JSON.stringify({ ...attempt, currentIndex }));
    } catch {
      /* ignore */
    }
  }, [attempt, currentIndex, testCode]);

  const currentQuestion = test?.questions?.[currentIndex] ?? null;

  const submit = useCallback(
    async ({ answer }) => {
      if (!test || !attempt || submitting || feedback || !currentQuestion) return null;
      setSubmitting(true);
      try {
        const res = await submitAnswer(testCode, attempt.attemptId, {
          questionId: currentQuestion.questionId,
          answer,
        });
        setFeedback(res);
        return res;
      } catch (err) {
        setError(getErrorMessage(err, 'Could not submit your answer.'));
        return null;
      } finally {
        setSubmitting(false);
      }
    },
    [test, attempt, submitting, feedback, currentQuestion, testCode]
  );

  const next = useCallback(async () => {
    if (!test || !attempt) return null;
    if (currentIndex + 1 < test.questions.length) {
      setFeedback(null);
      setCurrentIndex((i) => i + 1);
      return null;
    }
    if (finishingRef.current) return null;
    finishingRef.current = true;
    try {
      const result = await completeAttempt(testCode, attempt.attemptId);
      clearQuizProgress(testCode);
      return result;
    } catch (err) {
      finishingRef.current = false;
      setError(getErrorMessage(err, 'Could not finish the test.'));
      return null;
    }
  }, [test, attempt, currentIndex, testCode]);

  return {
    test,
    loading,
    error,
    attempt,
    currentIndex,
    currentQuestion,
    feedback,
    submitting,
    totalQuestions: test?.questions?.length ?? 0,
    submit,
    next,
  };
}
