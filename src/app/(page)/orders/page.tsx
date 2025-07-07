import DashboardLayout from 'layout/DashboardLayout';
import AuthGuard from 'utils/route-guard/AuthGuard';
import OrdersView from 'views/admin/orders/order-list/OrdersView';

const OrdersPage = () => {
  return (
    <AuthGuard>
      <DashboardLayout>
        <OrdersView />
      </DashboardLayout>
    </AuthGuard>
  );
};

export default OrdersPage;
