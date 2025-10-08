'use client';
import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import Tooltip from '@mui/material/Tooltip';
import { getBookingTree } from 'services/bookings';
import moment from 'moment';
import viLocale from '@fullcalendar/core/locales/vi';
import './style.css';

type ResourceType = { id: string; title: string; houseCode: string };

export default function RoomTimelineFullCalendar() {
  const [resources, setResources] = useState<ResourceType[]>([]);
  const [events, setEvents] = useState<any[]>([]);

  console.log('events', events);

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
    try {
      const data = await getBookingTree({ from, to });
      const { resources, events } = convertBookingTreeToFullCalendar(data);
      setResources(resources);
      setEvents(events);
    } catch (err) {
      console.error('Lỗi khi lấy booking tree:', err);
    }
  };

  const renderEventContent = (eventInfo: any) => {
    const { event } = eventInfo;
    const { extendedProps } = event;
    return (
      <Tooltip title={`Khách: ${event.title} | Mã: ${event.id} | Giá: ${extendedProps.price} | Trạng thái: ${extendedProps.status}`}>
        <div
          style={{
            padding: 2,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {event.title}
        </div>
      </Tooltip>
    );
  };

  return (
    <div style={{ height: '85vh', padding: 12 }}>
      <FullCalendar
        plugins={[resourceTimelinePlugin, interactionPlugin, timeGridPlugin, dayGridPlugin]}
        initialView="resourceTimelineDay"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'resourceTimelineDay,resourceTimelineWeek,dayGridMonth'
        }}
        views={{
          resourceTimelineWeek: {
            type: 'resourceTimeline',
            duration: { days: 7 },
            slotDuration: { hours: 1 },
            slotLabelInterval: { hours: 6 }, // nhãn mỗi 6 tiếng
            slotLabelFormat: [
              { weekday: 'short', day: '2-digit', month: '2-digit' }, // hàng trên: T2 07/10
              { hour: '2-digit', minute: '2-digit', hour12: false } // hàng dưới: 00:00, 06:00...
            ]
          },
          resourceTimelineDay: {
            slotDuration: { hours: 1 },
            slotLabelInterval: { hours: 2 },
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
        resourceAreaWidth={250}
        nowIndicator
        eventOverlap={false}
        height="80vh"
        datesSet={handleDatesSet} // ← tự động fetch dữ liệu khi view change hoặc next/prev
      />
    </div>
  );
}
