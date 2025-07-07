'use client';

import { Box, Button, Grid, Stack, TextField, Typography } from '@mui/material';
import DeleteConfirmModal from 'components/modal/delete-modal/DeleteConfirmModal';
import { Column, CommonTable } from 'components/table/CommonTable';
import { useFormik } from 'formik';
import { Add, SearchNormal1 } from 'iconsax-react';
import { useEffect, useState } from 'react';
import QuotationModalAction from './QuotationModalAction';
import { deleteQuotation, fetchQuotations } from 'services/quotations';
import { useParams } from 'next/navigation';
import dayjs from 'dayjs';
import Link from 'next/link';
import { ROUTES } from 'constants/routes';

export default function QuotationView() {
  const [data, setData] = useState<any[]>([]);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [reload, setReload] = useState(false);
  const { orderId } = useParams();

  const formik = useFormik({
    initialValues: { name: '' },
    onSubmit: (values) => {
      fetchData({ name: values.name, page: 1, size: pageSize });
      setPageNum(1);
    }
  });

  const fetchData = async (params: { name: string; page: number; size: number }) => {
    setLoading(true);
    try {
      const res = await fetchQuotations(Number(orderId), params);
      setData(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData({ name: '', page: pageNum, size: pageSize });
  }, [pageNum, pageSize, reload]);

  const columns: Column<any>[] = [
    {
      label: 'Số báo giá',
      field: 'code',
      render: (row) => <Link href={ROUTES.QUOTATION_DETAIL(Number(orderId), row.id)}>{row.code}</Link>
    },
    { label: 'Ngày báo giá', render: (row) => dayjs(row.createdDate).format('DD/MM/YYYY') },
    {
      label: 'Hành động',
      render: (row) => (
        <Stack direction="row" spacing={1}>
          <Button
            color="error"
            onClick={() => {
              setSelectedRow(row);
              setIsDeleteOpen(true);
            }}
          >
            Xóa
          </Button>
          <Button onClick={() => console.log('In ấn', row)}>In ấn 🖨️</Button>
        </Stack>
      )
    }
  ];

  return (
    <Box sx={{ pt: 2 }}>
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item>
            <Stack spacing={1}>
              <Typography fontWeight="bold">Tìm theo số báo giá</Typography>
              <TextField
                name="name"
                placeholder="Nhập số báo giá"
                value={formik.values.name}
                onChange={formik.handleChange}
                sx={{ width: 220 }}
                size="small"
              />
            </Stack>
          </Grid>

          <Grid item alignSelf="flex-end">
            <Button type="submit" variant="contained" startIcon={<SearchNormal1 />} sx={{ height: 40 }}>
              Tìm kiếm
            </Button>
          </Grid>

          <Grid item alignSelf="flex-end">
            <Button
              variant="contained"
              startIcon={<Add />}
              sx={{ height: 40 }}
              onClick={() => {
                setSelectedRow(null);
                setIsModalOpen(true);
              }}
            >
              Thêm báo giá
            </Button>
          </Grid>
        </Grid>
      </form>

      <CommonTable
        columns={columns}
        data={data}
        totalItems={data.length}
        pageNum={pageNum}
        pageSize={pageSize}
        onPageChange={setPageNum}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPageNum(1);
        }}
        getRowKey={(row, index) => `${row.quotationNo}-${index}`}
        loading={loading}
        scroll={{ y: 500 }}
      />

      <QuotationModalAction
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={selectedRow}
        reload={reload}
        setReload={setReload}
      />

      <DeleteConfirmModal
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={async () => {
          if (selectedRow?.id) await deleteQuotation(selectedRow.id);
          setReload(!reload);
          setIsDeleteOpen(false);
        }}
      />
    </Box>
  );
}
