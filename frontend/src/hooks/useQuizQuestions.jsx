import { useCallback, useMemo } from 'react'
import { addQuizQuestion, deleteQuizQuestion, updateQuizQuestion } from '../lib/api/questions'
import useQuizMeta from './useQuizMeta'

/**
 * Hook for managing quiz questions (CRUD) while reusing quiz metadata from useQuizMeta.
 */
export default function useQuizQuestions(quizId) {
  const {
    quizTitle,
    quizDescription,
    questions,
    setQuestions,
    loading,
    error,
    refresh,
    setError,
  } = useQuizMeta(quizId)

  const maxOrder = useMemo(() => {
    if (!questions.length) return -1
    return Math.max(...questions.map((q) => q.order))
  }, [questions])

  const addMcqQuestion = useCallback(
    async (text, choices, correctIndex) => {
      setError(null)
      const payload = {
        quiz_questions: [
          {
            order: maxOrder + 1,
            question: {
              type: 'mcq',
              difficulty: 'medium',
              text,
              content: { choices },
              answer_key: { correct_index: correctIndex },
              default_timer_seconds: 20,
              default_points: 100,
            },
          },
        ],
      }
      await addQuizQuestion(quizId, payload)
      await refresh()
    },
    [quizId, maxOrder, refresh, setError]
  )

  const removeQuestion = useCallback(
    async (quizQuestionId) => {
      setError(null)
      await deleteQuizQuestion(quizId, quizQuestionId)
      // Optimistic update
      setQuestions((prev) => prev.filter((q) => q.id !== quizQuestionId))
    },
    [quizId, setQuestions, setError]
  )

  const updateQuestionSettings = useCallback(
    async (quizQuestionId, updates) => {
      const normalizeInt = (v) =>
        v === '' || v === undefined || v === null ? null : parseInt(v, 10)

      const payload = {}
      if ('points' in updates) payload.points = normalizeInt(updates.points)
      if ('timer_seconds' in updates) payload.timer_seconds = normalizeInt(updates.timer_seconds)

      await updateQuizQuestion(quizId, quizQuestionId, payload)
      await refresh()
    },
    [quizId, refresh]
  )

  return {
    quizTitle,
    quizDescription,
    questions,
    initialLoading: loading,
    error,
    addMcqQuestion,
    removeQuestion,
    updateQuestionSettings,
    refresh,
  }
}
