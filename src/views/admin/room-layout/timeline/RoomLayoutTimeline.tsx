'use client';
import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import Tooltip from '@mui/material/Tooltip';
import { getBookingTree } from 'services/bookings';
import moment from 'moment';
import './style.css';
import viLocale from '@fullcalendar/core/locales/vi';

type ResourceType = { id: string; title: string; houseCode: string };

export default function RoomTimelineFullCalendar() {
  const [resources, setResources] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);

  const convertBookingTreeToFullCalendar = async () => {
    const data = await getBookingTree({ from: moment().format('YYYY-MM-DD') });
    const resources: ResourceType[] = [];
    const events: any[] = [];

    data.data.forEach((house: any) => {
      house.rooms.forEach((room: any) => {
        resources.push({
          id: room._id,
          title: room.name || room.code,
          houseCode: house.code
        });

        // nếu room.orders không rỗng, convert thành events
        room.orders.forEach((order: any) => {
          events.push({
            id: order._id,
            resourceId: room._id,
            title: order.customerName,
            start: order.checkIn,
            end: order.checkOut,
            color: '#2b88d8'
          });
        });
      });
    });

    return { resources, events };
  };

  useEffect(() => {
    const fetchData = async () => {
      const { resources, events } = await convertBookingTreeToFullCalendar();
      setResources(resources);
      setEvents(events);
    };
    fetchData();
  }, []);

  // Custom render event with tooltip
  const renderEventContent = (eventInfo: any) => {
    const { event } = eventInfo;
    const { extendedProps } = event;
    return (
      <Tooltip title={`Khách: ${event.title} | Mã: ${event.id} | Giá: ${extendedProps.price} | Trạng thái: ${extendedProps.status}`}>
        <div style={{ padding: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{event.title}</div>
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
        resourceGroupField="houseCode"
        resources={resources}
        events={events}
        locale={viLocale}
        editable
        selectable
        eventContent={renderEventContent}
        slotDuration="00:30:00"
        slotLabelInterval="06:00"
        resourceAreaWidth={250}
        nowIndicator
        eventOverlap={false}
        height="80vh"
        slotLabelFormat={{
          hour: '2-digit', // 24h format
          minute: '2-digit',
          hour12: false // quan trọng để hiện 24h
        }}
      />
    </div>
  );
}
