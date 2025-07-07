import DashboardLayout from 'layout/DashboardLayout';
import AuthGuard from 'utils/route-guard/AuthGuard';
import QuotationDetailView from 'views/admin/orders/quotations/components/QuotationDetailView';

const QuotationPage = () => {
  return (
    <AuthGuard>
      <DashboardLayout>
        <QuotationDetailView />
      </DashboardLayout>
    </AuthGuard>
  );
};

export default QuotationPage;
