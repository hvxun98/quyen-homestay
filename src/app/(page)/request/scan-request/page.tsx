import DashboardLayout from 'layout/DashboardLayout';
import AuthGuard from 'utils/route-guard/AuthGuard';
import ScanRequestCodeView from 'views/admin/request/scan-request-code';

const ScanRequestPage = () => {
  return (
    <AuthGuard>
      <DashboardLayout>
        <ScanRequestCodeView />
      </DashboardLayout>
    </AuthGuard>
  );
};

export default ScanRequestPage;
