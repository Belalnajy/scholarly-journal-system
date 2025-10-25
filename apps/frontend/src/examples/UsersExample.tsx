/**
 * Example Component: Users List
 * Demonstrates how to use the users hooks
 * 
 * This is an example file - you can delete it or use it as a reference
 */
import { useUsers, useUserMutations, useUserStats } from '../hooks';
import { CreateUserDto, UserRole } from '../types/user.types';

export function UsersExample() {
  const { users, loading, error, refetch } = useUsers();
  const { stats, loading: statsLoading } = useUserStats();
  const { createUser, deleteUser, loading: mutationLoading } = useUserMutations();

  // Handle create user
  const handleCreateUser = async () => {
    const newUser: CreateUserDto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      role: UserRole.RESEARCHER,
    };

    try {
      await createUser(newUser);
      alert('تم إنشاء المستخدم بنجاح!');
      await refetch(); // Refresh the list
    } catch (err) {
      alert('فشل إنشاء المستخدم');
    }
  };

  // Handle delete user
  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف ${name}؟`)) {
      return;
    }

    try {
      await deleteUser(id);
      alert('تم حذف المستخدم بنجاح!');
      await refetch(); // Refresh the list
    } catch (err) {
      alert('فشل حذف المستخدم');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>جاري التحميل...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <p>خطأ: {error}</p>
        <button onClick={refetch}>إعادة المحاولة</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>المستخدمون</h1>

      {/* Statistics */}
      {!statsLoading && stats && (
        <div style={{ marginBottom: '20px', padding: '10px', background: '#f5f5f5', borderRadius: '5px' }}>
          <h3>الإحصائيات</h3>
          <ul>
            <li>إجمالي المستخدمين: {stats.total}</li>
            <li>باحثون: {stats.researchers}</li>
            <li>محررون: {stats.editors}</li>
            <li>مراجعون: {stats.reviewers}</li>
            <li>مدراء: {stats.admins}</li>
          </ul>
        </div>
      )}

      {/* Create User Button */}
      <button
        onClick={handleCreateUser}
        disabled={mutationLoading}
        style={{
          padding: '10px 20px',
          marginBottom: '20px',
          background: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: mutationLoading ? 'not-allowed' : 'pointer',
        }}
      >
        {mutationLoading ? 'جاري الإنشاء...' : 'إنشاء مستخدم تجريبي'}
      </button>

      {/* Users List */}
      <div>
        <h3>قائمة المستخدمين ({users.length})</h3>
        {users.length === 0 ? (
          <p>لا يوجد مستخدمون</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right' }}>الاسم</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right' }}>البريد الإلكتروني</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right' }}>الدور</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right' }}>الحالة</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{user.name}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{user.email}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{user.role}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{user.status}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                    <button
                      onClick={() => handleDeleteUser(user.id, user.name)}
                      disabled={mutationLoading}
                      style={{
                        padding: '5px 10px',
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: mutationLoading ? 'not-allowed' : 'pointer',
                      }}
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default UsersExample;
