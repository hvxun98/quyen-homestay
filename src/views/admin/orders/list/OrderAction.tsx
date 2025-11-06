// src/components/OrderAction.tsx
import React, { useMemo } from 'react';
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
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
  SelectChangeEvent
} from '@mui/material';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import dayjs, { Dayjs } from 'dayjs';

// services
import { createBooking, updateBooking } from 'services/bookings';
import { BookingProps } from 'types/booking';
import { onlyDigits, toVND, toYMD } from 'utils/format';
import { splitToForm } from 'utils/function';
import { hours, minutes, source } from 'constants/app';
import { PAYMENT_STATUS } from 'constants/booking';

// types
type PayStatus = 'full' | 'deposit' | 'unpaid';
type RoomGroup = { houseId: string; houseLabel: string; rooms: { _id: string; label: string }[] };

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void; // reload list sau khi submit
  defaultRoomId?: string;
  roomGroups: RoomGroup[]; // danh sách phòng theo từng cơ sở

  /** Nếu truyền booking => modal ở chế độ SỬA */
  booking?: BookingProps;
};

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

function buildInitialValues(booking?: Props['booking']) {
  // nếu edit => bind từ booking
  if (booking) {
    const ci = splitToForm(booking.checkIn);
    const co = splitToForm(booking.checkOut);
    return {
      roomId: booking.roomId?._id,
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

  return {
    roomId: '',
    customerName: '',
    customerPhone: '',
    checkInDate: dayjs(),
    checkInHour: 0,
    checkInMinute: 0,
    checkOutDate: dayjs().add(1, 'day'),
    checkOutHour: 0,
    checkOutMinute: 0,
    price: 0,
    source: 'Facebook ads',
    paymentStatus: 'full' as PayStatus,
    note: ''
  };
}

// ---------------------------------------------------------------------------

const OrderAction: React.FC<Props> = ({ open, onClose, onCreated, defaultRoomId, booking, roomGroups }) => {
  // formik

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const initialValues = useMemo(() => buildInitialValues(booking), [booking?.id, open]);

  const formik = useFormik({
    enableReinitialize: true,
    validationSchema,
    initialValues,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setSubmitting(true);
        const payload = {
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
          note: values.note?.trim() || undefined,
          status: 'success'
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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e: any) {
      } finally {
        setSubmitting(false);
      }
    }
  });

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
                  value={formik.values.roomId || ''}
                  onChange={(e: SelectChangeEvent) => {
                    const val = e.target.value as string;
                    console.log('Selected room:', val);
                    formik.setFieldValue('roomId', val);
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

            {/* Tên & SĐT */}
            <Grid item xs={12} md={6}>
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
            <Grid item xs={12} md={6}>
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
            <Grid item xs={6} md={3}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DesktopDatePicker
                  sx={{ width: '100%' }}
                  label="Checkin"
                  value={formik.values.checkInDate as Dayjs}
                  onChange={(v) => formik.setFieldValue('checkInDate', v)}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={3} md={1.5}>
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
            <Grid item xs={3} md={1.5}>
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
            <Grid item xs={6} md={3}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DesktopDatePicker
                  label="Checkout"
                  value={formik.values.checkOutDate as Dayjs}
                  onChange={(v) => formik.setFieldValue('checkOutDate', v)}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={3} md={1.5}>
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
            <Grid item xs={3} md={1.5}>
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
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="price"
                label="Giá"
                value={formik.values.price ? toVND(formik.values.price) : ''} // hiển thị 1.000.000
                // onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={err('price')}
                helperText={helper('price')}
                onChange={(e) => {
                  const raw = onlyDigits(e.target.value);
                  formik.setFieldValue('price', raw);
                  if (!formik.touched.price) formik.setFieldTouched('price', true, false);
                }}
                inputMode="numeric"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Nguồn</InputLabel>
                <Select name="source" value={formik.values.source} onChange={formik.handleChange}>
                  {source.map((item: any) => (
                    <MenuItem key={item.value} value={item.value}>
                      {item.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Thanh toán */}
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <RadioGroup name="paymentStatus" value={formik.values.paymentStatus} onChange={formik.handleChange} row>
                  <FormControlLabel value={PAYMENT_STATUS.FULL} control={<Radio />} label="Thanh toán full" />
                  <FormControlLabel value={PAYMENT_STATUS.DEPOSIT} control={<Radio />} label="Cọc" />
                  <FormControlLabel value={PAYMENT_STATUS.UNPAID} control={<Radio />} label="Chưa thanh toán" />
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
