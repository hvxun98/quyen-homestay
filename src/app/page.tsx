'use client';
import AuthGuard from 'utils/route-guard/AuthGuard';
import DashboardLayout from 'layout/DashboardLayout';

// ==============================|| LANDING PAGE ||============================== //

export default function Landing() {
  const renderUiByDomain = () => {
    return (
      <AuthGuard>
        <DashboardLayout>Hello admin !</DashboardLayout>
      </AuthGuard>
    );
  };

  return renderUiByDomain();
}
