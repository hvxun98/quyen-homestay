import DashboardLayout from 'layout/DashboardLayout';
import AuthGuard from 'utils/route-guard/AuthGuard';
import CustomersView from 'views/admin/customers/CustomersView';

const OrdersPage = () => {
  return (
    <AuthGuard>
      <DashboardLayout>
        <CustomersView />
      </DashboardLayout>
    </AuthGuard>
  );
};

export default OrdersPage;
