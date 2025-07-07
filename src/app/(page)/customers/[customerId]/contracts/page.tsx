import { ROUTES } from 'constants/routes';
import DashboardLayout from 'layout/DashboardLayout';
import AuthGuard from 'utils/route-guard/AuthGuard';
import CustomerContractsView from 'views/admin/customers/components/customer-contract/CustomerContractsView';

const contactsCustomerPage = () => {
  return (
    <AuthGuard>
      <DashboardLayout backHref={ROUTES.CUSTOMERS}>
        <CustomerContractsView />
      </DashboardLayout>
    </AuthGuard>
  );
};

export default contactsCustomerPage;
