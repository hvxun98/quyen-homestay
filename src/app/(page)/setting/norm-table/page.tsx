import DashboardLayout from 'layout/DashboardLayout';
import AuthGuard from 'utils/route-guard/AuthGuard';
import NormTableView from 'views/admin/setting/norm-table/NormTableView';

const SampleTypes = () => {
  return (
    <AuthGuard>
      <DashboardLayout>
        <NormTableView />
      </DashboardLayout>
    </AuthGuard>
  );
};

export default SampleTypes;
