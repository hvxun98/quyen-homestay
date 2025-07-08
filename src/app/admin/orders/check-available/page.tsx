import DashboardLayout from 'layout/DashboardLayout';
import AuthGuard from 'utils/route-guard/AuthGuard';
import CheckAvailable from 'views/admin/orders/check-available';

const Timeline = () => {
  return (
    <AuthGuard>
      <DashboardLayout>
        <CheckAvailable />
      </DashboardLayout>
    </AuthGuard>
  );
};

export default Timeline;
