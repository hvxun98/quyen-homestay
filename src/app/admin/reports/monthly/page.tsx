import DashboardLayout from 'layout/DashboardLayout';
import AuthGuard from 'utils/route-guard/AuthGuard';
import MonthlyReportPage from 'views/admin/reports/MonthlyReportPage';

const Timeline = () => {
  return (
    <AuthGuard>
      <DashboardLayout>
        <MonthlyReportPage />
      </DashboardLayout>
    </AuthGuard>
  );
};

export default Timeline;
