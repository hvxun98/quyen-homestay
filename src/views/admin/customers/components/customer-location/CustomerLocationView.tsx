'use client';

import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Autocomplete, Box, Button, Grid, IconButton, Menu, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { Add, SearchNormal1 } from 'iconsax-react';
import React, { useEffect, useState } from 'react';

import DeleteConfirmModal from 'components/modal/delete-modal/DeleteConfirmModal';
import { Column, CommonTable } from 'components/table/CommonTable';
import { useParams, useRouter } from 'next/navigation';
import { deleteContacts, fetchLocation } from 'services/customers';
import { LocationInfoProps } from 'types/customer';
import LocationModalAction from './LocationModalAction';
import { ROUTES } from 'constants/routes';

const statusOptions = [
  { label: 'Tất cả', value: 1 },
  { label: 'Bị xóa', value: 2 }
];

const inputStyles = {
  height: 40,
  width: 200,
  '& .MuiInputBase-root': { height: 40 },
  background: 'white'
};

function CustomerLocationView() {
  const router = useRouter();
  const { customerId } = useParams();

  const [data, setData] = useState<LocationInfoProps[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<LocationInfoProps | null>(null);
  const [modalType, setModalType] = useState<'create' | 'edit' | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteContact, setIsDeleteContact] = useState(false);
  const [reload, setReload] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: '',
      status: 1
    },
    onSubmit: (values) => {
      getContacts({ ...values, page: 1, size: pageSize });
      setPageNum(1);
    }
  });

  const getContacts = async (params: { name: string; status: number; page: number; size: number }) => {
    setLoading(true);
    try {
      const res = await fetchLocation(Number(customerId), params);
      setData(res.data.content);
      setTotalItems(res.data.total);
    } catch (err) {
      console.error('Failed to fetch contacts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getContacts({ name: '', status: 1, page: pageNum, size: pageSize });
  }, [pageNum, pageSize, reload]);

  const handleMenuOpen = (e: React.MouseEvent<HTMLButtonElement>, row: LocationInfoProps) => {
    setAnchorEl(e.currentTarget);
    setSelectedRow(row);
  };
  const handleMenuClose = () => setAnchorEl(null);

  const handleDeleteContact = async () => {
    await deleteContacts(selectedRow?.id);
    setIsDeleteContact(false);
    setReload(!reload);
  };

  const columns: Column<LocationInfoProps>[] = [
    { label: 'Tên địa điểm', field: 'name' },
    { label: 'Mô tả', field: 'description' },
    {
      label: 'Hành động',
      render: (row) => (
        <IconButton onClick={(e) => handleMenuOpen(e, row)}>
          <MoreVertIcon />
        </IconButton>
      )
    }
  ];

  const menuItems = [
    {
      label: 'Lịch quan trắc',
      action: () => {
        router.push(ROUTES.CUSTOMER_LOCATION_MONITORING_SCHEDULE(Number(customerId), Number(selectedRow?.id)));
      }
    },
    {
      label: 'Vị trí quan trắc',
      action: () => {
        router.push(ROUTES.CUSTOMER_LOCATION_MONITORING(Number(customerId), Number(selectedRow?.id)));
      }
    },
    {
      label: 'Sửa liên hệ',
      action: () => {
        setModalType('edit');
        setIsModalOpen(true);
        handleMenuClose();
      }
    },
    {
      label: 'Xóa',
      action: () => {
        setIsDeleteContact(true);
        handleMenuClose();
      },
      color: 'error.main'
    }
  ];

  return (
    <Box sx={{ pt: 2 }}>
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item>
            <Stack spacing={1}>
              <Typography sx={{ fontWeight: 'bold' }}>Trạng thái</Typography>
              <Autocomplete
                options={statusOptions}
                getOptionLabel={(opt) => opt.label}
                onChange={(_, value) => formik.setFieldValue('status', value?.value)}
                value={statusOptions.find((s) => s.value === formik.values.status) || null}
                renderInput={(params) => <TextField {...params} placeholder="Chọn trạng thái" sx={inputStyles} size="small" />}
              />
            </Stack>
          </Grid>

          <Grid item>
            <Stack spacing={1}>
              <Typography sx={{ fontWeight: 'bold' }}>Tên / Email</Typography>
              <TextField
                name="name"
                onChange={formik.handleChange}
                value={formik.values.name}
                placeholder="Nhập tên hoặc email"
                sx={inputStyles}
                size="small"
                type="search"
              />
            </Stack>
          </Grid>

          <Grid item alignSelf="flex-end">
            <Button type="submit" variant="contained" sx={{ height: 40 }} startIcon={<SearchNormal1 />}>
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
              Thêm địa điểm
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
        getRowKey={(row, index) => `${row.id}`}
        scroll={{ y: 600 }}
        loading={loading}
      />

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        {menuItems.map((item, index) => (
          <MenuItem key={index} onClick={item.action} sx={{ color: item?.color || undefined }}>
            {item.label}
          </MenuItem>
        ))}
      </Menu>

      {modalType && (
        <LocationModalAction
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

      <DeleteConfirmModal open={isDeleteContact} onConfirm={handleDeleteContact} onClose={() => setIsDeleteContact(false)} />
    </Box>
  );
}

export default CustomerLocationView;
