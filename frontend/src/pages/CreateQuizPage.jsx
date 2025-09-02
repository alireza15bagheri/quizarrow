import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { hostNewQuiz } from '../lib/api/quizzes'
import { getAllTags } from '../lib/api/tags'
import TagSelector from '../components/quiz/TagSelector'

export default function CreateQuizPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [allTags, setAllTags] = useState([]);
  const [selectedTagIds, setSelectedTagIds] = useState(new Set());
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    getAllTags().then(setAllTags).catch(() => setError('Could not load tags.'));
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault()
    if (selectedTagIds.size === 0) {
      setError("Please select at least one tag for the quiz.");
      return;
    }
    setLoading(true)
    setError(null)
    try {
      const payload = { title, description, tag_ids: Array.from(selectedTagIds) }
      await hostNewQuiz(payload)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Create New Quiz</h1>
      {error && (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
        </div>
      )}
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="label">Tags (select at least one)</label>
          <TagSelector 
            allTags={allTags}
            selectedTagIds={selectedTagIds}
            onTagChange={setSelectedTagIds}
          />
        </div>
        <div>
          <label className="label">Title</label>
          <input
            className="input input-bordered w-full"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea
            className="textarea textarea-bordered w-full"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <p className="text-sm text-base-content/70">
          You can add questions to this quiz later from the “My Quizzes” page.
        </p>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Creating…' : 'Create Quiz'}
        </button>
      </form>
    </div>
  )
}