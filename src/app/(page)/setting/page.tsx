import DashboardLayout from 'layout/DashboardLayout';
import AuthGuard from 'utils/route-guard/AuthGuard';
import SettingView from 'views/admin/setting/SettingView';

const OrdersPage = () => {
  return (
    <AuthGuard>
      <DashboardLayout>
        <SettingView />
      </DashboardLayout>
    </AuthGuard>
  );
};

export default OrdersPage;
