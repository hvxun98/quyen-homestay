import DashboardLayout from 'layout/DashboardLayout';
import AuthGuard from 'utils/route-guard/AuthGuard';
import SampleSeparation from 'views/admin/orders/order-list/components/ordermodal-action/SampleSeparation';

const OrdersPage = () => {
  return (
    <AuthGuard>
      <DashboardLayout>
        <SampleSeparation />
      </DashboardLayout>
    </AuthGuard>
  );
};

export default OrdersPage;
