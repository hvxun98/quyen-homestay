import DashboardLayout from 'layout/DashboardLayout';
import AuthGuard from 'utils/route-guard/AuthGuard';
import RoomLayoutTimeline from 'views/admin/room-layout/timeline/RoomLayoutTimeline';

const Timeline = () => {
  return (
    <AuthGuard>
      <DashboardLayout>
        <RoomLayoutTimeline />
      </DashboardLayout>
    </AuthGuard>
  );
};

export default Timeline;
