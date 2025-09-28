import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useMemo } from 'react';
import {
  PencilSquareIcon,
  ClipboardDocumentListIcon,
  PlayCircleIcon,
  ChartPieIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'

// Replaced the old SVG icons with modern ones from Heroicons
function Icon({ name, className = 'w-8 h-8' }) {
  switch (name) {
    case 'create':
      return <PencilSquareIcon className={className} />
    case 'quizzes':
      return <ClipboardDocumentListIcon className={className} />
    case 'sessions':
      return <PlayCircleIcon className={className} />
    case 'history':
      return <ChartPieIcon className={className} />
    case 'lobby':
      return <UserGroupIcon className={className} />
    case 'chat':
      return <ChatBubbleOvalLeftEllipsisIcon className={className} />
    case 'settings':
      return <Cog6ToothIcon className={className} />
    case 'admin':
      return <ShieldCheckIcon className={className} />
    default:
      return null
  }
}


export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const allCards = useMemo(() => [
    {
      title: 'Lobby',
      description: 'Join a published quiz from the lobby and test your knowledge.',
      buttonText: 'Go to Lobby',
      path: '/lobby',
      icon: 'lobby',
      accentClass: 'bg-warning',
      buttonClass: 'btn-warning',
      roles: ['player', 'host', 'admin'],
    },
    {
      title: 'Create Quiz',
      description: 'Build a new quiz from scratch and add your own questions.',
      buttonText: 'Create New',
      path: '/quizzes/new',
      icon: 'create',
      accentClass: 'bg-primary',
      buttonClass: 'btn-primary',
      roles: ['host', 'admin'],
    },
    {
      title: 'My Quizzes',
      description: 'Browse, edit, and manage all of the quizzes you have created.',
      buttonText: 'View Quizzes',
      path: '/quizzes/mine',
      icon: 'quizzes',
      accentClass: 'bg-secondary',
      buttonClass: 'btn-secondary',
      roles: ['host', 'admin'],
    },
    {
      title: 'My Sessions',
      description: 'Publish your quizzes to the lobby and set their availability.',
      buttonText: 'Manage Sessions',
      path: '/sessions',
      icon: 'sessions',
      accentClass: 'bg-accent',
      buttonClass: 'btn-accent',
      roles: ['host', 'admin'],
    },
    {
      title: 'Participation History',
      description: 'Review your scores and performance from past quiz sessions.',
      buttonText: 'View History',
      path: '/history',
      icon: 'history',
      accentClass: 'bg-info',
      buttonClass: 'btn-info',
      roles: ['player', 'host', 'admin'],
    },
    {
      title: 'Chatrooms',
      description: 'Join public chatrooms to discuss quizzes and connect with others.',
      buttonText: 'Open Chat',
      path: '/chatrooms',
      icon: 'chat',
      accentClass: 'bg-success',
      buttonClass: 'btn-success',
      roles: ['player', 'host', 'admin'],
    },
    {
      title: 'Settings',
      description: 'Manage your account and application preferences.',
      buttonText: 'Go to Settings',
      path: '/settings',
      icon: 'settings',
      accentClass: 'bg-neutral',
      buttonClass: 'btn-neutral',
      roles: ['player', 'host', 'admin'],
    },
    {
      title: 'Admin Panel',
      description: 'Manage users, roles, and moderate content across the platform.',
      buttonText: 'Go to Panel',
      path: '/admin',
      icon: 'admin',
      accentClass: 'bg-error',
      buttonClass: 'btn-error',
      roles: ['admin'],
    }
  ], []);

  const visibleCards = allCards.filter(card => user?.role && card.roles.includes(user.role));
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
        {visibleCards.map((card) => (
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