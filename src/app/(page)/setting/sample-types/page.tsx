import DashboardLayout from 'layout/DashboardLayout';
import AuthGuard from 'utils/route-guard/AuthGuard';
import SampleTypeView from 'views/admin/setting/sample-types/SampleTypeView';

const SampleTypes = () => {
  return (
    <AuthGuard>
      <DashboardLayout>
        <SampleTypeView />
      </DashboardLayout>
    </AuthGuard>
  );
};

export default SampleTypes;
