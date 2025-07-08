import DashboardLayout from 'layout/DashboardLayout';
import AuthGuard from 'utils/route-guard/AuthGuard';
import Orders from 'views/admin/orders/list';

const Timeline = () => {
  return (
    <AuthGuard>
      <DashboardLayout>
        <Orders />
      </DashboardLayout>
    </AuthGuard>
  );
};

export default Timeline;
