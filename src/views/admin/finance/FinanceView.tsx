'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, FormControl, Grid, MenuItem, Select, Stack, Typography, Chip } from '@mui/material';
import { Column, CommonTable } from 'components/table/CommonTable';
import { Add, Edit, SearchNormal1, Trash, ExportSquare } from 'iconsax-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import dayjs from 'dayjs';
import { INPUT_BASER_STYLE } from 'constants/style';
import DeleteConfirmModal from 'components/modal/delete-modal/DeleteConfirmModal';
import { notifySuccess } from 'utils/notify';

import { getHouses } from 'services/houses'; // bạn đã có sẵn service này
import { listFinanceRecords, deleteFinanceRecord, type FinanceType } from 'services/finance';
import FinanceActionModal from './FinanceActionModal';
import FinanceCategoryModal from './FInanceCategoryModal';
import * as XLSX from 'xlsx';

type HouseOption = { _id: string; code: string; address?: string };
type FileAsset = { _id: string; url: string };

type FinanceRecord = {
  _id: string;
  code: string;
  type: FinanceType;
  houseId: string;
  year: number;
  month: number;
  amount: number;
  note?: string;
  attachments?: FileAsset[];
  createdBy?: { name?: string };
  categoryId?: string | null;
};

const VN = new Intl.NumberFormat('vi-VN');
const money = (v: number) => `${VN.format(v)} VND`;
const years = (() => {
  const y = dayjs().year();
  return [y - 1, y, y + 1, y + 2];
})();
const months = Array.from({ length: 12 }, (_, i) => i + 1);

/* --------------------- Page chính --------------------- */
export default function FinanceView() {
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<FinanceRecord[]>([]);
  const [total, setTotal] = useState(0);

  const [houses, setHouses] = useState<HouseOption[]>([]);
  const [housesLoading, setHousesLoading] = useState(false);

  const [isDeleteModal, setIsDeleteModal] = useState(false);
  const [editing, setEditing] = useState<FinanceRecord | undefined>(undefined);
  const [openIncome, setOpenIncome] = useState(false);
  const [openExpense, setOpenExpense] = useState(false);
  const [openCatModal, setOpenCatModal] = useState(false);
  const [refreshCatTick, setRefreshCatTick] = useState(0);

  const formik = useFormik({
    initialValues: {
      houseId: '',
      year: dayjs().year(),
      month: dayjs().month() + 1
    },
    validationSchema: Yup.object({
      houseId: Yup.string().required('Chọn nhà')
    }),
    onSubmit: () => {
      setPageNum(1);
      fetchList(1, pageSize);
    }
  });

  // houses
  useEffect(() => {
    (async () => {
      try {
        setHousesLoading(true);
        const res = await getHouses({ pageNum: 1, pageSize: 100 });
        const items: HouseOption[] = (res?.items ?? []).map((h: any) => ({
          _id: String(h._id),
          code: h.code,
          address: h.address
        }));
        setHouses(items);
        if (!formik.values.houseId && items[0]?._id) {
          formik.setFieldValue('houseId', items[0]._id, false);
          await fetchList(1, pageSize, items[0]._id);
        }
      } finally {
        setHousesLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchList(p = pageNum, size = pageSize, houseIdOverride?: string) {
    if (!(houseIdOverride ?? formik.values.houseId)) return;
    try {
      setLoading(true);
      const res = await listFinanceRecords({
        houseId: houseIdOverride ?? formik.values.houseId,
        year: Number(formik.values.year),
        month: Number(formik.values.month),
        pageNum: p,
        pageSize: size
      });
      setRows(res?.items ?? []);
      setTotal(res?.pagination?.total ?? (Array.isArray(res?.items) ? res.items.length : 0));
    } finally {
      setLoading(false);
    }
  }

  const selectedHouseLabel = useMemo(() => {
    const found = houses.find((h) => h._id === formik.values.houseId);
    return found?.code ?? '';
  }, [houses, formik.values.houseId]);

  const columns: Column<FinanceRecord>[] = [
    { label: 'Mã', field: 'code', width: 120 },
    {
      label: 'Loại',
      render: (r) =>
        r.type === 'expense' ? <Chip color="error" size="small" label="Chi phí" /> : <Chip color="success" size="small" label="Thu nhập" />,
      width: 120
    },
    { label: 'Số tiền', render: (r) => money(r.amount), width: 160 },
    { label: 'Ghi chú', field: 'note' },
    { label: 'Người tạo', render: (r) => r.createdBy?.name ?? '', width: 160 },
    {
      label: 'Bill chuyển khoản',
      render: (r) =>
        r.attachments?.length ? (
          <a href={r.attachments[0].url} target="_blank" rel="noreferrer">
            <img src={r.attachments[0].url} alt="bill" style={{ width: 24, height: 24, objectFit: 'cover' }} />
          </a>
        ) : (
          <Typography variant="body2" color="text.secondary">
            —
          </Typography>
        ),
      width: 150
    },
    {
      label: 'Tác vụ',
      render: (r) => (
        <Stack direction="row" gap={1}>
          <Button size="small" variant="contained" startIcon={<Edit />} onClick={() => setEditing(r)}>
            Sửa
          </Button>
          <Button
            size="small"
            color="error"
            variant="contained"
            startIcon={<Trash />}
            onClick={() => {
              setEditing(r);
              setIsDeleteModal(true);
            }}
          >
            Xoá
          </Button>
        </Stack>
      ),
      width: 200
    }
  ];

  const handleDelete = async () => {
    if (!editing?._id) return;
    await deleteFinanceRecord(editing._id);
    setIsDeleteModal(false);
    setEditing(undefined);
    notifySuccess('Đã xoá bản ghi');
    fetchList(1, pageSize);
  };

  const exportExcel = () => {
    // Lấy nhà đang chọn để ghép tên file
    const h = houses.find((x) => x._id === formik.values.houseId);
    const houseLabel = h ? `${h.code}-${h.address ? ' ' + h.address : ''}` : '';
    const fileNameRaw = `Income_and_cost_${houseLabel}_Tháng ${formik.values.month}_${formik.values.year}.xlsx`;
    const fileName = fileNameRaw.replace(/[\\/:*?"<>|]/g, '-'); // tránh ký tự cấm trên Windows

    // Chuẩn bị dữ liệu
    const header = ['STT', 'Mã', 'Loại', 'Số tiền (VND)', 'Ghi chú', 'Người tạo'];
    const data = rows.map((r, i) => [
      (pageNum - 1) * pageSize + i + 1,
      r.code,
      r.type === 'expense' ? 'Chi phí' : 'Thu nhập',
      r.amount,
      (r.note ?? '').replace(/\r?\n/g, ' '),
      r.createdBy?.name ?? ''
    ]);

    // Tạo workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([header, ...data]);

    // Format cột (độ rộng + định dạng tiền tệ cơ bản)
    ws['!cols'] = [
      { wch: 6 }, // STT
      { wch: 16 }, // Mã
      { wch: 12 }, // Loại
      { wch: 18 }, // Số tiền
      { wch: 40 }, // Ghi chú
      { wch: 20 } // Người tạo
    ];

    // Ghi file
    XLSX.utils.book_append_sheet(wb, ws, 'Income & Cost');
    XLSX.writeFile(wb, fileName, { bookType: 'xlsx' });
  };

  return (
    <Box sx={{ pt: 2 }}>
      {/* Filter */}
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <Select
                sx={INPUT_BASER_STYLE}
                name="houseId"
                value={formik.values.houseId}
                onChange={(e) => {
                  formik.handleChange(e);
                  setPageNum(1);
                  fetchList(1, pageSize, String(e.target.value));
                }}
                disabled={housesLoading || houses.length === 0}
                displayEmpty
              >
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
              <Select
                sx={INPUT_BASER_STYLE}
                value={formik.values.year}
                onChange={(e) => formik.setFieldValue('year', Number(e.target.value))}
              >
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
              <Select
                sx={INPUT_BASER_STYLE}
                value={formik.values.month}
                onChange={(e) => formik.setFieldValue('month', Number(e.target.value))}
              >
                {months.map((m) => (
                  <MenuItem key={m} value={m}>
                    Tháng {m}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item>
            <Stack direction="row" gap={2} flexWrap={'wrap'}>
              <Button type="submit" variant="contained" startIcon={<SearchNormal1 />}>
                Tìm kiếm
              </Button>
              <Button
                color="error"
                variant="contained"
                startIcon={<Add />}
                disabled={!formik.values.houseId}
                onClick={() => {
                  setEditing(undefined);
                  setOpenExpense(true);
                }}
              >
                Tạo chi phí
              </Button>
              <Button
                color="primary"
                variant="contained"
                startIcon={<Add />}
                disabled={!formik.values.houseId}
                onClick={() => {
                  setEditing(undefined);
                  setOpenIncome(true);
                }}
              >
                Tạo thu nhập
              </Button>
              <Button variant="outlined" onClick={() => setOpenCatModal(true)} disabled={!formik.values.houseId && houses.length === 0}>
                Tạo loại chi phí
              </Button>

              <Button variant="outlined" startIcon={<ExportSquare />} onClick={exportExcel}>
                Xuất Excel
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </form>

      {/* Table */}
      <Box sx={{ py: 2 }}>
        <CommonTable
          columns={columns}
          data={rows}
          totalItems={total}
          pageNum={pageNum}
          pageSize={pageSize}
          onPageChange={(p) => {
            setPageNum(p);
            fetchList(p, pageSize);
          }}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPageNum(1);
            fetchList(1, size);
          }}
          getRowKey={(row) => row._id}
          scroll={{ y: 600 }}
          loading={loading}
        />
      </Box>

      {openExpense && (
        <FinanceActionModal
          open={openExpense}
          type="expense"
          houses={houses}
          initialHouseId={formik.values.houseId}
          onClose={() => setOpenExpense(false)}
          onSuccess={() => {
            setOpenExpense(false);
            fetchList(1, pageSize);
          }}
          refreshKey={refreshCatTick}
        />
      )}

      {openIncome && (
        <FinanceActionModal
          open={openIncome}
          type="income"
          houses={houses}
          initialHouseId={formik.values.houseId}
          onClose={() => setOpenIncome(false)}
          onSuccess={() => {
            setOpenIncome(false);
            fetchList(1, pageSize);
          }}
        />
      )}

      {editing && !openIncome && !openExpense && (
        <FinanceActionModal
          open={!!editing}
          type={editing.type}
          houses={houses}
          initialHouseId={editing.houseId}
          initial={editing}
          onClose={() => setEditing(undefined)}
          onSuccess={() => {
            setEditing(undefined);
            fetchList(1, pageSize);
          }}
          refreshKey={refreshCatTick}
        />
      )}

      <FinanceCategoryModal open={openCatModal} onClose={() => setOpenCatModal(false)} onCreated={() => setRefreshCatTick((s) => s + 1)} />

      {/* Confirm delete */}
      <DeleteConfirmModal
        title="Xoá bản ghi"
        description={`Xoá ${editing?.code} tại ${selectedHouseLabel}?`}
        open={isDeleteModal}
        confirmText="Đồng ý"
        onConfirm={handleDelete}
        onClose={() => setIsDeleteModal(false)}
      />
    </Box>
  );
}
