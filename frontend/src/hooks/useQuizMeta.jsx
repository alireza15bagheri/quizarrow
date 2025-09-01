import { useCallback, useEffect, useState } from 'react'
import { getQuizDetail } from '../lib/api/quizzes'

/**
 * Hook for fetching and refreshing quiz metadata (title, description, questions list).
 * Keeps track of loading and error state.
 */
export default function useQuizMeta(quizId) {
  const [quizTitle, setQuizTitle] = useState('')
  const [quizDescription, setQuizDescription] = useState('')
  const [questions, setQuestions] = useState([])
  const [isPublished, setIsPublished] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    setError(null)
    const quiz = await getQuizDetail(quizId)
    setQuizTitle(quiz.title)
    setQuizDescription(quiz.description)
    setQuestions(quiz.quiz_questions || [])
    setIsPublished(quiz.is_published || false)
  }, [quizId])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        await refresh()
      } catch (e) {
        if (mounted) setError(e.message || 'Failed to load quiz')
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [refresh])

  return {
    quizTitle,
    quizDescription,
    questions,
    setQuestions, // allow child hooks to optimistically update
    isPublished,
    loading,
    error,
    refresh,
    setError,
  }
}