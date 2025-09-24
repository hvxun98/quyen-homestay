// src/components/OrderAction.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  ListSubheader,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress
} from '@mui/material';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import dayjs, { Dayjs } from 'dayjs';

// services
import { getRoomOptions } from 'services/rooms';
import { createBooking, updateBooking } from 'services/bookings';

// types
type PayStatus = 'full' | 'deposit' | 'unpaid';
type RoomGroup = { houseId: string; houseLabel: string; rooms: { _id: string; label: string }[] };

type Props = {
  open: boolean;
  onClose: () => void;
  houseId: string; // cơ sở đang chọn ở bảng ngoài
  onCreated?: () => void; // reload list sau khi submit
  defaultRoomId?: string;

  /** Nếu truyền booking => modal ở chế độ SỬA */
  booking?: {
    id: string;
    roomId: string;
    customerName: string;
    customerPhone?: string;
    checkIn: string | Date;
    checkOut: string | Date;
    price: number;
    source?: string;
    paymentStatus?: PayStatus;
    note?: string;
  };
};

const hours = Array.from({ length: 24 }, (_, i) => i);
const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 45, 50, 55];

const validationSchema = Yup.object({
  roomId: Yup.string().required('Chọn phòng'),
  customerName: Yup.string().trim().required('Nhập tên khách'),
  customerPhone: Yup.string().trim().nullable(),
  checkInDate: Yup.mixed().required('Chọn ngày checkin'),
  checkOutDate: Yup.mixed().required('Chọn ngày checkout'),
  checkInHour: Yup.number().min(0).max(23).required(),
  checkInMinute: Yup.number().min(0).max(59).required(),
  checkOutHour: Yup.number().min(0).max(23).required(),
  checkOutMinute: Yup.number().min(0).max(59).required(),
  price: Yup.number().min(0, 'Giá không âm').required('Nhập giá'),
  source: Yup.string().nullable(),
  paymentStatus: Yup.mixed<PayStatus>().oneOf(['full', 'deposit', 'unpaid']).required(),
  note: Yup.string().nullable()
});

// ---- helpers ---------------------------------------------------------------
const toYMD = (d: Dayjs | null) => (d ? d.format('YYYY-MM-DD') : '');

function splitToForm(dt: string | Date) {
  const d = dayjs(dt);
  return { date: d, hour: d.hour(), minute: d.minute() };
}

function buildInitialValues(houseId: string, groups: RoomGroup[], defaultRoomId?: string, booking?: Props['booking']) {
  // nếu edit => bind từ booking
  if (booking) {
    const ci = splitToForm(booking.checkIn);
    const co = splitToForm(booking.checkOut);
    return {
      roomId: booking.roomId,
      customerName: booking.customerName,
      customerPhone: booking.customerPhone ?? '',
      checkInDate: ci.date,
      checkInHour: ci.hour,
      checkInMinute: ci.minute,
      checkOutDate: co.date,
      checkOutHour: co.hour,
      checkOutMinute: co.minute,
      price: booking.price,
      source: booking.source ?? 'Facebook ads',
      paymentStatus: (booking.paymentStatus ?? 'full') as PayStatus,
      note: booking.note ?? ''
    };
  }

  // create => chọn room mặc định theo groups/houseId hoặc theo defaultRoomId
  let fallbackRoom = defaultRoomId || '';
  if (!fallbackRoom) {
    const g = groups.find((x) => x.houseId === houseId) ?? groups[0];
    fallbackRoom = g?.rooms?.[0]?._id ?? '';
  }
  return {
    roomId: fallbackRoom,
    customerName: '',
    customerPhone: '',
    checkInDate: dayjs(),
    checkInHour: 0,
    checkInMinute: 0,
    checkOutDate: dayjs().add(1, 'day'),
    checkOutHour: 0,
    checkOutMinute: 0,
    price: '' as any,
    source: 'Facebook ads',
    paymentStatus: 'full' as PayStatus,
    note: ''
  };
}

// ---------------------------------------------------------------------------

const OrderAction: React.FC<Props> = ({ open, onClose, houseId, onCreated, defaultRoomId, booking }) => {
  const [roomGroups, setRoomGroups] = useState<RoomGroup[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);

  // load options phòng (lọc theo houseId để dropdown gọn đúng ảnh)
  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        setLoadingRooms(true);
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
      } finally {
        setLoadingRooms(false);
      }
    })();
  }, [open, houseId]);

  // formik
  const initialValues = useMemo(
    () => buildInitialValues(houseId, roomGroups, defaultRoomId, booking),
    // chỉ rebuild khi mở modal, danh sách groups đổi, house đổi, hoặc booking đổi
    // tránh rebuild mỗi render
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [open, houseId, roomGroups.map((g) => g.houseId + ':' + g.rooms.length).join('|'), defaultRoomId, booking?.id]
  );

  const formik = useFormik({
    validationSchema,
    initialValues, // không bật enableReinitialize
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setSubmitting(true);
        const payload = {
          houseId,
          roomId: values.roomId,
          customerName: values.customerName.trim(),
          customerPhone: values.customerPhone?.trim() || undefined,
          checkInDate: toYMD(values.checkInDate as Dayjs),
          checkInHour: Number(values.checkInHour),
          checkInMinute: Number(values.checkInMinute),
          checkOutDate: toYMD(values.checkOutDate as Dayjs),
          checkOutHour: Number(values.checkOutHour),
          checkOutMinute: Number(values.checkOutMinute),
          price: Number(values.price || 0),
          source: values.source || undefined,
          paymentStatus: values.paymentStatus,
          note: values.note?.trim() || undefined
        };

        if (booking?.id) {
          // UPDATE
          await updateBooking(booking.id, payload);
        } else {
          // CREATE
          await createBooking(payload);
        }

        onClose();
        onCreated?.();
      } catch (e: any) {
        alert(e?.message || 'Có lỗi xảy ra');
      } finally {
        setSubmitting(false);
      }
    }
  });

  // reset form mỗi lần mở modal (để nhận initialValues mới) — tránh vòng lặp
  useEffect(() => {
    if (open) {
      formik.resetForm({ values: initialValues });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialValues]);

  const err = (name: keyof typeof formik.values) => formik.touched[name] && Boolean(formik.errors[name]);
  const helper = (name: keyof typeof formik.values) => (formik.touched[name] ? (formik.errors[name] as string) : '');

  // render
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{booking?.id ? 'Sửa đặt phòng' : 'Đặt phòng'}</DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            {/* Phòng */}
            <Grid item xs={12}>
              <FormControl fullWidth error={err('roomId')}>
                <InputLabel id="room-label">Phòng</InputLabel>
                <Select
                  labelId="room-label"
                  name="roomId"
                  label="Phòng"
                  value={formik.values.roomId}
                  onChange={formik.handleChange}
                  MenuProps={{ PaperProps: { style: { maxHeight: 360 } } }}
                  disabled={loadingRooms}
                >
                  {roomGroups.map((g) => (
                    <React.Fragment key={g.houseId}>
                      <ListSubheader disableSticky>
                        <strong>{g.houseLabel}</strong>
                      </ListSubheader>
                      {g.rooms.map((r) => (
                        <MenuItem key={r._id} value={r._id}>
                          {r.label}
                        </MenuItem>
                      ))}
                    </React.Fragment>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Tên & SĐT */}
            <Grid item xs={6}>
              <TextField
                fullWidth
                name="customerName"
                label="Tên"
                value={formik.values.customerName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={err('customerName')}
                helperText={helper('customerName')}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                name="customerPhone"
                label="Số điện thoại"
                value={formik.values.customerPhone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={err('customerPhone')}
                helperText={helper('customerPhone')}
              />
            </Grid>

            {/* Checkin */}
            <Grid item xs={3}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DesktopDatePicker
                  label="Checkin"
                  value={formik.values.checkInDate as Dayjs}
                  onChange={(v) => formik.setFieldValue('checkInDate', v)}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={1.5}>
              <FormControl fullWidth error={err('checkInHour')}>
                <InputLabel>Giờ</InputLabel>
                <Select name="checkInHour" value={formik.values.checkInHour} onChange={formik.handleChange}>
                  {hours.map((h) => (
                    <MenuItem key={h} value={h}>
                      {h}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={1.5}>
              <FormControl fullWidth error={err('checkInMinute')}>
                <InputLabel>Phút</InputLabel>
                <Select name="checkInMinute" value={formik.values.checkInMinute} onChange={formik.handleChange}>
                  {minutes.map((m) => (
                    <MenuItem key={m} value={m}>
                      {m}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Checkout */}
            <Grid item xs={3}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DesktopDatePicker
                  label="Checkout"
                  value={formik.values.checkOutDate as Dayjs}
                  onChange={(v) => formik.setFieldValue('checkOutDate', v)}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={1.5}>
              <FormControl fullWidth error={err('checkOutHour')}>
                <InputLabel>Giờ</InputLabel>
                <Select name="checkOutHour" value={formik.values.checkOutHour} onChange={formik.handleChange}>
                  {hours.map((h) => (
                    <MenuItem key={h} value={h}>
                      {h}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={1.5}>
              <FormControl fullWidth error={err('checkOutMinute')}>
                <InputLabel>Phút</InputLabel>
                <Select name="checkOutMinute" value={formik.values.checkOutMinute} onChange={formik.handleChange}>
                  {minutes.map((m) => (
                    <MenuItem key={m} value={m}>
                      {m}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Giá & Nguồn */}
            <Grid item xs={6}>
              <TextField
                fullWidth
                name="price"
                label="Giá"
                value={formik.values.price}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={err('price')}
                helperText={helper('price')}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Nguồn</InputLabel>
                <Select name="source" value={formik.values.source} onChange={formik.handleChange}>
                  <MenuItem value="Facebook ads">Facebook ads</MenuItem>
                  <MenuItem value="Cộng tác viên">Cộng tác viên</MenuItem>
                  <MenuItem value="Khách quen">Khách quen</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Thanh toán */}
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <RadioGroup name="paymentStatus" value={formik.values.paymentStatus} onChange={formik.handleChange} row>
                  <FormControlLabel value="full" control={<Radio />} label="Thanh toán full" />
                  <FormControlLabel value="deposit" control={<Radio />} label="Cọc" />
                  <FormControlLabel value="unpaid" control={<Radio />} label="Chưa thanh toán" />
                </RadioGroup>
              </FormControl>
            </Grid>

            {/* Ghi chú */}
            <Grid item xs={12}>
              <TextField
                name="note"
                label="Ghi chú"
                fullWidth
                multiline
                rows={3}
                value={formik.values.note}
                onChange={formik.handleChange}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={formik.isSubmitting}>
            Đóng
          </Button>
          <Button type="submit" variant="contained" disabled={formik.isSubmitting}>
            {formik.isSubmitting ? <CircularProgress size={20} /> : booking?.id ? 'Cập nhật' : 'Đặt phòng'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default OrderAction;
