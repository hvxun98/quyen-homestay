'use client';

import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Autocomplete, Box, Button, Grid, IconButton, Menu, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { Add, SearchNormal1 } from 'iconsax-react';
import React, { useEffect, useState } from 'react';

import DeleteConfirmModal from 'components/modal/delete-modal/DeleteConfirmModal';
import { Column, CommonTable } from 'components/table/CommonTable';
import { useParams } from 'next/navigation';
import { deleteContacts, fetchContacts } from 'services/customers';
import { ContactInfoProps } from 'types/customer';
import ContactModalAction from './ContactModalAction';

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

function CustomerContactsView() {
  const { customerId } = useParams();
  const [data, setData] = useState<ContactInfoProps[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<ContactInfoProps | null>(null);
  const [modalType, setModalType] = useState<'create' | 'edit' | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteContact, setIsDeleteContact] = useState(false);
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
      const res = await fetchContacts(Number(customerId), params);
      setData(res.data.content);
      setTotalItems(res.data.total);
    } catch (err) {
      console.error('Failed to fetch contacts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData({ name: '', status: 1, page: pageNum, size: pageSize });
  }, [pageNum, pageSize, reload]);

  const handleMenuOpen = (e: React.MouseEvent<HTMLButtonElement>, row: ContactInfoProps) => {
    setAnchorEl(e.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => setAnchorEl(null);

  const handleDeleteContact = async () => {
    await deleteContacts(selectedRow?.id);
    setIsDeleteContact(false);
    setReload(!reload);
  };

  const columns: Column<ContactInfoProps>[] = [
    { label: 'Tên liên hệ', field: 'name' },
    { label: 'Email', field: 'email' },
    { label: 'Số điện thoại', field: 'phoneNumber' },
    {
      label: '',
      render: (row) => (
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
              <Typography fontWeight="bold">Trạng thái</Typography>
              <Autocomplete
                options={statusOptions}
                getOptionLabel={(opt) => opt.label}
                onChange={(_, val) => formik.setFieldValue('status', val?.value)}
                value={statusOptions.find((s) => s.value === formik.values.status) || null}
                renderInput={(params) => <TextField {...params} placeholder="Chọn trạng thái" sx={inputStyles} size="small" />}
              />
            </Stack>
          </Grid>

          <Grid item>
            <Stack spacing={1}>
              <Typography fontWeight="bold">Tên / Email</Typography>
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
              Thêm liên lạc
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
        getRowKey={(row, index) => `${row.email}-${index}`}
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
        <ContactModalAction
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

export default CustomerContactsView;
