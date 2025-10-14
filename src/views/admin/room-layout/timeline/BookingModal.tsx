import React from 'react';
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
import { Form, useFormik } from 'formik';
import * as Yup from 'yup';
import { Radio } from '@mui/material';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { splitToForm } from 'utils/function';
import { hours, minutes } from 'constants/app';
import { onlyDigits, toVND } from 'utils/format';
import { updateBooking } from 'services/bookings';
import { RoomGroup } from 'types/room';

type BookingModalProps = {
  selectedBooking?: any;
  roomGroups: RoomGroup[];
  openDialog: boolean;
  setOpenDialog: (value: boolean) => void;
};

function BookingModal({ selectedBooking, roomGroups, openDialog = false, setOpenDialog = () => {} }: BookingModalProps) {
  const ci = splitToForm(selectedBooking?.checkIn);
  const co = splitToForm(selectedBooking?.checkOut);

  const validationSchema = Yup.object({
    customerName: Yup.string().required('Vui lòng nhập tên khách'),
    price: Yup.number().required('Giá không được để trống').min(0, 'Giá phải >= 0'),
    checkInDate: Yup.mixed().required('Chọn ngày checkin'),
    checkOutDate: Yup.mixed().required('Chọn ngày checkout'),
    checkInHour: Yup.number().min(0).max(23).required(),
    checkInMinute: Yup.number().min(0).max(59).required(),
    checkOutHour: Yup.number().min(0).max(23).required(),
    checkOutMinute: Yup.number().min(0).max(59).required()
  });

  const initialValues = {
    customerName: selectedBooking?.customerName || '',
    customerPhone: selectedBooking?.customerPhone || '',
    price: selectedBooking?.price || 0,
    status: selectedBooking?.status || 'pending',
    paymentStatus: selectedBooking?.paymentStatus || 'full',
    source: selectedBooking?.source || 'Facebook ads',
    note: selectedBooking?.note || '',
    checkInDate: selectedBooking?.checkIn ? ci.date : dayjs(),
    checkInHour: selectedBooking?.checkIn ? ci.hour : 0,
    checkInMinute: selectedBooking?.checkIn ? ci.minute : 0,
    checkOutDate: selectedBooking?.checkOut ? co.date : dayjs().add(1, 'day'),
    checkOutHour: selectedBooking?.checkOut ? co.hour : 0,
    checkOutMinute: selectedBooking?.checkOut ? co.minute : 0,
    roomId: selectedBooking?.roomId || ''
  };

  const formik = useFormik({
    validationSchema,
    initialValues,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await updateBooking(selectedBooking?._id, values);
        alert('Cập nhật thành công!');
        setOpenDialog(false);
        formik.resetForm();
      } catch (err) {
        console.error('Lỗi khi cập nhật booking:', err);
        alert('Cập nhật thất bại!');
      } finally {
        setSubmitting(false);
      }
    }
  });

  const err = (name: keyof typeof formik.values) => formik.touched[name] && Boolean(formik.errors[name]);
  const helper = (name: keyof typeof formik.values) => (formik.touched[name] ? (formik.errors[name] as string) : '');
  const {
    values,
    isSubmitting,
    touched,
    errors,
    setFieldValue = () => {},
    handleChange = () => {},
    handleBlur = () => {},
    handleSubmit = () => {},
    setFieldTouched = () => {}
  } = formik;
  return (
    <Dialog
      open={openDialog}
      disableEscapeKeyDown
      onClose={(event, reason) => {
        if (reason === 'backdropClick') return;
        setOpenDialog(false);
        formik.resetForm();
      }}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Chi tiết đặt phòng</DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {/* Thông tin cố định */}
          <Typography>
            <b>Mã đặt phòng:</b> {selectedBooking?.orderCode}
          </Typography>
          <Typography>
            <b>Người tạo:</b> {selectedBooking?.createdBy}
          </Typography>
          {/* Phòng */}
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel id="room-label">Phòng</InputLabel>
              <Select
                labelId="room-label"
                name="roomId"
                label="Phòng"
                value={formik.values.roomId || ''}
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
                <DesktopDatePicker label="Checkin" value={values.checkInDate as Dayjs} onChange={(v) => setFieldValue('checkInDate', v)} />
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
      </form>
    </Dialog>
  );
}

export default BookingModal;
