'use client';

import { Autocomplete, Box, Button, Grid, IconButton, Menu, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { Add, SearchNormal1 } from 'iconsax-react';
import React, { useEffect, useState } from 'react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteConfirmModal from 'components/modal/delete-modal/DeleteConfirmModal';
import { Column, CommonTable } from 'components/table/CommonTable';
import { ROUTES } from 'constants/routes';
import { useRouter } from 'next/navigation';
import { deleteCustomer, fetchCustomer } from 'services/customers';
import { CustomerInfoProps } from 'types/customer';
import CustomerModalAction from './components/CustomerModalAction';

const statusOptions = [
  { label: 'Tất cả', value: 1 },
  { label: 'Bị xóa', value: 2 }
];

const inputStyles = {
  height: 40,
  width: 220,
  '& .MuiInputBase-root': { height: 40 },
  background: 'white'
};

function CustomerView() {
  const router = useRouter();
  const [data, setData] = useState<CustomerInfoProps[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<CustomerInfoProps | null>(null);
  const [modalType, setModalType] = useState<'create' | 'edit' | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [reload, setReload] = useState(false);

  const formik = useFormik({
    initialValues: { name: '', status: 1 },
    onSubmit: (values) => {
      fetchData({ ...values, page: 1, size: pageSize });
      setPageNum(1);
    }
  });

  const fetchData = async (params: { name: string; status: number; page: number; size: number }) => {
    setLoading(true);
    try {
      const res = await fetchCustomer(params);
      setData(res.data.content);
      setTotalItems(res.data.total);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData({ name: '', status: 1, page: pageNum, size: pageSize });
  }, [pageNum, pageSize, reload]);

  const handleMenuOpen = (e: React.MouseEvent<HTMLButtonElement>, row: CustomerInfoProps) => {
    setAnchorEl(e.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => setAnchorEl(null);

  const handleDeleteCustomer = async () => {
    if (selectedRow) await deleteCustomer(selectedRow.id);
    setIsDeleteOpen(false);
    setReload(!reload);
  };

  const columns: Column<CustomerInfoProps>[] = [
    { label: 'Tên khách hàng', field: 'name' },
    { label: 'Mã khách hàng', field: 'clientCode' },
    { label: 'Số điện thoại', field: 'phoneNumber' },
    {
      label: '',
      width: 120,
      render: (row) => (
        // <IconButton onClick={(e) => handleMenuOpen(e, row)}>
        //   <MoreVertIcon />
        // </IconButton>

        <Button
          variant='outlined'
          onClick={(e) => handleMenuOpen(e, row)}
        >
          <MoreVertIcon />
        </Button>
      )
    }
  ];

  const menuItems = [
    {
      label: 'Sửa khách hàng',
      action: () => {
        setModalType('edit');
        setIsModalOpen(true);
      }
    },
    { label: 'Xóa', action: () => setIsDeleteOpen(true), color: 'error.main' },
    { label: 'Liên lạc', action: () => router.push(ROUTES.CUSTOMER_CONTACTS(selectedRow?.id || 0)) },
    { label: 'Địa điểm', action: () => router.push(ROUTES.CUSTOMER_LOCATION(selectedRow?.id || 0)) },
    { label: 'Hợp đồng', action: () => router.push(ROUTES.CUSTOMER_CONTRACTS(selectedRow?.id || 0)) }
  ];
  console.log("data", data);

  return (
    <Box sx={{ pt: 2, pb: 1 }}>
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item>
            <Stack spacing={1}>
              <Typography fontWeight="bold">Trạng thái</Typography>
              <Autocomplete
                id="status"
                options={statusOptions}
                getOptionLabel={(option) => option.label || ''}
                onChange={(_, val) => formik.setFieldValue('status', val?.value)}
                value={statusOptions.find((s) => s.value === formik.values.status) || null}
                renderInput={(params) => (
                  <TextField {...params} name="status" placeholder="Chọn trạng thái" sx={inputStyles} size="small" />
                )}
              />
            </Stack>
          </Grid>

          <Grid item>
            <Stack spacing={1}>
              <Typography fontWeight="bold">Khách hàng</Typography>
              <TextField
                sx={inputStyles}
                name="name"
                onChange={formik.handleChange}
                value={formik.values.name}
                placeholder="Nhập tên hoặc mã khách hàng"
                size="small"
                type="search"
              />
            </Stack>
          </Grid>

          <Grid item alignSelf="flex-end">
            <Button sx={{ height: 40 }} startIcon={<SearchNormal1 />} variant="contained" type="submit">
              Tìm kiếm
            </Button>
          </Grid>

          <Grid item alignSelf="flex-end">
            <Button
              variant="contained"
              startIcon={<Add />}
              sx={{ height: 40, color: 'white' }}
              onClick={() => {
                setSelectedRow(null);
                setModalType('create');
                setIsModalOpen(true);
              }}
            >
              Thêm khách hàng
            </Button>
          </Grid>
        </Grid>
      </form>

      <CommonTable
        columns={columns}
        data={data}
        totalItems={totalItems}
        pageNum={pageNum}
        pageSize={pageSize}
        onPageChange={setPageNum}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPageNum(1);
        }}
        getRowKey={(row, index) => `${row.clientCode}-${index}`}
        scroll={{ y: 600 }}
        loading={loading}
      />

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        {menuItems.map((item, index) => (
          <MenuItem
            key={index}
            onClick={() => {
              item.action();
              handleMenuClose();
            }}
            sx={{ color: item?.color || undefined }}
          >
            {item.label}
          </MenuItem>
        ))}
      </Menu>

      {modalType && (
        <CustomerModalAction
          type={modalType}
          open={isModalOpen}
          initialData={modalType === 'edit' ? selectedRow : undefined}
          onClose={() => {
            setIsModalOpen(false);
            setModalType(null);
          }}
          reload={reload}
          setReload={setReload}
        />
      )}

      <DeleteConfirmModal open={isDeleteOpen} onConfirm={handleDeleteCustomer} onClose={() => setIsDeleteOpen(false)} />
    </Box>
  );
}

export default CustomerView;
