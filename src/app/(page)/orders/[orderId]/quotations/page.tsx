import DashboardLayout from 'layout/DashboardLayout';
import AuthGuard from 'utils/route-guard/AuthGuard';
import QuotationView from 'views/admin/orders/quotations/QuotationView';

const QuotationPage = () => {
  return (
    <AuthGuard>
      <DashboardLayout>
        <QuotationView />
      </DashboardLayout>
    </AuthGuard>
  );
};

export default QuotationPage;
