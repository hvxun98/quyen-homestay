import DashboardLayout from 'layout/DashboardLayout';
import AuthGuard from 'utils/route-guard/AuthGuard';
import FinanceView from 'views/admin/finance/FinanceView';

const OrdersPage = () => {
  return (
    <AuthGuard>
      <DashboardLayout>
        <FinanceView />
      </DashboardLayout>
    </AuthGuard>
  );
};

export default OrdersPage;
