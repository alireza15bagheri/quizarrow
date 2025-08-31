import { useEffect, useState, useMemo } from 'react'
import { getMyParticipations } from '../lib/api/game'

export default function ParticipationHistoryPage() {
  const [participations, setParticipations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

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

  const filteredParticipations = useMemo(() => {
    if (!searchQuery) {
      return participations
    }
    return participations.filter((p) =>
      p.quiz_title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [participations, searchQuery])

  if (loading) return <div className="text-center p-8">Loading history…</div>
  if (error) return <div className="alert alert-error">{error}</div>

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">My Participation History</h1>

      <div className="form-control mb-4">
        <label htmlFor="search-input" className="label">
          <span className="label-text">Search</span>
        </label>
        <input
          id="search-input"
          type="text"
          placeholder="Search by quiz title..."
          className="input input-bordered w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredParticipations.length === 0 ? (
        <p>
          {searchQuery
            ? 'No results found for your search.'
            : 'You have not completed any quizzes yet.'}
        </p>
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
              {filteredParticipations.map((p) => (
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