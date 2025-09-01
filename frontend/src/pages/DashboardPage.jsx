import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

// Self-contained Icon component for dashboard cards
function Icon({ name, className = 'w-8 h-8' }) {
  switch (name) {
    case 'create':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
        </svg>
      )
    case 'quizzes':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M19 2H8C6.9 2 6 2.9 6 4v13c0 1.1.9 2 2 2h11v-2H8V4h11v16h2V4c0-1.1-.9-2-2-2zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6z" />
        </svg>
      )
    case 'sessions':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h14c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H5V9h14v9z" />
        </svg>
      )
    case 'history':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6a7 7 0 0 1 7-7 7 7 0 0 1 7 7 7 7 0 0 1-7 7v2a9 9 0 0 0 9-9 9 9 0 0 0-9-9zm-1 5v5l4.25 2.52.75-1.23-3.5-2.07V8H12z"/>
        </svg>
      )
    default:
      return null
  }
}


export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const cards = [
    {
      title: 'Create Quiz',
      description: 'Build a new quiz from scratch and add your own questions.',
      buttonText: 'Create New',
      path: '/quizzes/new',
      icon: 'create',
      accentClass: 'bg-primary',
      buttonClass: 'btn-primary',
    },
    {
      title: 'My Quizzes',
      description: 'Browse, edit, and manage all of the quizzes you have created.',
      buttonText: 'View Quizzes',
      path: '/quizzes/mine',
      icon: 'quizzes',
      accentClass: 'bg-secondary',
      buttonClass: 'btn-secondary',
    },
    {
      title: 'My Sessions',
      description: 'Publish your quizzes to the lobby and set their availability.',
      buttonText: 'Manage Sessions',
      path: '/sessions',
      icon: 'sessions',
      accentClass: 'bg-accent',
      buttonClass: 'btn-accent',
    },
    {
      title: 'Participation History',
      description: 'Review your scores and performance from past quiz sessions.',
      buttonText: 'View History',
      path: '/history',
      icon: 'history',
      accentClass: 'bg-info',
      buttonClass: 'btn-info',
    }
  ]

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-secondary mb-2">
          Dashboard
        </h1>
        <p className="text-xl text-base-content/70">
          Welcome back, <span className="font-semibold">{user?.username}</span>!
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {cards.map((card) => (
          <div
            key={card.title}
            className="card bg-base-100 shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out hover:-translate-y-1 relative group"
          >
            <div className={`absolute top-0 left-0 h-1.5 w-full rounded-t-xl ${card.accentClass}`} />
            <div className="card-body">
              <div className="flex items-center gap-4 text-base-content/50 group-hover:text-base-content transition-colors">
                <Icon name={card.icon} />
                <h2 className="card-title text-xl text-base-content">{card.title}</h2>
              </div>
              <p className="text-base-content/70 my-4 min-h-16">{card.description}</p>
              <div className="card-actions justify-end mt-auto">
                <button onClick={() => navigate(card.path)} className={`btn ${card.buttonClass}`}>
                  {card.buttonText}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}