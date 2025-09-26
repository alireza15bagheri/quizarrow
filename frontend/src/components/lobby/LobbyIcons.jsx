export function Icon({ name, className = 'w-4 h-4' }) {
  switch (name) {
    case 'user':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5z" />
        </svg>
      )
    case 'calendarStart':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
           <path d="M7 2v2H5c-1.1 0-2 .9-2 2v2h18V6c0-1.1-.9-2-2-2h-2V2h-2v2H9V2H7zm14 8H3v10c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V10z" />
        </svg>
      )
    case 'calendarEnd':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M7 2v2H5c-1.1 0-2 .9-2 2v2h18V6c0-1.1-.9-2-2-2h-2V2h-2v2H9V2H7zm-4 8v10c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V10H3zm7 8h4v-2h-4v2z" />
        </svg>
      )
    default:
      return null
  }
}