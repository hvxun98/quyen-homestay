import DashboardLayout from 'layout/DashboardLayout';
import AuthGuard from 'utils/route-guard/AuthGuard';
import AnalysisGroupView from 'views/admin/analysis-group/AnalysisGroupView';

const SampleTypes = () => {
  return (
    <AuthGuard>
      <DashboardLayout>
        <AnalysisGroupView />
      </DashboardLayout>
    </AuthGuard>
  );
};

export default SampleTypes;
