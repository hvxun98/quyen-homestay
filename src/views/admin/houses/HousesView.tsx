'use client';
import { Box, Button, FormControl, Grid, MenuItem, Select, TextField } from '@mui/material';
import { Column, CommonTable } from 'components/table/CommonTable';
import { Add, Edit, SearchNormal1, Trash } from 'iconsax-react';
import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { getBrands } from 'services/users';
import { BrandProps } from 'types/brands';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Stack } from '@mui/material';
import HouseActionModal from './HouseAction';
import DeleteConfirmModal from 'components/modal/delete-modal/DeleteConfirmModal';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

function Orders() {
  const [brands, setBrands] = useState<BrandProps[]>([]);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [openAction, setOpenAction] = useState(false);
  const [isDeleteModal, setIsDeleteModal] = useState(false);

  const validationSchema = Yup.object({
    name: Yup.string().required('Vui lòng nhập tên chi nhánh')
  });

  const formik = useFormik({
    initialValues: {
      name: '',
      description: '',
      location: '690 Lạc Long Quân',
      customerName: '',
      fromDate: dayjs('2025-07-01'),
      toDate: dayjs('2025-07-31')
    },
    validationSchema,
    onSubmit: (values) => {
      console.log(values);
    }
  });

  useEffect(() => {
    getAllBrand();
  }, []);

  const getAllBrand = async () => {
    setLoading(true);
    const res = await getBrands();
    setBrands(res.data);
    setLoading(false);
  };

  const columns: Column<any>[] = [
    { label: <FormattedMessage id="Mã" defaultMessage="Mã" />, field: 'orderId' },
    { label: <FormattedMessage id="Tên" defaultMessage="Tên" />, field: 'name' },
    { label: <FormattedMessage id="Phòng" defaultMessage="Phòng" />, field: 'room' },
    { label: <FormattedMessage id="Checkin - Checkout" defaultMessage="Checkin - Checkout" />, field: 'check-in-out' },
    { label: <FormattedMessage id="Ngày tạo" defaultMessage="Ngày tạo" />, field: 'createdDate' },
    { label: <FormattedMessage id="Giá" defaultMessage="Giá" />, field: 'price' },
    { label: <FormattedMessage id="Trạng thái" defaultMessage="Trạng thái" />, field: 'status' },
    {
      label: <FormattedMessage id="Tác vụ" defaultMessage="Tác vụ" />,
      render: () => {
        return (
          <Stack flexDirection="row" gap={1}>
            <Button color="primary" variant="contained" onClick={() => setOpenAction(true)} startIcon={<Edit />}>
              Sửa
            </Button>
            <Button color="error" variant="contained" onClick={() => setIsDeleteModal(true)} startIcon={<Trash />}>
              Huỷ
            </Button>
          </Stack>
        );
      }
    }
  ];

  const rows = [
    {
      id: 1,
      orderId: 'OD_8082',
      name: 'Hoàng Test',
      room: 'Std 501 LLQ',
      'check-in-out': '12:00 08/07/2025 - 12:00 09/07/2025',
      createdDate: '11:18 08/07/2025',
      price: '1.000.000 VND',
      status: 'Huỷ'
    },
    {
      id: 2,
      orderId: 'OD_8073',
      name: 'king- Lê Khangg',
      room: 'Std 201 LLQ',
      'check-in-out': '10:00 11/07/2025 - 16:00 11/07/2025',
      createdDate: '10:14 08/07/2025',
      price: '370.000 VND',
      status: 'Thành công'
    },
    {
      id: 3,
      orderId: 'OD_8044',
      name: 'King-Nguyễn Bảo Lâm',
      room: 'Std 501 LLQ',
      'check-in-out': '12:00 09/07/2025 - 18:00 09/07/2025',
      createdDate: '21:27 07/07/2025',
      price: '370.000 VND',
      status: 'Thành công'
    }
  ];

  return (
    <Box sx={{ pt: 2 }}>
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={2} alignItems="center">
          {/* Cơ sở */}
          <Grid item xs={12} sm={6} md={6} xl={2}>
            <FormControl fullWidth>
              <Select name="location" value={formik.values.location} onChange={formik.handleChange}>
                <MenuItem value="690 Lạc Long Quân">690 Lạc Long Quân</MenuItem>
                <MenuItem value="151 Trần Duy Hưng">151 Trần Duy Hưng</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Tên khách */}
          <Grid item xs={12} sm={6} md={6} xl={2}>
            <TextField
              fullWidth
              name="customerName"
              placeholder="Tên khách hàng"
              value={formik.values.customerName}
              onChange={formik.handleChange}
            />
          </Grid>

          {/* Từ ngày */}
          <Grid item xs={12} sm={6} md={6} xl={2}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DesktopDatePicker value={formik.values.fromDate} onChange={(val) => formik.setFieldValue('fromDate', val)} />
            </LocalizationProvider>
          </Grid>

          {/* Đến ngày */}
          <Grid item xs={12} sm={6} md={6} xl={2}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DesktopDatePicker value={formik.values.toDate} onChange={(val) => formik.setFieldValue('toDate', val)} />
            </LocalizationProvider>
          </Grid>

          {/* Nút Tìm kiếm */}
          <Grid item>
            <Stack flexDirection="row" gap={2}>
              <Button type="submit" variant="contained" startIcon={<SearchNormal1 />}>
                Tìm kiếm
              </Button>
              <Button color="primary" variant="contained" onClick={() => setOpenAction(true)} startIcon={<Add />}>
                Đặt phòng
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </form>

      <Box sx={{ py: 2 }}>
        <CommonTable
          columns={columns}
          data={rows}
          totalItems={brands?.length}
          pageNum={pageNum}
          pageSize={pageSize}
          onPageChange={setPageNum}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPageNum(1);
          }}
          getRowKey={(row, index) => `${row.id}-${index}`}
          scroll={{ y: 600 }}
          loading={loading}
        />
      </Box>

      <HouseActionModal open={openAction} onClose={() => setOpenAction(false)} />
      <DeleteConfirmModal
        title="Hủy đặt phòng"
        description="Bạn có chắc chắn muốn hủy đặt phòng không ?"
        open={isDeleteModal}
        onConfirm={() => setIsDeleteModal(false)}
        onClose={() => setIsDeleteModal(false)}
      />
    </Box>
  );
}

export default Orders;
