import DashboardLayout from 'layout/DashboardLayout';
import AuthGuard from 'utils/route-guard/AuthGuard';
import BrandsView from 'views/admin/brands/BrandsView';

const OrdersPage = () => {
  return (
    <AuthGuard>
      <DashboardLayout>
        <BrandsView />
      </DashboardLayout>
    </AuthGuard>
  );
};

export default OrdersPage;
