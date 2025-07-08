import React from 'react';
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
  FormControl
} from '@mui/material';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useFormik } from 'formik';
import dayjs from 'dayjs';

const hours = Array.from({ length: 24 }, (_, i) => i);
const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 45, 50, 55];

const ActionBookingModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const formik = useFormik({
    initialValues: {
      room: 'Std 201 LLQ',
      name: 'king- Lê Khangg',
      phone: '0975506695',
      checkinDate: dayjs('2025-07-11'),
      checkinHour: 10,
      checkinMinute: 0,
      checkoutDate: dayjs('2025-07-11'),
      checkoutHour: 16,
      checkoutMinute: 0,
      price: '370000',
      source: 'Cộng tác viên',
      note: ''
    },
    onSubmit: (values) => {
      console.log('Form submitted:', values);
      onClose();
    }
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Chỉnh sửa đơn đặt</DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            {/* Phòng */}
            <Grid item xs={12}>
              <FormControl sx={{ maxWidth: '50%', width: '100%' }}>
                <InputLabel>Phòng</InputLabel>
                <Select name="room" label="Phòng" value={formik.values.room} onChange={formik.handleChange}>
                  <MenuItem value="Std 201 LLQ">Std 201 LLQ</MenuItem>
                  <MenuItem value="Std 501 LLQ">Std 501 LLQ</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Tên */}
            <Grid item xs={6}>
              <TextField fullWidth name="name" label="Tên" value={formik.values.name} onChange={formik.handleChange} />
            </Grid>

            {/* SĐT */}
            <Grid item xs={6}>
              <TextField fullWidth name="phone" label="Số điện thoại" value={formik.values.phone} onChange={formik.handleChange} />
            </Grid>

            {/* Checkin Date + Time */}
            <Grid item xs={3}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DesktopDatePicker
                  label="Checkin"
                  value={formik.values.checkinDate}
                  onChange={(value) => formik.setFieldValue('checkinDate', value)}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={1.5}>
              <FormControl fullWidth>
                <InputLabel>Giờ</InputLabel>
                <Select
                  name="checkinHour"
                  value={formik.values.checkinHour}
                  onChange={formik.handleChange}
                  MenuProps={{ PaperProps: { style: { maxHeight: 200 } } }}
                >
                  {hours.map((h) => (
                    <MenuItem key={h} value={h}>
                      {h}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={1.5}>
              <FormControl fullWidth>
                <InputLabel>Phút</InputLabel>
                <Select name="checkinMinute" value={formik.values.checkinMinute} onChange={formik.handleChange}>
                  {minutes.map((m) => (
                    <MenuItem key={m} value={m}>
                      {m}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Checkout Date + Time */}
            <Grid item xs={3}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DesktopDatePicker
                  label="Checkout"
                  value={formik.values.checkoutDate}
                  onChange={(value) => formik.setFieldValue('checkoutDate', value)}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={1.5}>
              <FormControl fullWidth>
                <InputLabel>Giờ</InputLabel>
                <Select
                  name="checkoutHour"
                  value={formik.values.checkoutHour}
                  onChange={formik.handleChange}
                  MenuProps={{ PaperProps: { style: { maxHeight: 200 } } }}
                >
                  {hours.map((h) => (
                    <MenuItem key={h} value={h}>
                      {h}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={1.5}>
              <FormControl fullWidth>
                <InputLabel>Phút</InputLabel>
                <Select name="checkoutMinute" value={formik.values.checkoutMinute} onChange={formik.handleChange}>
                  {minutes.map((m) => (
                    <MenuItem key={m} value={m}>
                      {m}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Giá */}
            <Grid item xs={6}>
              <TextField fullWidth name="price" label="Giá" value={formik.values.price} onChange={formik.handleChange} />
            </Grid>

            {/* Nguồn */}
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Nguồn</InputLabel>
                <Select name="source" value={formik.values.source} onChange={formik.handleChange}>
                  <MenuItem value="Facebook">Facebook</MenuItem>
                  <MenuItem value="Cộng tác viên">Cộng tác viên</MenuItem>
                  <MenuItem value="Khách quen">Khách quen</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Ghi chú */}
            <Grid item xs={12}>
              <TextField
                name="note"
                label="Ghi chú"
                value={formik.values.note}
                onChange={formik.handleChange}
                fullWidth
                multiline
                rows={3}
                placeholder="Nhập ghi chú"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Đóng</Button>
          <Button type="submit" variant="contained">
            Sửa
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ActionBookingModal;
