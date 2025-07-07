import DashboardLayout from 'layout/DashboardLayout';
import AuthGuard from 'utils/route-guard/AuthGuard';
import RoomLayoutSimple from 'views/admin/room-layout/simple/RoomLayoutSimple';

const Timeline = () => {
  return (
    <AuthGuard>
      <DashboardLayout>
        <RoomLayoutSimple />
      </DashboardLayout>
    </AuthGuard>
  );
};

export default Timeline;
