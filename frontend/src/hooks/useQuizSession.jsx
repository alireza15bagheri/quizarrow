import { useCallback, useEffect, useState } from 'react'
import { getLobbyState, submitAnswer } from '../lib/api/game'
import { useNavigate } from 'react-router-dom'

export default function useQuizSession(lobbyId) {
  const [gameState, setGameState] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const navigate = useNavigate()

  const fetchState = useCallback(async () => {
    try {
      const state = await getLobbyState(lobbyId)
      setGameState(state)
      setTimeLeft(Math.ceil(state.time_left || 0))
      if (state.status === 'ended') {
        // Redirect if already ended, might happen on refresh
        // Need to find the participation record
      }
    } catch (err) {
      setError(err.message || 'Failed to load quiz session.')
    } finally {
      setLoading(false)
    }
  }, [lobbyId])

  useEffect(() => {
    fetchState()
  }, [fetchState])

  useEffect(() => {
    if (gameState?.status !== 'running' || timeLeft <= 0) {
      return
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [gameState, timeLeft])

  const handleAnswerSubmit = useCallback(async (choiceIndex) => {
    // Guard against concurrent submissions from user clicks and timer hook
    if (submitting) return;

    setSubmitting(true)
    setError(null)
    try {
      const result = await submitAnswer(lobbyId, { index: choiceIndex })
      if (result.status === 'finished') {
        navigate(`/quiz/results/${result.participation_id}`, { replace: true })
      } else {
        // "next_question"
        await fetchState() // Fetch the new question state
      }
    } catch (err) {
      setError(err.message || 'Failed to submit answer.')
    } finally {
      setSubmitting(false)
    }
  }, [lobbyId, navigate, fetchState, submitting])

  // Automatically submit when time runs out
  useEffect(() => {
    // If time runs out on an active question and we aren't already submitting
    if (
      timeLeft <= 0 &&
      gameState?.status === 'running' &&
      gameState?.question && // Ensure there is an active question
      !submitting
    ) {
      // Submit a "timeout" answer automatically.
      // The backend handles late submissions as incorrect.
      handleAnswerSubmit(null)
    }
  }, [timeLeft, gameState, submitting, handleAnswerSubmit])

  return {
    loading,
    error,
    gameState,
    timeLeft,
    submitting,
    handleAnswerSubmit,
  }
}