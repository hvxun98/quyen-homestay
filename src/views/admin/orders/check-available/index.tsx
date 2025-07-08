'use client';

import React from 'react';
import { Grid, Button, MenuItem, Select, FormControl, InputLabel, Typography, Box } from '@mui/material';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useFormik } from 'formik';
import MainCard from 'components/MainCard';
import HouseItem from 'components/rooms/HouseItem';

const hours = Array.from({ length: 24 }, (_, i) => i);
const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 45, 50, 55];

export default function CheckRoomForm() {
  const formik = useFormik({
    initialValues: {
      facility: '',
      checkinHour: 0,
      checkinMinute: 0,
      checkinDate: null,
      checkoutHour: 0,
      checkoutMinute: 0,
      checkoutDate: null
    },
    onSubmit: (values) => {
      console.log('Form Values:', values);
    }
  });

  return (
    <Box sx={{ mt: 2 }}>
      <MainCard>
        <form onSubmit={formik.handleSubmit}>
          <Box>
            {/* Cơ sở */}
            <Grid item xs={12}>
              <FormControl sx={{ width: 300 }}>
                <InputLabel>Chọn cơ sở</InputLabel>
                <Select name="facility" label="Chọn cơ sở" value={formik.values.facility} onChange={formik.handleChange}>
                  <MenuItem value="">-- Chọn nhà (tùy chọn) --</MenuItem>
                  <MenuItem value="nha1">Nhà 1</MenuItem>
                  <MenuItem value="nha2">Nhà 2</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Checkin */}
            <Grid container spacing={2} sx={{ mt: 2 }}>
              {' '}
              <Grid item xs={2}>
                <FormControl fullWidth>
                  <InputLabel>Giờ</InputLabel>
                  <Select
                    name="checkinHour"
                    value={formik.values.checkinHour}
                    onChange={formik.handleChange}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 400
                        }
                      }
                    }}
                  >
                    {hours.map((h) => (
                      <MenuItem key={h} value={h}>
                        {h}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={2}>
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
              <Grid item xs={4}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DesktopDatePicker
                    label="Checkin"
                    value={formik.values.checkinDate}
                    onChange={(value) => formik.setFieldValue('checkinDate', value)}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>

            {/* Checkout */}
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={2}>
                <FormControl fullWidth>
                  <InputLabel>Giờ</InputLabel>
                  <Select
                    name="checkoutHour"
                    value={formik.values.checkoutHour}
                    onChange={formik.handleChange}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 400
                        }
                      }
                    }}
                  >
                    {hours.map((h) => (
                      <MenuItem key={h} value={h}>
                        {h}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={2}>
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

              <Grid item xs={4}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DesktopDatePicker
                    label="Checkout"
                    value={formik.values.checkoutDate}
                    onChange={(value) => formik.setFieldValue('checkoutDate', value)}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>

            {/* Button */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Button type="submit" variant="contained">
                Kiểm tra
              </Button>
            </Grid>
          </Box>
        </form>
      </MainCard>
      <Typography variant="h4" sx={{ mt: 4 }}>
        Danh sách phòng trống
      </Typography>
      <HouseItem
        name="880 Bạch Đằng"
        totalRooms={4}
        showMore={false}
        rooms={[
          {
            name: 'Std 201 LLQ',
            status: 1
          }
        ]}
        type="info"
      />
      <HouseItem
        name="880 Bạch Đằng"
        totalRooms={4}
        showMore={false}
        rooms={[
          {
            name: 'Std 201 LLQ',
            status: 1
          }
        ]}
        type="info"
      />
    </Box>
  );
}
