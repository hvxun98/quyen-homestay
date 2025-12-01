'use client';

import { useEffect, useMemo, useState } from 'react';
import { Box, Button, FormControl, Grid, MenuItem, Select, Stack, Typography, Chip } from '@mui/material';
import { Column, CommonTable } from 'components/table/CommonTable';
import { SearchNormal1, ExportSquare } from 'iconsax-react';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';

import { INPUT_BASER_STYLE } from 'constants/style';
import { getHouses } from 'services/houses';
import { getMonthlySummary, getMonthlyRoomRevenue } from 'services/reports';
import { listFinanceRecords } from 'services/finance';

type HouseOption = { _id: string; code: string; address?: string };
type FinanceType = 'income' | 'expense';

type RoomRevenueRow = {
  roomId: string;
  roomName: string;
  bookings: number;
  revenue: number;
};

type FinanceRecordRow = {
  _id: string;
  code: string;
  type: FinanceType;
  amount: number;
  note?: string;
  categoryId?: { name?: string; code?: string } | null;
  createdBy?: { name?: string; email?: string } | null;
  createdAt?: string;
};

const VN = new Intl.NumberFormat('vi-VN');
const money = (v: number) => `${VN.format(v || 0)} VND`;
const percent = (n: number) => `${Number.isFinite(n) ? (n * 100).toFixed(2) : '0.00'}%`;

const years = (() => {
  const y = dayjs().year();
  return [y - 1, y, y + 1, y + 2];
})();
const months = Array.from({ length: 12 }, (_, i) => i + 1);

export default function MonthlyReportPage() {
  // ===== filter =====
  const [houses, setHouses] = useState<HouseOption[]>([]);
  const [houseId, setHouseId] = useState<string>(''); // '' = toàn hệ thống
  const [year, setYear] = useState<number>(dayjs().year());
  const [month, setMonth] = useState<number>(dayjs().month() + 1);

  // ===== kpi =====
  const [summary, setSummary] = useState<any>(null);

  // ===== room revenue (client paging) =====
  const [roomFull, setRoomFull] = useState<RoomRevenueRow[]>([]);
  const [roomPage, setRoomPage] = useState(1);
  const [roomSize, setRoomSize] = useState(10);

  // ===== finance records (server paging) =====
  const [recRows, setRecRows] = useState<FinanceRecordRow[]>([]);
  const [recTotal, setRecTotal] = useState(0);
  const [recPage, setRecPage] = useState(1);
  const [recSize, setRecSize] = useState(10);

  const [loading, setLoading] = useState(false);

  const queryCommon = useMemo(() => ({ year, month, ...(houseId ? { houseId } : {}) }), [year, month, houseId]);
  const displayRevenue = summary?.totals?.revenue || 0;
  const displayExpense = summary?.totals?.expense || 0;
  const displayProfit = useMemo(() => displayRevenue - displayExpense, [displayRevenue, displayExpense]);

  // ===== columns =====
  const roomColumns: Column<RoomRevenueRow>[] = [
    { label: 'Tên phòng', field: 'roomName', width: 220 },
    { label: 'Số lượt đặt', field: 'bookings', width: 120, render: (r) => VN.format(r.bookings || 0) },
    { label: 'Doanh thu', field: 'revenue', width: 180, render: (r) => money(r.revenue) }
  ];

  const recordColumns: Column<FinanceRecordRow>[] = [
    { label: 'Mã', field: 'code', width: 120 },
    {
      label: 'Loại',
      width: 120,
      render: (r) =>
        r.type === 'expense' ? <Chip color="error" size="small" label="Chi phí" /> : <Chip color="success" size="small" label="Thu nhập" />
    },
    { label: 'Loại', width: 180, render: (r) => r.categoryId?.name || '' },
    { label: 'Số tiền', width: 160, render: (r) => money(r.amount) },
    { label: 'Ghi chú', field: 'note' },
    { label: 'Người tạo', width: 180, render: (r) => r.createdBy?.name || r.createdBy?.email || '' }
  ];

  async function fetchAll() {
    setLoading(true);
    try {
      const [sum, rooms, rec] = await Promise.all([
        getMonthlySummary(queryCommon),
        getMonthlyRoomRevenue(queryCommon),
        listFinanceRecords({ ...queryCommon, pageNum: recPage, pageSize: recSize })
      ]);

      setSummary(sum ?? null);
      setRoomFull(rooms?.items ?? rooms ?? []);

      const recItems = rec?.items ?? [];
      setRecRows(recItems);
      setRecTotal(rec?.total ?? recItems.length ?? 0);
    } finally {
      setLoading(false);
    }
  }

  // initial load
  useEffect(() => {
    (async () => {
      const res = await getHouses({ pageNum: 1, pageSize: 200 });
      setHouses(res?.items ?? []);
      await fetchAll();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // refetch when finance paging changes
  useEffect(() => {
    // chỉ refetch records khi đổi trang/size
    (async () => {
      setLoading(true);
      try {
        const rec = await listFinanceRecords({ ...queryCommon, pageNum: recPage, pageSize: recSize });
        const recItems = rec?.items ?? [];
        setRecRows(recItems);
        setRecTotal(rec?.total ?? recItems.length ?? 0);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recPage, recSize]);

  // refetch all khi đổi filter
  useEffect(() => {
    setRecPage(1);
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [houseId, year, month]);

  // client paging cho room table
  const roomPaged = useMemo(() => {
    const start = (roomPage - 1) * roomSize;
    return roomFull.slice(start, start + roomSize);
  }, [roomFull, roomPage, roomSize]);

  const selectedHouseLabel = useMemo(() => {
    const h = houses.find((x) => x._id === houseId);
    return h ? `${h.code}${h.address ? ' ' + h.address : ''}` : 'Tất cả';
  }, [houses, houseId]);

  const exportExcel = () => {
    // Tên file: Income_and_cost_<house>_Tháng <m>_<y>.xlsx
    const fileNameRaw = `Income_and_cost_${selectedHouseLabel}_Tháng ${month}_${year}.xlsx`;
    const fileName = fileNameRaw.replace(/[\\/:*?"<>|]/g, '-');

    // Sheet 1: Summary
    const s1 = [
      ['Chỉ tiêu', 'Giá trị'],
      ['Doanh thu', displayRevenue || 0],
      ['Chi phí', displayExpense || 0],
      ['Lợi nhuận', displayProfit || 0],
      ['Tiền thuê nhà', summary?.totals?.rentCost || 0],
      ['Tỷ suất lợi nhuận', percent(summary?.totals?.profitRate || 0)]
    ];

    // Sheet 2: Room Revenue
    const s2 = [['Tên phòng', 'Số lượt đặt', 'Doanh thu (VND)'], ...roomFull.map((r) => [r.roomName, r.bookings, r.revenue])];

    // Sheet 3: Income-Expense (đang hiện ở bảng phải)
    const s3 = [
      ['Mã', 'Loại', 'Loại', 'Số tiền (VND)', 'Ghi chú', 'Người tạo'],
      ...recRows.map((r) => [
        r.code,
        r.type === 'expense' ? 'Chi phí' : 'Thu nhập',
        r.categoryId?.name || '',
        r.amount,
        (r.note || '').replace(/\r?\n/g, ' '),
        r.createdBy?.name || r.createdBy?.email || ''
      ])
    ];

    const wb = XLSX.utils.book_new();
    const ws1 = XLSX.utils.aoa_to_sheet(s1);
    const ws2 = XLSX.utils.aoa_to_sheet(s2);
    const ws3 = XLSX.utils.aoa_to_sheet(s3);

    ws1['!cols'] = [{ wch: 24 }, { wch: 20 }];
    ws2['!cols'] = [{ wch: 24 }, { wch: 14 }, { wch: 20 }];
    ws3['!cols'] = [{ wch: 14 }, { wch: 10 }, { wch: 22 }, { wch: 18 }, { wch: 40 }, { wch: 22 }];

    XLSX.utils.book_append_sheet(wb, ws1, 'Summary');
    XLSX.utils.book_append_sheet(wb, ws2, 'Room Revenue');
    XLSX.utils.book_append_sheet(wb, ws3, 'Income & Cost');

    XLSX.writeFile(wb, fileName, { bookType: 'xlsx' });
  };

  return (
    <Box sx={{ pt: 2 }}>
      {/* Filters */}
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <Select
              sx={INPUT_BASER_STYLE}
              value={houseId}
              onChange={(e) => setHouseId(String(e.target.value))}
              displayEmpty
              renderValue={(val) => (val ? (houses.find((h) => h._id === val)?.code ?? '') : 'Tất cả nhà (toàn hệ thống)')}
            >
              <MenuItem value="">Tất cả nhà (toàn hệ thống)</MenuItem>
              {houses.map((h) => (
                <MenuItem key={h._id} value={h._id}>
                  {h.code}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={6} sm={3} md={2}>
          <FormControl fullWidth>
            <Select sx={INPUT_BASER_STYLE} value={year} onChange={(e) => setYear(Number(e.target.value))}>
              {years.map((y) => (
                <MenuItem key={y} value={y}>
                  {y}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={6} sm={3} md={2}>
          <FormControl fullWidth>
            <Select sx={INPUT_BASER_STYLE} value={month} onChange={(e) => setMonth(Number(e.target.value))}>
              {months.map((m) => (
                <MenuItem key={m} value={m}>
                  Tháng {m}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item>
          <Stack direction="row" gap={2} flexWrap="wrap">
            <Button variant="contained" startIcon={<SearchNormal1 />} onClick={fetchAll} disabled={loading}>
              {loading ? 'Đang tải…' : 'Tìm kiếm'}
            </Button>
            <Button variant="outlined" startIcon={<ExportSquare />} onClick={exportExcel}>
              Xuất Excel
            </Button>
          </Stack>
        </Grid>
      </Grid>

      {/* 4 KPI (không "More info") */}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={12} md={3}>
          <CardKPI title="Doanh thu" value={displayRevenue || 0} color="#1e88e5" />
        </Grid>
        <Grid item xs={12} md={3}>
          <CardKPI title="Chi phí" value={displayExpense || 0} color="#f2b01e" />
        </Grid>
        <Grid item xs={12} md={3}>
          <CardKPI title="Lợi nhuận" value={displayProfit || 0} color="#e53935" />
        </Grid>
        <Grid item xs={12} md={3}>
          <CardKPI
            title="Tỷ suất lợi nhuận/ chi phí thuê nhà"
            value={summary?.totals?.profitToRentRate || 0}
            variant="percent"
            color="#2e7d32"
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 3 }}>
        <Typography variant="h4">
          Tiền thuê nhà: <b>{money(summary?.totals?.rentCost || 0)}</b>
        </Typography>
      </Box>
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Bảng trái: Doanh thu theo phòng (CommonTable + client paging) */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
            Doanh thu theo phòng
          </Typography>
          <CommonTable<RoomRevenueRow>
            columns={roomColumns}
            data={roomPaged}
            totalItems={roomFull.length}
            pageNum={roomPage}
            pageSize={roomSize}
            onPageChange={setRoomPage}
            onPageSizeChange={(s) => {
              setRoomSize(s);
              setRoomPage(1);
            }}
            getRowKey={(r) => r.roomId}
            scroll={{ y: 540 }}
            loading={loading}
          />
        </Grid>

        {/* Bảng phải: Thu nhập - Chi phí (CommonTable + server paging) */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
            Thu nhập - Chi phí
          </Typography>
          <CommonTable<FinanceRecordRow>
            columns={recordColumns}
            data={recRows}
            totalItems={recTotal}
            pageNum={recPage}
            pageSize={recSize}
            onPageChange={setRecPage}
            onPageSizeChange={(s) => {
              setRecSize(s);
              setRecPage(1);
            }}
            getRowKey={(r) => r._id || r.code}
            scroll={{ y: 540 }}
            loading={loading}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

/* ============ Small KPI card ============ */
function CardKPI({
  title,
  value,
  variant = 'money',
  color
}: {
  title: string;
  value: number;
  variant?: 'money' | 'percent';
  color: string;
}) {
  return (
    <Box sx={{ bgcolor: color, color: '#fff', borderRadius: 2, p: 2 }}>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        {variant === 'percent' ? percent(value) : money(value)}
      </Typography>
      <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
        {title}
      </Typography>
    </Box>
  );
}
