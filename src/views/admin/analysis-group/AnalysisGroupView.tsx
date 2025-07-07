'use client';

import { Box, Button, Grid, Stack, TextField, Typography, Autocomplete } from '@mui/material';
import { Add, SearchNormal1 } from 'iconsax-react';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { Column, CommonTable } from 'components/table/CommonTable';
import DeleteConfirmModal from 'components/modal/delete-modal/DeleteConfirmModal';
import AnalysisGroupModalAction from './AnalysisGroupModalAction';

const inputStyles = { width: 200, height: 40, '& .MuiInputBase-root': { height: 40 }, background: 'white' };
const labelStyles = { fontWeight: 'bold' };

const AnalysisGroupView = () => {
  const [data, setData] = useState<any[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isDeleteModal, setIsDeleteModal] = useState(false);
  const [reload, setReload] = useState(false);

  const formik = useFormik({
    initialValues: { status: 'ALL', name: '' },
    onSubmit: (values) => {
      console.log('Search:', values);
    }
  });

  const handleDelete = async () => {
    console.log('Deleting:', selectedRow);
    setIsDeleteModal(false);
    setReload(!reload);
  };

  const columns: Column<any>[] = [
    {
      label: 'Tên',
      field: 'name',
      render: (row) => <Typography color="primary">{row.name}</Typography>
    },
    { label: 'Mô tả', field: 'description' },
    {
      label: '',
      render: (row) => (
        <Button
          color="error"
          onClick={() => {
            setSelectedRow(row);
            setIsDeleteModal(true);
          }}
        >
          Xóa ✖
        </Button>
      )
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const dummyData = [
          { id: 1, name: 'Bụi các loại', description: '' },
          { id: 2, name: 'Bụi và các chất vô cơ', description: 'Phương pháp trọng lượng' }
        ];
        setData(dummyData);
        setTotalItems(dummyData.length);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [pageNum, pageSize, reload]);

  return (
    <Box sx={{ pt: 2 }}>
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
              <Typography sx={labelStyles}>Tên nhóm</Typography>
              <TextField
                name="name"
                placeholder="Tìm tên nhóm..."
                size="small"
                value={formik.values.name}
                onChange={formik.handleChange}
                sx={inputStyles}
              />
            </Stack>
          </Grid>
          <Grid item alignSelf="flex-end">
            <Button type="submit" variant="contained" sx={{ height: 40 }} startIcon={<SearchNormal1 />}>
              Tìm kiếm
            </Button>
          </Grid>
          <Grid item display="flex" alignItems="flex-end">
            <AnalysisGroupModalAction
              type="create"
              buttonProps={{ startIcon: <Add />, variant: 'contained', children: 'Thêm', sx: { height: 40 } }}
              reload={reload}
              setReload={setReload}
            />
          </Grid>
        </Grid>
      </form>

      <CommonTable
        data={data}
        columns={columns}
        totalItems={totalItems}
        pageNum={pageNum}
        pageSize={pageSize}
        onPageChange={setPageNum}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPageNum(1);
        }}
        getRowKey={(row) => row.id}
        loading={loading}
        scroll={{ y: 600 }}
      />

      <DeleteConfirmModal open={isDeleteModal} onConfirm={handleDelete} onClose={() => setIsDeleteModal(false)} />

      {selectedRow && isOpenModal && (
        <AnalysisGroupModalAction
          type="edit"
          initialData={selectedRow}
          onClose={() => setIsOpenModal(false)}
          reload={reload}
          setReload={setReload}
        />
      )}
    </Box>
  );
};

export default AnalysisGroupView;
