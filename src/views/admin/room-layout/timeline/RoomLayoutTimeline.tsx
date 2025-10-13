'use client';
import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import Tooltip from '@mui/material/Tooltip';
import { getBookingDetail, getBookingTree, updateBooking } from 'services/bookings';
import moment from 'moment';
import viLocale from '@fullcalendar/core/locales/vi';
import './style.css';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  RadioGroup,
  Select,
  SelectChangeEvent,
  TextField,
  Typography
} from '@mui/material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { Radio } from '@mui/material';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Dayjs } from 'dayjs';
import { splitToForm } from 'utils/function';
import { hours, minutes } from 'constants/app';
import { onlyDigits, toVND } from 'utils/format';
import { getRoomOptions } from 'services/rooms';
import { RoomGroup } from 'types/room';

type ResourceType = { id: string; title: string; houseCode: string };

export default function RoomTimelineFullCalendar() {
  const [resources, setResources] = useState<ResourceType[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [roomGroups, setRoomGroups] = useState<RoomGroup[]>([]);

  const ci = splitToForm(selectedBooking?.checkIn);
  const co = splitToForm(selectedBooking?.checkOut);

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
        eventClick={async (info) => {
          const bookingId = info.event.id;
          console.log(info.event);

          try {
            const detail = await getBookingDetail(bookingId);
            setSelectedBooking(detail);
            setOpenDialog(true);
          } catch (err) {
            console.error('Lỗi khi lấy chi tiết booking:', err);
          }
        }}
        datesSet={handleDatesSet} // ← tự động fetch dữ liệu khi view change hoặc next/prev
      />

      {selectedBooking && (
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Chi tiết đặt phòng</DialogTitle>

          <Formik
            initialValues={{
              customerName: selectedBooking.customerName || '',
              customerPhone: selectedBooking.customerPhone || '',
              price: selectedBooking.price || 0,
              status: selectedBooking.status || 'pending',
              paymentStatus: selectedBooking.paymentStatus || 'unpaid',
              source: selectedBooking.source || '',
              note: selectedBooking.note || '',
              checkInDate: ci.date,
              checkInHour: ci.hour,
              checkInMinute: ci.minute,
              checkOutDate: co.date,
              checkOutHour: co.hour,
              checkOutMinute: co.minute,
              roomId: selectedBooking.roomId
            }}
            validationSchema={Yup.object({
              customerName: Yup.string().required('Vui lòng nhập tên khách'),
              price: Yup.number().required('Giá không được để trống').min(0, 'Giá phải >= 0'),
              checkInDate: Yup.mixed().required('Chọn ngày checkin'),
              checkOutDate: Yup.mixed().required('Chọn ngày checkout'),
              checkInHour: Yup.number().min(0).max(23).required(),
              checkInMinute: Yup.number().min(0).max(59).required(),
              checkOutHour: Yup.number().min(0).max(23).required(),
              checkOutMinute: Yup.number().min(0).max(59).required()
            })}
            onSubmit={async (values, { setSubmitting }) => {
              try {
                await updateBooking(selectedBooking._id, values);
                alert('Cập nhật thành công!');
                setOpenDialog(false);
                handleDatesSet({
                  start: moment().startOf('day'),
                  end: moment().endOf('day')
                });
              } catch (err) {
                console.error('Lỗi khi cập nhật booking:', err);
                alert('Cập nhật thất bại!');
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ values, errors, touched, handleChange, handleBlur, isSubmitting, setFieldValue, setFieldTouched }) => {
              const err = (name: keyof typeof values) => touched[name] && Boolean(errors[name]);
              const helper = (name: keyof typeof values) => (touched[name] ? (errors[name] as string) : '');
              return (
                <Form>
                  <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    {/* Thông tin cố định */}
                    <Typography>
                      <b>Mã đặt phòng:</b> {selectedBooking.orderCode}
                    </Typography>
                    <Typography>
                      <b>Người tạo:</b> {selectedBooking.createdBy}
                    </Typography>
                    {/* Phòng */}
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel id="room-label">Phòng</InputLabel>
                        <Select
                          labelId="room-label"
                          name="roomId"
                          label="Phòng"
                          value={values.roomId || ''}
                          onChange={(e: SelectChangeEvent) => {
                            const val = e.target.value as string;
                            console.log('Selected room:', val);
                            setFieldValue('roomId', val);
                          }}
                          MenuProps={{ PaperProps: { style: { maxHeight: 360 } } }}
                          disabled={roomGroups.length === 0}
                        >
                          {roomGroups.flatMap((g) => {
                            const items: JSX.Element[] = [];
                            items.push(
                              <MenuItem
                                key={`house-${g.houseId}`}
                                disabled
                                sx={{ fontWeight: 'bold', bgcolor: 'action.selected', color: 'text.primary' }}
                              >
                                {g.houseLabel}
                              </MenuItem>
                            );
                            g.rooms.forEach((r) =>
                              items.push(
                                <MenuItem key={r._id} value={r._id}>
                                  {r.label}
                                </MenuItem>
                              )
                            );
                            return items;
                          })}
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* Trường có thể chỉnh sửa */}
                    <TextField
                      label="Tên khách hàng"
                      name="customerName"
                      value={values.customerName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.customerName && Boolean(errors.customerName)}
                      helperText={touched.customerName && (errors.customerName as string)}
                      fullWidth
                    />
                    <TextField label="Số điện thoại" name="customerPhone" value={values.customerPhone} onChange={handleChange} fullWidth />
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        name="price"
                        label="Giá"
                        value={values.price ? toVND(values.price) : ''} // hiển thị 1.000.000
                        // onChange={formik.handleChange}
                        onBlur={handleBlur}
                        error={err('price')}
                        helperText={helper('price')}
                        onChange={(e) => {
                          const raw = onlyDigits(e.target.value);
                          setFieldValue('price', raw);
                          if (!touched.price) setFieldTouched('price', true, false);
                        }}
                        inputMode="numeric"
                      />
                    </Grid>
                    <TextField label="Trạng thái" name="status" select value={values.status} onChange={handleChange} fullWidth>
                      <MenuItem value="pending">Đang chờ</MenuItem>
                      <MenuItem value="success">Hoàn tất</MenuItem>
                      <MenuItem value="cancelled">Đã huỷ</MenuItem>
                    </TextField>

                    <FormControl component="fieldset">
                      <RadioGroup name="paymentStatus" value={values.paymentStatus} onChange={handleChange} row>
                        <FormControlLabel value="full" control={<Radio />} label="Thanh toán full" />
                        <FormControlLabel value="deposit" control={<Radio />} label="Cọc" />
                        <FormControlLabel value="unpaid" control={<Radio />} label="Chưa thanh toán" />
                      </RadioGroup>
                    </FormControl>

                    <TextField label="Nguồn" name="source" value={values.source} onChange={handleChange} fullWidth />

                    {/* Checkin */}
                    <Grid container spacing={1}>
                      <Grid item xs={4}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DesktopDatePicker
                            label="Checkin"
                            value={values.checkInDate as Dayjs}
                            onChange={(v) => setFieldValue('checkInDate', v)}
                          />
                        </LocalizationProvider>
                      </Grid>
                      <Grid item xs={4}>
                        <FormControl fullWidth error={err('checkInHour')}>
                          <InputLabel>Giờ</InputLabel>
                          <Select name="checkInHour" value={values.checkInHour} onChange={handleChange}>
                            {hours.map((h) => (
                              <MenuItem key={h} value={h}>
                                {h}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={4}>
                        <FormControl fullWidth error={err('checkInMinute')}>
                          <InputLabel>Phút</InputLabel>
                          <Select name="checkInMinute" value={values.checkInMinute} onChange={handleChange}>
                            {minutes.map((m) => (
                              <MenuItem key={m} value={m}>
                                {m}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>

                    {/* Checkout */}
                    <Grid container spacing={1}>
                      <Grid item xs={4}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DesktopDatePicker
                            label="Checkout"
                            value={values.checkOutDate as Dayjs}
                            onChange={(v) => setFieldValue('checkOutDate', v)}
                          />
                        </LocalizationProvider>
                      </Grid>
                      <Grid item xs={4}>
                        <FormControl fullWidth error={err('checkOutHour')}>
                          <InputLabel>Giờ</InputLabel>
                          <Select name="checkOutHour" value={values.checkOutHour} onChange={handleChange}>
                            {hours.map((h) => (
                              <MenuItem key={h} value={h}>
                                {h}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={4}>
                        <FormControl fullWidth error={err('checkOutMinute')}>
                          <InputLabel>Phút</InputLabel>
                          <Select name="checkOutMinute" value={values.checkOutMinute} onChange={handleChange}>
                            {minutes.map((m) => (
                              <MenuItem key={m} value={m}>
                                {m}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                    <TextField label="Ghi chú" name="note" value={values.note} onChange={handleChange} multiline rows={2} fullWidth />
                  </DialogContent>

                  <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
                    <Button type="submit" variant="contained" disabled={isSubmitting}>
                      {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </Button>
                  </DialogActions>
                </Form>
              );
            }}
          </Formik>
        </Dialog>
      )}
    </div>
  );
}
