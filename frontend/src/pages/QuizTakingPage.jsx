import { useParams } from 'react-router-dom'
import useQuizSession from '../hooks/useQuizSession'

function Timer({ seconds }) {
  const size = 80
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = (seconds / 20) * 100 // Assuming max 20s for visual, can be dynamic
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          className="text-base-300"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className="text-primary transition-all duration-500"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold">
        {seconds}
      </span>
    </div>
  )
}

export default function QuizTakingPage() {
  const { lobbyId } = useParams()
  const { loading, error, gameState, timeLeft, submitting, handleAnswerSubmit } =
    useQuizSession(lobbyId)

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

  const question = gameState?.question?.question
  const choices = question?.content?.choices || []

  return (
    <div className="min-h-screen bg-base-200 flex flex-col items-center p-4 sm:p-6 md:p-8 gap-4 sm:gap-6">
      <header className="w-full max-w-3xl flex justify-between items-center text-lg p-4 bg-base-100 rounded-box shadow-sm">
        <h1 className="font-bold text-xl">{gameState?.quiz_title}</h1>
        <div className="flex items-center gap-4">
          <div className="font-semibold">Score: <span className="text-primary">{gameState?.score}</span></div>
          <Timer seconds={timeLeft} />
        </div>
      </header>

      <main className="w-full max-w-3xl flex-grow flex">
        <div className="card w-full bg-base-100 shadow-xl m-auto">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-6 text-center mx-auto">
              {question?.text || 'Waiting for question...'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {choices.map((choice, i) => (
                <button
                  key={i}
                  className="btn btn-secondary btn-lg h-auto py-4"
                  onClick={() => handleAnswerSubmit(i)}
                  disabled={submitting || timeLeft <= 0}
                >
                  <span className="whitespace-normal">{choice}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
      
      {submitting && <div className="fixed inset-0 bg-black/30 flex items-center justify-center"><span className="loading loading-dots loading-lg"/></div>}
    </div>
  )
}