'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Grid, Button, MenuItem, Select, FormControl, InputLabel, Typography, Box, Alert } from '@mui/material';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useFormik } from 'formik';
import { Dayjs } from 'dayjs';
import MainCard from 'components/MainCard';
import HouseItem from 'components/rooms/HouseItem';
import { getHouses } from 'services/houses';
import { checkAvailableRooms } from 'services/rooms';

type House = {
  _id: string;
  code: string;
  address: string;
};

type AvailableRoom = {
  _id: string;
  code: string;
  codeNorm?: string;
  name: string;
  type: 'Standard' | 'VIP';
  status: 'available' | 'occupied' | 'maintenance' | 'inactive';
};

const hours = Array.from({ length: 24 }, (_, i) => i);
const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]; // thêm 40'

function combineToISO(date: Dayjs | null, hour: number, minute: number) {
  if (!date) return null;
  const d = date.toDate();
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export default function CheckRoomForm() {
  const [houses, setHouses] = useState<House[]>([]);
  const [loadingHouses, setLoadingHouses] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [rooms, setRooms] = useState<AvailableRoom[]>([]);

  // load dropdown cơ sở
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingHouses(true);
        const res = await getHouses({ pageNum: 1, pageSize: 100 });
        if (mounted) {
          setHouses((res?.items || []).map((h: any) => ({ _id: h._id, code: h.code, address: h.address })));
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e: any) {
      } finally {
        setLoadingHouses(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const formik = useFormik({
    initialValues: {
      facility: '', // houseId
      checkinHour: 0,
      checkinMinute: 0,
      checkinDate: null as Dayjs | null,
      checkoutHour: 0,
      checkoutMinute: 0,
      checkoutDate: null as Dayjs | null
    },
    onSubmit: async (values) => {
      setErrorMsg(null);
      setRooms([]);
      try {
        if (!values.facility) {
          setErrorMsg('Vui lòng chọn cơ sở.');
          return;
        }
        const checkInISO = combineToISO(values.checkinDate, values.checkinHour, values.checkinMinute);
        const checkOutISO = combineToISO(values.checkoutDate, values.checkoutHour, values.checkoutMinute);
        if (!checkInISO || !checkOutISO) {
          setErrorMsg('Vui lòng chọn đầy đủ ngày/giờ nhận phòng và trả phòng.');
          return;
        }

        setSubmitLoading(true);
        const res = await checkAvailableRooms({
          houseId: values.facility,
          checkIn: checkInISO,
          checkOut: checkOutISO
        });

        setRooms(res.data || []);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e: any) {
      } finally {
        setSubmitLoading(false);
      }
    }
  });

  // dữ liệu render cho HouseItem
  const selectedHouse = useMemo(() => houses.find((h) => h._id === formik.values.facility), [houses, formik.values.facility]);
  const totalRooms = rooms.length;
  const roomCards = rooms.map((r) => ({
    name: r.name || r.code,
    status: r.status === 'available' ? 1 : 0 // HouseItem đang dùng { name, status } (1 = available)
  }));

  return (
    <Box sx={{ mt: 2 }}>
      <MainCard>
        <form onSubmit={formik.handleSubmit}>
          <Box>
            {/* Cơ sở */}
            <Grid item xs={12}>
              <FormControl sx={{ width: 360 }} disabled={loadingHouses}>
                <InputLabel>Chọn cơ sở</InputLabel>
                <Select name="facility" label="Chọn cơ sở" value={formik.values.facility} onChange={formik.handleChange}>
                  <MenuItem value="">-- Chọn cơ sở --</MenuItem>
                  {houses.map((h) => (
                    <MenuItem key={h._id} value={h._id}>
                      {h.address || h.code}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Checkin */}
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={2}>
                <FormControl fullWidth>
                  <InputLabel>Giờ</InputLabel>
                  <Select name="checkinHour" value={formik.values.checkinHour} onChange={formik.handleChange}>
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
                  <Select name="checkoutHour" value={formik.values.checkoutHour} onChange={formik.handleChange}>
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
              <Button type="submit" variant="contained" disabled={submitLoading}>
                {submitLoading ? 'Đang kiểm tra…' : 'Kiểm tra'}
              </Button>
            </Grid>

            {errorMsg && (
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Alert severity="error">{errorMsg}</Alert>
              </Grid>
            )}
          </Box>
        </form>
      </MainCard>

      <Typography variant="h4" sx={{ mt: 4 }}>
        Danh sách phòng trống
      </Typography>

      {/* Render theo cơ sở đã chọn */}
      {selectedHouse && (
        <HouseItem
          name={selectedHouse.address || selectedHouse.code}
          totalRooms={totalRooms}
          showMore={false}
          rooms={roomCards}
          type="info"
        />
      )}
    </Box>
  );
}
