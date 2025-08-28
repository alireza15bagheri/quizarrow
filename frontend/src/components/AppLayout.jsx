import Navbar from './Navbar'
import NotificationContainer from './NotificationContainer'

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <NotificationContainer />
      <main className="container mx-auto p-4">{children}</main>
    </div>
  )
}