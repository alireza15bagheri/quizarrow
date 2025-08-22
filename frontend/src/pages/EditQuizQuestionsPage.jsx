import { useParams } from 'react-router-dom'
import useQuizQuestions from '../hooks/useQuizQuestions'
import QuestionForm from '../components/quiz/QuestionForm'
import QuestionsTable from '../components/quiz/QuestionsTable'

export default function EditQuizQuestionsPage() {
  const { id } = useParams()
  const {
    quizTitle,
    quizDescription,
    questions,
    initialLoading,
    error,
    addMcqQuestion,
    removeQuestion,
  } = useQuizQuestions(id)

  if (initialLoading) {
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
      </div>

      <h2 className="text-2xl font-semibold mb-4">Add a question</h2>
      {error && (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
        </div>
      )}

      <QuestionForm onAdd={addMcqQuestion} className="mb-8" />

      <h2 className="text-2xl font-semibold mb-4">Existing questions</h2>
      <QuestionsTable questions={questions} onDelete={removeQuestion} />
    </div>
  )
}
