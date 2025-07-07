import { ROUTES } from 'constants/routes';
import DashboardLayout from 'layout/DashboardLayout';
import AuthGuard from 'utils/route-guard/AuthGuard';
import CustomerLocationView from 'views/admin/customers/components/customer-location/CustomerLocationView';

const contactsCustomerPage = () => {
  return (
    <AuthGuard>
      <DashboardLayout backHref={ROUTES.CUSTOMERS}>
        <CustomerLocationView />
      </DashboardLayout>
    </AuthGuard>
  );
};

export default contactsCustomerPage;
