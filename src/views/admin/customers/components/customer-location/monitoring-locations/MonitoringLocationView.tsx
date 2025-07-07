'use client';

import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Autocomplete, Box, Button, Grid, IconButton, Menu, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { Add, SearchNormal1 } from 'iconsax-react';
import React, { useEffect, useState } from 'react';

import DeleteConfirmModal from 'components/modal/delete-modal/DeleteConfirmModal';
import { Column, CommonTable } from 'components/table/CommonTable';
import { ROUTES } from 'constants/routes';
import DashboardLayout from 'layout/DashboardLayout';
import { useParams } from 'next/navigation';
import { deleteMonitoringLocation, fetchMonitoringLocations } from 'services/customers';
import { MonitoringLocation } from 'types/customer';
import AuthGuard from 'utils/route-guard/AuthGuard';
import MonitoringLocationModalAction from './MonitoringLocationModalAction';

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

function MonitoringLocationView() {
  const { customerId, locationId } = useParams();

  const [data, setData] = useState<MonitoringLocation[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<MonitoringLocation | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [reload, setReload] = useState(false);

  const formik = useFormik({
    initialValues: { name: '', status: 1 },
    onSubmit: (values) => {
      getData({ ...values, page: 1, size: pageSize });
      setPageNum(1);
    }
  });

  const getData = async (params: { name: string; status: number; page: number; size: number }) => {
    setLoading(true);
    try {
      const res = await fetchMonitoringLocations(Number(locationId), params);
      setData(res.data);
      setTotalItems(res.data.total);
    } catch (err) {
      console.error('Failed to fetch monitoring locations', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData({ name: '', status: 1, page: pageNum, size: pageSize });
  }, [pageNum, pageSize, reload]);

  const handleMenuOpen = (e: React.MouseEvent<HTMLButtonElement>, row: MonitoringLocation) => {
    setAnchorEl(e.currentTarget);
    setSelectedRow(row);
  };
  const handleMenuClose = () => setAnchorEl(null);

  const handleDelete = async () => {
    await deleteMonitoringLocation(selectedRow?.id);
    setIsDelete(false);
    setReload(!reload);
  };

  const columns: Column<MonitoringLocation>[] = [
    { label: 'Tên vị trí', field: 'name' },
    { label: 'Thứ tự', field: 'order' },
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
      label: 'Sửa',
      action: () => {
        setIsEdit(true);
        handleMenuClose();
      }
    },
    {
      label: 'Xóa',
      action: () => {
        setIsDelete(true);
        handleMenuClose();
      },
      color: 'error.main'
    }
  ];

  return (
    <AuthGuard>
      <DashboardLayout backHref={ROUTES.CUSTOMER_LOCATION(Number(customerId))}>
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
                    renderOption={(props, option) => (
                      <MenuItem {...props} key={option.value}>
                        {option.label}
                      </MenuItem>
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item>
                <Stack spacing={1}>
                  <Typography sx={{ fontWeight: 'bold' }}>Tên vị trí</Typography>
                  <TextField
                    name="name"
                    onChange={formik.handleChange}
                    value={formik.values.name}
                    placeholder="Nhập tên vị trí"
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
                <MonitoringLocationModalAction
                  type="create"
                  buttonProps={{
                    children: 'Thêm vị trí',
                    variant: 'contained',
                    startIcon: <Add />,
                    sx: { height: 40 }
                  }}
                  reload={reload}
                  setReload={setReload}
                />
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

          {selectedRow && isEdit && (
            <MonitoringLocationModalAction
              type="edit"
              initialData={selectedRow}
              onClose={() => setIsEdit(false)}
              reload={reload}
              setReload={setReload}
            />
          )}

          <DeleteConfirmModal open={isDelete} onConfirm={handleDelete} onClose={() => setIsDelete(false)} />
        </Box>
      </DashboardLayout>
    </AuthGuard>
  );
}

export default MonitoringLocationView;
