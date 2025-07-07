import DashboardLayout from 'layout/DashboardLayout';
import AuthGuard from 'utils/route-guard/AuthGuard';
import SampleBreakdownTemplatesView from 'views/admin/setting/template-breakdown/SampleBreakdownTemplatesView';

const SampleBreakdownTemplates = () => {
  return (
    <AuthGuard>
      <DashboardLayout>
        <SampleBreakdownTemplatesView />
      </DashboardLayout>
    </AuthGuard>
  );
};

export default SampleBreakdownTemplates;
