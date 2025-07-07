import DashboardLayout from 'layout/DashboardLayout';
import AuthGuard from 'utils/route-guard/AuthGuard';
import AnalysisRequestView from 'views/admin/request/analysis-request';

const RequestPage = () => {
  return (
    <AuthGuard>
      <DashboardLayout>
        <AnalysisRequestView />
      </DashboardLayout>
    </AuthGuard>
  );
};

export default RequestPage;
