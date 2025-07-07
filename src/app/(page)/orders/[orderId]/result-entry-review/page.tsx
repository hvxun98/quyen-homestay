import DashboardLayout from 'layout/DashboardLayout';
import AuthGuard from 'utils/route-guard/AuthGuard';
import ResultEntryReview from 'views/admin/orders/result-entry-review';

const ResultEntryPage = () => {
  return (
    <AuthGuard>
      <DashboardLayout>
        <ResultEntryReview />
      </DashboardLayout>
    </AuthGuard>
  );
};

export default ResultEntryPage;
