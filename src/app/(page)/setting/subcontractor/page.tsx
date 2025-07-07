import DashboardLayout from 'layout/DashboardLayout';
import AuthGuard from 'utils/route-guard/AuthGuard';
import SubcontractorView from 'views/admin/setting/subcontractor/SubcontractorView';

const SampleTypes = () => {
  return (
    <AuthGuard>
      <DashboardLayout>
        <SubcontractorView />
      </DashboardLayout>
    </AuthGuard>
  );
};

export default SampleTypes;
