import { useEffect, useState } from 'react'
import { getMyParticipations } from '../lib/api/game'

export default function ParticipationHistoryPage() {
  const [participations, setParticipations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getMyParticipations()
        setParticipations(data)
      } catch (err) {
        setError(err.message || 'Failed to load history.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <div className="text-center p-8">Loading history…</div>
  if (error) return <div className="alert alert-error">{error}</div>

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">My Participation History</h1>
      {participations.length === 0 ? (
        <p>You have not completed any quizzes yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Quiz Title</th>
                <th>Score</th>
                <th>Completed On</th>
              </tr>
            </thead>
            <tbody>
              {participations.map((p) => (
                <tr key={p.id}>
                  <td className="font-semibold">{p.quiz_title}</td>
                  <td>{p.final_score}</td>
                  <td>{new Date(p.completed_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}