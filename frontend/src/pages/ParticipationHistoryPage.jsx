import { useEffect, useState, useMemo } from 'react'
import { getMyParticipations } from '../lib/api/game'

// Helper function to determine the badge color based on the score
const getScoreBadgeClass = (score) => {
  if (score >= 75) {
    return 'badge-success'
  }
  if (score >= 40) {
    return 'badge-warning'
  }
  return 'badge-error'
}

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
    if (!Array.isArray(participations)) {
        return [];
    }
    if (!searchQuery) {
      return participations
    }
    return participations.filter((p) =>
      p.quiz_title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [participations, searchQuery])

  if (loading) return <div className="text-center p-8">Loading history…</div>
  if (error) return <div className="alert alert-error">{error}</div>

  const EmptyState = () => {
    if (searchQuery) {
      return (
        <div className="text-center p-12 bg-base-100 rounded-box">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-base-content/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="mt-4 text-lg font-semibold">No Results Found</h3>
          <p className="mt-1 text-base-content/60">Your search for "{searchQuery}" did not match any quiz titles.</p>
        </div>
      );
    }
    return (
      <div className="text-center p-12 bg-base-100 rounded-box">
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-base-content/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="mt-4 text-lg font-semibold">No Participation History</h3>
        <p className="mt-1 text-base-content/60">You haven't completed any quizzes yet. Go take one!</p>
      </div>
    );
  };

  return (
    <>
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
        }
      `}</style>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 opacity-70" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6a7 7 0 0 1 7-7 7 7 0 0 1 7 7 7 7 0 0 1-7 7v2a9 9 0 0 0 9-9 9 9 0 0 0-9-9zm-1 5v5l4.25 2.52.75-1.23-3.5-2.07V8H12z"/>
          </svg>
          <h1 className="text-3xl font-bold">My Participation History</h1>
        </div>
        <p className="text-base-content/60 mb-6">Review your scores and performance from previously completed quizzes.</p>

        <div className="form-control mb-4 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-base-content/40">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </span>
          <input
            id="search-input"
            type="text"
            placeholder="Search by quiz title..."
            className="input input-bordered w-full pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {filteredParticipations.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Quiz Title</th>
                  <th className="text-center">Score</th>
                  <th>Completed On</th>
                </tr>
              </thead>
              <tbody>
                {filteredParticipations.map((p, index) => (
                  <tr
                    key={p.id}
                    className="hover animate-fade-in-up"
                    style={{ animationDelay: `${index * 50}ms`, opacity: 0 }}
                  >
                    <td className="font-semibold text-base-content">{p.quiz_title}</td>
                    <td className="text-center">
                      <span className={`badge ${getScoreBadgeClass(p.final_score)} font-bold p-3`}>
                          {p.final_score}
                      </span>
                    </td>
                    <td>
                      <span className="text-sm text-base-content/60">
                        {new Date(p.completed_at).toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}