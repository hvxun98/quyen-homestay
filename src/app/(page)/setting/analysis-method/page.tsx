import DashboardLayout from 'layout/DashboardLayout';
import AuthGuard from 'utils/route-guard/AuthGuard';
import AnalysisMethodView from 'views/admin/setting/analysis-method/AnalysisMethodView';

const SampleTypes = () => {
  return (
    <AuthGuard>
      <DashboardLayout>
        <AnalysisMethodView />
      </DashboardLayout>
    </AuthGuard>
  );
};

export default SampleTypes;
