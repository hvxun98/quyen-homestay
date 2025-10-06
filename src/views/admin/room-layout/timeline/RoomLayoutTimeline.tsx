'use client';
import React, { useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { parse, format, startOfWeek, getDay } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': require('date-fns/locale/en-US')
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 0 }),
  getDay,
  locales
});

const today = new Date();
const year = today.getFullYear();
const month = today.getMonth(); // 0-based
const day = today.getDate();

const events = [
  {
    title: 'Sơn Nam',
    start: new Date(2025, 9, 3, 12, 0),
    end: new Date(2025, 9, 3, 14, 0)
  },
  {
    title: 'Nguyễn Hoàng Đức',
    start: new Date(2025, 9, 3, 18, 0),
    end: new Date(2025, 9, 3, 19, 30)
  },
  {
    title: 'T-Dương Văn Thành',
    start: new Date(2025, 9, 3, 20, 0),
    end: new Date(2025, 9, 3, 22, 0)
  },
  {
    title: 'Nguyễn Văn A - Phòng 101',
    start: new Date(year, month, day, 19, 0),
    end: new Date(year, month, day, 20, 30)
  },
  {
    title: 'Trần Thị B - Phòng 102',
    start: new Date(year, month, day, 20, 0),
    end: new Date(year, month, day, 21, 15)
  },
  {
    title: 'Lê Văn C - Phòng 103',
    start: new Date(year, month, day, 21, 30),
    end: new Date(year, month, day, 22, 45)
  },
  {
    title: 'Phạm Thị D - Phòng 104',
    start: new Date(year, month, day, 22, 30),
    end: new Date(year, month, day, 23, 59)
  }
  // Thêm các sự kiện khác ở đây
];

const MyCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  return (
    <div style={{ height: 700 }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        views={['day', 'week', 'month']}
        step={30} // Giờ phân chia mỗi 30 phút
        timeslots={2} // Hiển thị thời gian theo 30 phút
        defaultView="day" // Mặc định hiển thị view ngày
        toolbar={true}
        defaultDate={currentDate}
        onNavigate={(date) => setCurrentDate(date)}
        eventPropGetter={(event) => ({
          style: {
            backgroundColor: 'linear-gradient(145deg, #38ae67ff 0%, #fad179ff 30%)',
            color: 'black',
            borderRadius: '4px',
            padding: '5px'
          }
        })}
      />
    </div>
  );
};

export default MyCalendar;
