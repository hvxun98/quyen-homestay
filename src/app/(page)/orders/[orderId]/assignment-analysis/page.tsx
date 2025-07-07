import DashboardLayout from 'layout/DashboardLayout';
import AuthGuard from 'utils/route-guard/AuthGuard';
import AssignmentAnalysisView from 'views/admin/orders/assignment-analysis';

const AssignmentAnalysisPage = () => {
  return (
    <AuthGuard>
      <DashboardLayout>
        <AssignmentAnalysisView />
      </DashboardLayout>
    </AuthGuard>
  );
};

export default AssignmentAnalysisPage;
