import { useParams } from 'react-router-dom'
import useQuizQuestions from '../hooks/useQuizQuestions'
import QuestionForm from '../components/quiz/QuestionForm'
import QuestionsTable from '../components/quiz/QuestionsTable'
import { useEffect, useState } from 'react'
import { getQuizDetail } from '../lib/api/quizzes'

export default function EditQuizQuestionsPage() {
  const { id } = useParams()
  const [isPublished, setIsPublished] = useState(false)
  const [loadingMeta, setLoadingMeta] = useState(true)
  const {
    quizTitle,
    quizDescription,
    questions,
    initialLoading,
    error,
    addMcqQuestion,
    removeQuestion,
    updateQuestionSettings,
  } = useQuizQuestions(id)

  useEffect(() => {
    async function fetchMeta() {
      setLoadingMeta(true)
      try {
        const quiz = await getQuizDetail(id)
        setIsPublished(!!quiz.is_published)
      } catch {
        setIsPublished(false)
      } finally {
        setLoadingMeta(false)
      }
    }
    fetchMeta()
  }, [id])

  if (initialLoading || loadingMeta) {
    return <div>Loading quiz info…</div>
  }

  return (
    <div className="max-w-xl mx-auto">
      {/* quiz title + description */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{quizTitle}</h1>
        {quizDescription && (
          <p className="text-base-content/70 mt-1">{quizDescription}</p>
        )}
        {isPublished && (
          <div className="alert alert-info mt-4">
            <span>
              <strong>This quiz is published.</strong> You cannot add, edit, or delete its questions or settings.
              To make changes, unpublish the quiz first.
            </span>
          </div>
        )}
      </div>

      <h2 className="text-2xl font-semibold mb-4">Add a question</h2>
      {error && (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
        </div>
      )}

      <QuestionForm onAdd={addMcqQuestion} className="mb-8" disabled={isPublished} />

      <h2 className="text-2xl font-semibold mb-4">Existing questions</h2>
      <QuestionsTable
        questions={questions}
        onDelete={removeQuestion}
        onUpdate={updateQuestionSettings}
        disableActions={isPublished}
      />
    </div>
  )
}