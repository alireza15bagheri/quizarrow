import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import useQuizQuestions from '../hooks/useQuizQuestions'
import QuestionForm from '../components/quiz/QuestionForm'
import QuestionsTable from '../components/quiz/QuestionsTable'
import TagSelector from '../components/quiz/TagSelector'
import { getAllTags } from '../lib/api/tags'
import { updateQuizMeta } from '../lib/api/quizzes'
import { useNotifier } from '../context/NotificationContext'


export default function EditQuizQuestionsPage() {
  const { id } = useParams()
  const {
    quizTitle,
    quizDescription,
    questions,
    initialLoading,
    isPublished,
    error,
    addMcqQuestion,
    removeQuestion,
    updateQuestionSettings,
    refresh, // Get refresh function from the hook
  } = useQuizQuestions(id)

  const [allTags, setAllTags] = useState([]);
  const [selectedTagIds, setSelectedTagIds] = useState(new Set());
  const [isSavingTags, setIsSavingTags] = useState(false);
  const { notify } = useNotifier();
  
  // Initialize selected tags once the quiz data is loaded
  useEffect(() => {
    const quizTags = questions[0]?.quiz?.tags || [];
    setSelectedTagIds(new Set(quizTags.map(t => t.id)));
  }, [questions]);
  
  // Fetch all available tags
  useEffect(() => {
    getAllTags().then(setAllTags).catch(() => notify.error('Could not load tags.'));
  }, [notify]);
  
  const handleUpdateTags = async () => {
    if (selectedTagIds.size === 0) {
      notify.error("A quiz must have at least one tag.");
      return;
    }
    setIsSavingTags(true);
    try {
      await updateQuizMeta(id, { tag_ids: Array.from(selectedTagIds) });
      notify.success("Tags updated successfully!");
      await refresh(); // Refresh quiz data to show changes
    } catch (err) {
      notify.error(err.message || "Failed to update tags.");
    } finally {
      setIsSavingTags(false);
    }
  };


  if (initialLoading) {
    return <div>Loading quiz info…</div>
  }

  return (
    <div className="max-w-xl mx-auto">
      {/* quiz title + description */}
      <div className="mb-6 space-y-4">
        <div>
          <h1 className="text-3xl font-bold">{quizTitle}</h1>
          {quizDescription && (
            <p className="text-base-content/70 mt-1">{quizDescription}</p>
          )}
        </div>

        <div>
          <label className="label">Tags</label>
           <TagSelector 
            allTags={allTags}
            selectedTagIds={selectedTagIds}
            onTagChange={setSelectedTagIds}
            disabled={isPublished}
          />
          <button 
            className="btn btn-secondary btn-sm mt-2"
            onClick={handleUpdateTags}
            disabled={isPublished || isSavingTags}
          >
            {isSavingTags ? 'Saving...' : 'Save Tags'}
          </button>
        </div>

        {isPublished && (
          <div className="alert alert-info mt-4">
            <span>
              <strong>This quiz is published.</strong> You cannot add, edit, or delete its questions or settings. To make changes, unpublish the quiz first.
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