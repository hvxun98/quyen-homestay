import { ROUTES } from 'constants/routes';
import DashboardLayout from 'layout/DashboardLayout';
import AuthGuard from 'utils/route-guard/AuthGuard';
import CustomerContactsView from 'views/admin/customers/components/customer-contact/CustomerContactsView';

interface PageProps {
  params: {
    customerId: string;
  };
}

export default function ContactsCustomerPage({ params }: PageProps) {
  const customerId = params.customerId;

  return (
    <AuthGuard>
      <DashboardLayout backHref={ROUTES.CUSTOMER_LOCATION(Number(customerId))}>
        <CustomerContactsView />
      </DashboardLayout>
    </AuthGuard>
  );
}
