'use client';
import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import Tooltip from '@mui/material/Tooltip';
import { getBookingDetail, getBookingTree } from 'services/bookings';
import moment from 'moment';
import viLocale from '@fullcalendar/core/locales/vi';
import './style.css';
import { getRoomOptions } from 'services/rooms';
import { RoomGroup } from 'types/room';
import BookingModal from './BookingModal';
import { Backdrop, Button, CircularProgress, useMediaQuery } from '@mui/material';

type ResourceType = { id: string; title: string; houseCode: string };

export default function RoomTimelineFullCalendar() {
  const [resources, setResources] = useState<ResourceType[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [roomGroups, setRoomGroups] = useState<RoomGroup[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [dateSelected, setDateSelected] = useState<any>();
  const isMobile = useMediaQuery('(max-width:600px)');

  useEffect(() => {
    (async () => {
      try {
        const res = await getRoomOptions();
        const items: RoomGroup[] = (res?.items ?? []).map((g: any) => ({
          houseId: String(g.houseId ?? g._id),
          houseLabel: g.houseLabel,
          rooms: (g.rooms ?? []).map((r: any) => ({ _id: String(r._id), label: r.label ?? r.name ?? r.code }))
        }));
        setRoomGroups(items);
      } catch (e) {
        console.error(e);
        setRoomGroups([]);
      }
    })();
  }, []);

  // Convert data API -> resources + events
  const convertBookingTreeToFullCalendar = (data: any) => {
    const resources: ResourceType[] = [];
    const events: any[] = [];

    data.data.forEach((house: any) => {
      house.rooms.forEach((room: any) => {
        resources.push({
          id: room._id,
          title: room.name || room.code,
          houseCode: house.code
        });

        room.orders.forEach((order: any) => {
          events.push({
            id: order._id,
            resourceId: room._id,
            title: order.customerName,
            start: order.checkIn,
            end: order.checkOut,
            color: order.status === 'pending' ? '#f5a623' : order.status === 'cancelled' ? '#d0021b' : '#2b88d8',
            extendedProps: { price: order.price, status: order.status }
          });
        });
      });
    });

    return { resources, events };
  };

  // gọi API khi view thay đổi hoặc next/prev
  const handleDatesSet = async (dateInfo: any) => {
    const from = moment(dateInfo.start).format('YYYY-MM-DD');
    const to = moment(dateInfo.end).format('YYYY-MM-DD');
    setDateSelected(dateInfo);
    try {
      setLoading(true);
      const data = await getBookingTree({ from, to });
      const { resources, events } = convertBookingTreeToFullCalendar(data);
      setResources(resources);
      setEvents(events);
    } catch (err) {
      console.error('Lỗi khi lấy booking tree:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderEventContent = (eventInfo: any) => {
    const { event } = eventInfo;
    const { extendedProps } = event;

    return (
      <Tooltip title={`Khách: ${event.title} | Mã: ${event.id} | Giá: ${extendedProps.price} | Trạng thái: ${extendedProps.status}`}>
        <div
          style={{
            padding: 4
          }}
        >
          {event.title}
        </div>
      </Tooltip>
    );
  };

  const resourceAreaWidth = isMobile ? 130 : 250;

  return (
    <div style={{ height: '85vh', position: 'relative' }} className="time-line-wrapper">
      <FullCalendar
        plugins={[resourceTimelinePlugin, interactionPlugin, timeGridPlugin, dayGridPlugin]}
        initialView="resourceTimelineDay"
        headerToolbar={{
          left: 'today prev,next',
          center: 'title',
          right: 'resourceTimelineDay,resourceTimelineWeek,dayGridMonth'
        }}
        views={{
          resourceTimelineWeek: {
            type: 'resourceTimeline',
            duration: { days: 7 },
            slotDuration: { hours: isMobile ? 2 : 1 },
            slotLabelInterval: { hours: isMobile ? 6 : 4 },
            slotLabelFormat: [
              { weekday: 'short', day: '2-digit', month: isMobile ? undefined : '2-digit' },
              { hour: '2-digit', minute: '2-digit', hour12: false }
            ]
          },
          resourceTimelineDay: {
            slotDuration: { hours: isMobile ? 2 : 1 },
            slotLabelInterval: { hours: isMobile ? 3 : 2 },
            slotLabelFormat: [{ hour: '2-digit', minute: '2-digit', hour12: false }]
          }
        }}
        buttonText={{
          resourceTimelineDay: 'Ngày',
          resourceTimelineWeek: 'Tuần',
          dayGridMonth: 'Tháng'
        }}
        resourceGroupField="houseCode"
        resources={resources}
        resourceAreaHeaderContent={
          <Button
            variant="contained"
            sx={{ my: 2 }}
            onClick={() => {
              setOpenDialog(true);
              setSelectedBooking(null);
            }}
          >
            Đặt phòng
          </Button>
        }
        events={events}
        locale={viLocale}
        editable={false}
        selectable
        eventContent={renderEventContent}
        slotDuration="1:00:00"
        slotLabelInterval="06:00"
        slotLabelFormat={{
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }}
        resourceAreaWidth={resourceAreaWidth}
        nowIndicator
        eventOverlap={false}
        height="80vh"
        eventClick={async (info) => {
          const bookingId = info.event.id;
          try {
            setLoading(true);
            const detail = await getBookingDetail(bookingId);
            setSelectedBooking(detail);
            setOpenDialog(true);
          } catch (err) {
            console.error('Lỗi khi lấy chi tiết booking:', err);
          } finally {
            setLoading(false);
          }
        }}
        datesSet={handleDatesSet}
      />

      <BookingModal
        openDialog={openDialog}
        roomGroups={roomGroups}
        selectedBooking={selectedBooking}
        setOpenDialog={setOpenDialog}
        onCreated={() => handleDatesSet(dateSelected)}
      />

      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  );
}
