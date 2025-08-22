import { useCallback, useEffect, useMemo, useState } from 'react'
import { getQuizDetail } from '../lib/api/quizzes'
import { addQuizQuestion, deleteQuizQuestion, updateQuizQuestion } from '../lib/api/questions'

export default function useQuizQuestions(quizId) {
  const [quizTitle, setQuizTitle] = useState('')
  const [quizDescription, setQuizDescription] = useState('')
  const [questions, setQuestions] = useState([])
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState(null)

  const maxOrder = useMemo(() => {
    if (!questions.length) return -1
    return Math.max(...questions.map((q) => q.order))
  }, [questions])

  const refresh = useCallback(async () => {
    setError(null)
    const quiz = await getQuizDetail(quizId)
    setQuizTitle(quiz.title)
    setQuizDescription(quiz.description)
    setQuestions(quiz.quiz_questions || [])
  }, [quizId])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        await refresh()
      } catch (e) {
        if (mounted) setError(e.message || 'Failed to load quiz')
      } finally {
        if (mounted) setInitialLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [refresh])

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
    [quizId, maxOrder, refresh]
  )

  const removeQuestion = useCallback(
    async (quizQuestionId) => {
      setError(null)
      await deleteQuizQuestion(quizId, quizQuestionId)
      // Optimistic update
      setQuestions((prev) => prev.filter((q) => q.id !== quizQuestionId))
    },
    [quizId]
  )

  const updateQuestionSettings = useCallback(
    async (quizQuestionId, updates) => {
      // Allow blank input to reset to defaults by sending null
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
    initialLoading,
    error,
    addMcqQuestion,
    removeQuestion,
    updateQuestionSettings,
    refresh,
  }
}
