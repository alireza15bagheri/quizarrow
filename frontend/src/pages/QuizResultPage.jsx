import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getParticipationDetail } from '../lib/api/game'

export default function QuizResultPage() {
  const { participationId } = useParams()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchResult() {
      try {
        const data = await getParticipationDetail(participationId)
        setResult(data)
      } catch (err) {
        setError(err.message || 'Could not load quiz results.')
      } finally {
        setLoading(false)
      }
    }
    fetchResult()
  }, [participationId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="alert alert-error max-w-md">{error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-full max-w-lg bg-base-100 shadow-xl text-center">
        <div className="card-body">
          <h1 className="card-title text-3xl mx-auto">Quiz Complete!</h1>
          <p className="text-lg mt-2">You took the quiz: <span className="font-bold">{result?.quiz_title}</span></p>
          <div className="my-6">
            <p className="text-xl">Your Final Score:</p>
            <p className="text-6xl font-bold text-primary my-2">{result?.final_score}</p>
          </div>
          <div className="card-actions justify-center">
            <Link to="/lobby" className="btn btn-secondary">Back to Lobby</Link>
            <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
          </div>
        </div>
      </div>
    </div>
  )
}