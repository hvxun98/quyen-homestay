'use client';

import React, { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import dayjs, { Dayjs } from 'dayjs';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Divider,
  CircularProgress,
  Alert,
  TextField,
  MenuItem
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { getDailyDashboard, DailyDashboardRes, Basis } from 'services/dashboard';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const SOURCE = [
  { label: 'Facebook ads', value: 'facebookAds' },
  { label: 'Zalo', value: 'zalo' },
  { label: 'Đây là đâu', value: 'dayLaDau' },
  { label: 'Cộng tác viên', value: 'congTacVien' },
  { label: 'Airbnb', value: 'airbnb' },
  { label: 'Booking', value: 'booking' },
  { label: 'Senstay', value: 'senstay' }
] as const;

const fmtVND = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n || 0);

export default function DashboardDailyMUI() {
  const [date, setDate] = useState<Dayjs | null>(dayjs()); // dùng Dayjs cho DatePicker
  const [basis, setBasis] = useState<Basis>('checkIn');
  const [data, setData] = useState<DailyDashboardRes | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleFetch = async () => {
    if (!date) return;
    setLoading(true);
    setErr(null);
    try {
      const res = await getDailyDashboard(date.format('YYYY-MM-DD'), basis);
      setData(res);
    } catch (e: any) {
      setErr(e?.message || 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pieSeries = useMemo(() => {
    if (!data) return [0, 0];
    return [data.occupancy.booked, data.occupancy.available];
  }, [data]);

  const pieOptions = useMemo(
    () => ({
      chart: { type: 'pie', toolbar: { show: false } },
      labels: ['Phòng Đã Đặt', 'Phòng Còn Trống'],
      legend: { position: 'top' as const },
      dataLabels: { enabled: true },
      colors: ['#e74c3c', '#27ae60'],
      stroke: { show: true, width: 2, colors: ['#ffffff'] }
    }),
    []
  );

  const occupancyRatePct = useMemo(() => (data ? Math.round((data.occupancy.rate || 0) * 100) : 0), [data]);

  return (
    <Box pt={3}>
      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md="auto">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DesktopDatePicker
              label="Ngày"
              value={date}
              onChange={(v) => setDate(v)}
              format="YYYY-MM-DD"
              slotProps={{
                textField: { size: 'small' } // TextField props của DatePicker
              }}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={12} md="auto">
          <TextField
            label="Cách tính ngày"
            size="small"
            select
            value={basis}
            onChange={(e) => setBasis(e.target.value as Basis)}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="checkIn">Theo ngày Check-in</MenuItem>
            <MenuItem value="createdAt">Theo ngày tạo Booking</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} md="auto">
          {' '}
          <Button variant="contained" onClick={handleFetch} disabled={loading || !date}>
            {loading ? 'Đang tải...' : 'Xem báo cáo'}
          </Button>
        </Grid>
      </Grid>

      {err && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {err}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Doanh thu theo ngày */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h5" align="center" gutterBottom>
                Doanh thu theo ngày
              </Typography>

              {loading && !data ? (
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 1.5 }}>
                    <Typography color="text.secondary">Tổng</Typography>
                    <Typography fontWeight={700}>{fmtVND(data?.revenue.total || 0)}</Typography>
                  </Stack>
                  <Divider sx={{ mb: 1.5 }} />
                  <Stack spacing={1}>
                    {SOURCE.map((s) => (
                      <Stack key={s.value} direction="row" justifyContent="space-between">
                        <Typography>{s.label}</Typography>
                        <Typography fontWeight={600}>
                          {fmtVND(data?.revenue.byChannel?.[s.value as keyof DailyDashboardRes['revenue']['byChannel']] || 0)}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>

                  {data?.revenue.byPaymentStatus && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Theo trạng thái thanh toán
                      </Typography>
                      <Stack spacing={0.5}>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography>Đã thanh toán (full)</Typography>
                          <Typography fontWeight={600}>{fmtVND(data.revenue.byPaymentStatus.full || 0)}</Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography>Đặt cọc (deposit)</Typography>
                          <Typography fontWeight={600}>{fmtVND(data.revenue.byPaymentStatus.deposit || 0)}</Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography>Chưa thanh toán (unpaid)</Typography>
                          <Typography fontWeight={600}>{fmtVND(data.revenue.byPaymentStatus.unpaid || 0)}</Typography>
                        </Stack>
                      </Stack>
                    </>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Tình Trạng Công Suất Phòng */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h5" align="center" gutterBottom>
                Tình Trạng Công Suất Phòng
              </Typography>

              {loading && !data ? (
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  <Box textAlign="center" mb={1}>
                    <Typography>
                      Tỷ lệ kín phòng: <b>{occupancyRatePct}%</b>
                    </Typography>
                  </Box>
                  <Box mx="auto" maxWidth={420}>
                    <Chart options={pieOptions as any} series={pieSeries} type="pie" />
                  </Box>

                  <Grid container spacing={2} mt={1}>
                    <Grid item xs={4}>
                      <Box textAlign="center" bgcolor="#fafafa" borderRadius={1} p={1.5}>
                        <Typography variant="body2" color="text.secondary">
                          Tổng phòng
                        </Typography>
                        <Typography fontWeight={700}>{data?.occupancy.totalRooms ?? 0}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box textAlign="center" bgcolor="#fafafa" borderRadius={1} p={1.5}>
                        <Typography variant="body2" color="text.secondary">
                          Đã đặt
                        </Typography>
                        <Typography fontWeight={700}>{data?.occupancy.booked ?? 0}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box textAlign="center" bgcolor="#fafafa" borderRadius={1} p={1.5}>
                        <Typography variant="body2" color="text.secondary">
                          Còn trống
                        </Typography>
                        <Typography fontWeight={700}>{data?.occupancy.available ?? 0}</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {!data && !loading && (
        <Typography variant="body2" color="text.secondary" mt={3}>
          Chọn ngày rồi bấm <b>Xem báo cáo</b> để hiển thị số liệu.
        </Typography>
      )}
    </Box>
  );
}
