import { useEffect, useState, useMemo } from 'react';
import { useNotifier } from '../context/NotificationContext';
import { useConfirm } from '../context/ConfirmationContext';
import { getAllUsers, updateUser, getAllQuizzes, adminDeleteQuiz } from '../lib/api/admin';
import { useAuth } from '../context/AuthContext';
export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState('');
  const { notify } = useNotifier();
  const { confirmAction } = useConfirm();
  const { user: currentUser } = useAuth();
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersData, quizzesData] = await Promise.all([getAllUsers(), getAllQuizzes()]);
      // Filter out the current admin user from the list
      const filteredUsers = usersData.filter(user => user.id !== currentUser.id);
      setUsers(filteredUsers);
      setQuizzes(quizzesData);
    } catch (err) {
      setError(err.message || 'Failed to load admin data.');
      notify.error(err.message || 'Failed to load admin data.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    // Ensure currentUser is loaded before fetching data
    if (currentUser) {
      fetchData();
    }
  }, [currentUser]);
  const handleRoleChange = async (user, newRole) => {
    try {
      await updateUser(user.id, { profile: { role: newRole } });
      notify.success(`Role for ${user.username} updated to ${newRole}.`);
      fetchData();
    } catch (err) {
      notify.error(err.message || 'Failed to update role.');
    }
  };

  const handleStatusChange = async (user, newStatus) => {
    try {
      await updateUser(user.id, { is_active: newStatus });
      notify.success(`${user.username} has been ${newStatus ? 'activated' : 'deactivated'}.`);
      fetchData();
    } catch (err) {
      notify.error(err.message || 'Failed to update status.');
    }
  };

  const handleDeleteQuiz = async (quiz) => {
    const confirmed = await confirmAction({
      title: `Delete Quiz "${quiz.title}"?`,
      message: `This will permanently delete the quiz and all participation history associated with it. This action cannot be undone.\n\nQuiz ID: ${quiz.id}\nHost: ${quiz.publisher_username}`,
      confirmText: 'Delete Permanently',
      confirmButtonClass: 'btn-error',
    });
    if (confirmed) {
      try {
        await adminDeleteQuiz(quiz.id);
        notify.success('Quiz deleted successfully.');
        fetchData();
      } catch (err) {
        notify.error(err.message || 'Failed to delete quiz.');
      }
    }
  };

  const filteredQuizzes = useMemo(() => {
    if (!selectedUserId) {
      return quizzes;
    }
    const hostUsername = users.find(u => u.id === parseInt(selectedUserId))?.username;
    return quizzes.filter(q => q.publisher_username === hostUsername);
  }, [quizzes, selectedUserId, users]);
  if (loading) {
    return <div>Loading admin panel...</div>;
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <h1 className="text-3xl font-bold">Admin Panel</h1>

      {/* User Management Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">User Management</h2>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td className="font-semibold">{user.username}</td>
                  <td>
                    <select
                      className="select select-bordered select-sm"
                      value={user.profile.role}
                      onChange={(e) => handleRoleChange(user, e.target.value)}
                    >
                      <option value="player">Player</option>
                      <option value="host">Host</option>
                    </select>
                  </td>
                  <td>
                    <button
                      className={`btn btn-sm ${user.is_active ? 'btn-warning' : 'btn-success'}`}
                      onClick={() => handleStatusChange(user, !user.is_active)}
                    >
                      {user.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Quiz Management Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Quiz Management</h2>
        <div className="form-control mb-4">
          <label className="label mr-5">
            <span className="label-text">Filter by Host</span>
          </label>
          <select
            className="select select-bordered"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
          >
            <option value="">All Users</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>{user.username}</option>
            ))}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Quiz Title</th>
                <th>Host</th>
                <th>Published</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuizzes.map(quiz => (
                <tr key={quiz.id}>
                  <td className="font-semibold">{quiz.title}</td>
                  <td>{quiz.publisher_username}</td>
                  <td>
                    {quiz.is_published
                      ? <span className="badge badge-success">Yes</span>
                      : <span className="badge badge-ghost">No</span>
                    }
                  </td>
                  <td>
                    <button
                      className="btn btn-error btn-sm"
                      onClick={() => handleDeleteQuiz(quiz)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredQuizzes.length === 0 && <p className="text-center p-4">No quizzes found for this user.</p>}
        </div>
      </section>
    </div>
  );
}