'use client';

import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Autocomplete, Box, Button, Grid, IconButton, Menu, MenuItem, Stack, TextField, Typography } from '@mui/material';
import DeleteConfirmModal from 'components/modal/delete-modal/DeleteConfirmModal';
import { Column, CommonTable } from 'components/table/CommonTable';
import { useFormik } from 'formik';
import { Add, SearchNormal1 } from 'iconsax-react';
import { useEffect, useState } from 'react';
import { getSampleTypes } from 'services/setting';
import SampleTypeModalAction from './SampleTypeModalAction';

const inputStyles = { width: 200, height: 40, '& .MuiInputBase-root': { height: 40 }, background: 'white' };
const labelStyles = { fontWeight: 'bold' };

const SampleTypeView = () => {
  const [data, setData] = useState<any[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [reload, setReload] = useState(false);
  const [isDeleteModal, setIsDeleteModal] = useState(false);
  const formik = useFormik({
    initialValues: {
      status: 'ALL',
      name: ''
    },
    onSubmit: (values) => {
      console.log('Search:', values);
    }
  });

  const handleMenuOpen = (e: React.MouseEvent<HTMLButtonElement>, row: any) => {
    setMenuAnchorEl(e.currentTarget);
    setSelectedRow(row);
  };
  const handleMenuClose = () => setMenuAnchorEl(null);

  const columns: Column<any>[] = [
    { label: 'Tên', field: 'name' },
    { label: 'Tiền tố', field: 'prefix' },
    { label: 'Thứ tự', field: 'order' },
    { label: 'Dụng cụ lưu mặc định', field: 'defaultTool' },
    { label: 'Mô tả', field: 'description' },
    {
      label: '',
      render: (row) => (
        <IconButton onClick={(e) => handleMenuOpen(e, row)}>
          <MoreVertIcon />
        </IconButton>
      )
    }
  ];
  const getOrders = async (params: { name: string; status: number; page: number; size: number }) => {
    setLoading(true);
    try {
      const res = await getSampleTypes();
      setData(res.data);
      setTotalItems(res.data.length);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    console.log('Deleting:', selectedRow);
    setIsDeleteModal(false);
    setReload(!reload);
  };

  useEffect(() => {
    getOrders({ name: '', status: 1, page: pageNum, size: pageSize });
  }, [pageNum, pageSize, reload]);

  return (
    <Box sx={{ pt: 2, pb: 1 }}>
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item>
            <Stack spacing={1}>
              <Typography sx={labelStyles}>Trạng thái</Typography>
              <Autocomplete
                options={[{ label: 'Tất cả', value: 'ALL' }]}
                getOptionLabel={(option) => option.label}
                onChange={(_, value) => formik.setFieldValue('status', value?.value || 'ALL')}
                value={{ label: 'Tất cả', value: 'ALL' }}
                renderInput={(params) => <TextField {...params} placeholder="Trạng thái" sx={inputStyles} size="small" />}
              />
            </Stack>
          </Grid>

          <Grid item>
            <Stack spacing={1}>
              <Typography sx={labelStyles}>Tên loại mẫu</Typography>
              <TextField
                label=""
                name="name"
                size="small"
                value={formik.values.name}
                onChange={formik.handleChange}
                placeholder="Nhập tên loại mẫu"
                sx={inputStyles}
              />
            </Stack>
          </Grid>

          <Grid item alignSelf="flex-end">
            <Button variant="contained" type="submit" startIcon={<SearchNormal1 />} sx={{ height: 40 }}>
              Tìm kiếm
            </Button>
          </Grid>

          <Grid item display="flex" alignItems="flex-end">
            <SampleTypeModalAction
              type="create"
              buttonProps={{ startIcon: <Add />, variant: 'contained', children: 'Thêm', sx: { height: 40, color: 'white' } }}
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
        getRowKey={(row, index) => `${row.id}-${index}`}
        scroll={{ y: 600 }}
        loading={loading}
      />

      <Menu anchorEl={menuAnchorEl} open={!!menuAnchorEl} onClose={handleMenuClose}>
        <MenuItem
          onClick={() => {
            setIsOpenModal(true);
            handleMenuClose();
          }}
        >
          Sửa
        </MenuItem>
        <MenuItem
          sx={{ color: 'error.main' }}
          onClick={() => {
            setIsDeleteModal(true);
            handleMenuClose();
          }}
        >
          Xóa
        </MenuItem>
      </Menu>

      {selectedRow && isOpenModal && (
        <SampleTypeModalAction
          type="edit"
          initialData={selectedRow}
          onClose={() => setIsOpenModal(false)}
          reload={reload}
          setReload={setReload}
        />
      )}

      <DeleteConfirmModal open={isDeleteModal} onClose={() => setIsDeleteModal(false)} onConfirm={handleDelete} />
    </Box>
  );
};

export default SampleTypeView;
