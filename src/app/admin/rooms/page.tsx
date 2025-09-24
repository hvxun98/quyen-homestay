import DashboardLayout from 'layout/DashboardLayout';
import AuthGuard from 'utils/route-guard/AuthGuard';
import RoomsView from 'views/admin/rooms/RoomsView';

const OrdersPage = () => {
  return (
    <AuthGuard>
      <DashboardLayout>
        <RoomsView />
      </DashboardLayout>
    </AuthGuard>
  );
};

export default OrdersPage;
