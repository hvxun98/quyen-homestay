'use client';

import { Autocomplete, Box, Button, Grid, Stack, TextField, Typography } from '@mui/material';
import DeleteConfirmModal from 'components/modal/delete-modal/DeleteConfirmModal';
import { Column, CommonTable } from 'components/table/CommonTable';
import { useFormik } from 'formik';
import { Add, SearchNormal1 } from 'iconsax-react';
import { useEffect, useState } from 'react';
import { deleteNormTable, fetchNormTables } from 'services/normtable';
import NormTableModalAction from './NormTableModalAction';

const statusOptions = [
  { label: 'Tất cả', value: 'ALL' },
  { label: 'Hoạt động', value: 'ACTIVE' },
  { label: 'Không hoạt động', value: 'INACTIVE' }
];

const inputStyles = {
  height: 40,
  width: 200,
  '& .MuiInputBase-root': { height: 40 },
  background: 'white'
};

function NormTableView() {
  const [data, setData] = useState<any[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);
  const [modalType, setModalType] = useState<'create' | 'edit' | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [reload, setReload] = useState(false);

  const formik = useFormik({
    initialValues: { name: '', status: 'ALL' },
    onSubmit: (values) => {
      fetchData({ ...values, page: 1, size: pageSize });
      setPageNum(1);
    }
  });

  const fetchData = async (params: { name: string; status: string; page: number; size: number }) => {
    setLoading(true);
    try {
      const res = await fetchNormTables(params);
      setData(res.data.content);
      setTotalItems(res.data.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData({ name: '', status: 'ALL', page: pageNum, size: pageSize });
  }, [pageNum, pageSize, reload]);

  const handleDelete = async () => {
    if (selectedRow) await deleteNormTable(selectedRow.id);
    setIsDeleteOpen(false);
    setReload(!reload);
  };

  const columns: Column<any>[] = [
    { label: 'Tên', field: 'name' },
    {
      label: '',
      render: (row) => (
        <Stack direction="row" spacing={1}>
          <Typography sx={{ cursor: 'pointer', color: 'primary.main' }} onClick={() => alert('Copy')}>
            Copy
          </Typography>
          |
          <Typography sx={{ cursor: 'pointer', color: 'primary.main' }} onClick={() => alert('Chỉ tiêu')}>
            Chỉ tiêu
          </Typography>
          |
          <Typography
            sx={{ cursor: 'pointer', color: 'error.main' }}
            onClick={() => {
              setSelectedRow(row);
              setIsDeleteOpen(true);
            }}
          >
            Xóa
          </Typography>
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
              <Typography fontWeight="bold">Trạng thái</Typography>
              <Autocomplete
                options={statusOptions}
                getOptionLabel={(opt) => opt.label}
                onChange={(_, value) => formik.setFieldValue('status', value?.value)}
                value={statusOptions.find((s) => s.value === formik.values.status) || null}
                renderInput={(params) => <TextField {...params} placeholder="Trạng thái" sx={inputStyles} size="small" />}
              />
            </Stack>
          </Grid>

          <Grid item>
            <Stack spacing={1}>
              <Typography fontWeight="bold">Tên bảng định mức</Typography>
              <TextField
                name="name"
                onChange={formik.handleChange}
                value={formik.values.name}
                placeholder="Tên bảng định mức..."
                sx={inputStyles}
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
              sx={{ height: 40, color: 'white' }}
              onClick={() => {
                setModalType('create');
                setIsModalOpen(true);
              }}
            >
              Thêm
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
        getRowKey={(row) => `${row.id}`}
        scroll={{ y: 600 }}
        loading={loading}
      />

      {modalType && (
        <NormTableModalAction
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

      <DeleteConfirmModal open={isDeleteOpen} onConfirm={handleDelete} onClose={() => setIsDeleteOpen(false)} />
    </Box>
  );
}

export default NormTableView;
