'use client';

import React, { useEffect, useState } from 'react';
import { Grid, Button, MenuItem, Select, FormControl, InputLabel, Typography, Box, Alert } from '@mui/material';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useFormik } from 'formik';
import dayjs, { Dayjs } from 'dayjs';
import MainCard from 'components/MainCard';
import HouseItem from 'components/rooms/HouseItem';
import { getHouses } from 'services/houses';
import { checkAvailableRooms } from 'services/rooms';
import Empty from 'components/Empty';

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
  status: 'available' | 'booked' | 'occupied' | 'maintenance';
};

type DataDisplay = {
  house: House;
  rooms: AvailableRoom[];
};

const hours = Array.from({ length: 24 }, (_, i) => i);
const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

// Kết hợp ngày + giờ/phút thành ISO
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
  const [dataDisplay, setDataDisplay] = useState<DataDisplay[]>([]);

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
        // Không hiển thị alert ở đây để tránh “ồn”; người dùng vẫn có thể thao tác tiếp
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
      facility: '', // houseId (tùy chọn)
      checkinHour: 0,
      checkinMinute: 0,
      checkinDate: null as Dayjs | null,
      checkoutHour: 0,
      checkoutMinute: 0,
      checkoutDate: null as Dayjs | null
    },
    validate: (values) => {
      const errors: Record<string, string> = {};
      if (!values.checkinDate) {
        errors.checkinDate = 'Vui lòng chọn ngày nhận phòng.';
      }
      if (!values.checkoutDate) {
        errors.checkoutDate = 'Vui lòng chọn ngày trả phòng.';
      }
      if (values.checkinDate && values.checkoutDate) {
        const ci = dayjs(values.checkinDate).hour(values.checkinHour).minute(values.checkinMinute).second(0).millisecond(0);
        const co = dayjs(values.checkoutDate).hour(values.checkoutHour).minute(values.checkoutMinute).second(0).millisecond(0);
        if (!ci.isValid() || !co.isValid()) {
          errors.checkoutDate = 'Định dạng ngày/giờ không hợp lệ.';
        } else if (!co.isAfter(ci)) {
          errors.checkoutDate = 'Thời gian trả phòng phải sau thời gian nhận phòng.';
        }
      }
      return errors;
    },
    onSubmit: async (values) => {
      setErrorMsg(null);
      setDataDisplay([]);
      try {
        // Chỉ validate checkin/checkout bằng formik → không kiểm tra facility tại đây
        const checkInISO = combineToISO(values.checkinDate, values.checkinHour, values.checkinMinute)!;
        const checkOutISO = combineToISO(values.checkoutDate, values.checkoutHour, values.checkoutMinute)!;

        setSubmitLoading(true);

        // houseId là tùy chọn: chỉ truyền khi có
        const payload: any = { checkIn: checkInISO, checkOut: checkOutISO };
        if (values.facility) payload.houseId = values.facility;

        const res = await checkAvailableRooms(payload);

        // Lỗi hệ thống/API
        if (!res?.ok) {
          setErrorMsg(res?.error || 'Lỗi hệ thống. Vui lòng thử lại sau.');
          return;
        }

        setDataDisplay(res.data || []);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e: any) {
        setErrorMsg('Không kiểm tra được phòng trống.');
      } finally {
        setSubmitLoading(false);
      }
    }
  });

  // Gom lỗi formik để hiển thị gọn
  const validationMessages = [formik.errors.checkinDate, formik.errors.checkoutDate].filter(Boolean) as string[];

  return (
    <Box sx={{ mt: 2 }}>
      <MainCard>
        <form onSubmit={formik.handleSubmit}>
          <Box>
            {/* Cơ sở (tùy chọn) */}
            <Grid item xs={12}>
              <FormControl sx={{ width: 360 }} disabled={loadingHouses}>
                <InputLabel>Chọn cơ sở (tùy chọn)</InputLabel>
                <Select name="facility" label="Chọn cơ sở (tùy chọn)" value={formik.values.facility} onChange={formik.handleChange}>
                  <MenuItem value={''}>-- Tất cả cơ sở --</MenuItem>
                  {houses.map((h) => (
                    <MenuItem key={h._id} value={h._id}>
                      {h.code || h.address}
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

            {/* Nút kiểm tra */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Button type="submit" variant="contained" disabled={submitLoading}>
                {submitLoading ? 'Đang kiểm tra…' : 'Kiểm tra'}
              </Button>
            </Grid>

            {/* Lỗi validate từ Formik */}
            {validationMessages.length > 0 && (
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Alert severity="warning">
                  {validationMessages.map((m, i) => (
                    <div key={i}>{m}</div>
                  ))}
                </Alert>
              </Grid>
            )}

            {/* Lỗi hệ thống/API */}
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

      {/* Nếu có chọn cơ sở → hiển thị tên cơ sở, nếu không → “Tất cả cơ sở” */}
      {dataDisplay?.length > 0 ? (
        dataDisplay.map((data, i) => (
          <HouseItem
            key={i}
            name={data?.house?.code || data?.house?.address || 'Không tên'}
            totalRooms={data?.rooms?.length || 0}
            showMore={false}
            rooms={data?.rooms || []}
            type="info"
          />
        ))
      ) : (
        <Empty />
      )}
    </Box>
  );
}
