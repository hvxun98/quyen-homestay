import DashboardLayout from 'layout/DashboardLayout';
import AuthGuard from 'utils/route-guard/AuthGuard';
import UsersView from 'views/admin/users/UsersView';

const UserPage = () => {
  return (
    <AuthGuard>
      <DashboardLayout>
        <UsersView />
      </DashboardLayout>
    </AuthGuard>
  );
};

export default UserPage;
