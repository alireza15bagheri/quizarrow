import { useAuth } from '../context/AuthContext';
import ThemeSwitcher from '../components/ThemeSwitcher';
import NotificationDelaySelector from '../components/NotificationDelaySelector';

export default function SettingsPage() {
  const { user } = useAuth();
  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <div className="space-y-8">
        {/* User Information Section */}
        <section>
          <h2 className="text-xl font-semibold border-b border-base-300 pb-2 mb-4">
            User Information
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium text-base-content/70">Username:</span>
              <span className="font-mono p-2 rounded-md bg-base-200">{user?.username}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium text-base-content/70">Role:</span>
              <span className="badge badge-primary font-semibold capitalize">{user?.role}</span>
            </div>
          </div>
        </section>

        {/* Appearance Section */}
        <section>
          <h2 className="text-xl font-semibold border-b border-base-300 pb-2 mb-4">
            Appearance
          </h2>
          <div className="flex justify-between items-center">
            <p className="text-base-content/70">
              Change the application&apos;s color scheme.
            </p>
            <ThemeSwitcher />
          </div>
        </section>

        {/* Notifications Section */}
        <section>
          <h2 className="text-xl font-semibold border-b border-base-300 pb-2 mb-4">
            Notifications
          </h2>
          <div className="flex justify-between items-center">
            <p className="text-base-content/70">
              Set a cooldown period between notifications.
            </p>
            <NotificationDelaySelector />
          </div>
        </section>
      </div>
    </div>
  );
}