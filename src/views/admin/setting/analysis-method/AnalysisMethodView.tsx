'use client';

import { Box, Button, Grid, Menu, MenuItem, Stack, TextField, Typography } from '@mui/material';
import DeleteConfirmModal from 'components/modal/delete-modal/DeleteConfirmModal';
import { Column, CommonTable } from 'components/table/CommonTable';
import { useFormik } from 'formik';
import { Add, SearchNormal1 } from 'iconsax-react';
import React, { useCallback, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { fetchAnalysisMethods, deleteAnalysisMethod } from 'services/setting';
import AnalysisMethodModal from '../analysis-method/AnalysisMethodModalAction';

export interface AnalysisMethodProps {
  id: number;
  name: string;
  description: string;
  status: number;
  environmentalAnalyst: number;
  isokineticSampling: boolean;
  rapidAirSampling: boolean;
}

const statusOptions = [
  { value: -1, label: 'Tất cả' },
  { value: 1, label: 'Hoạt động' },
  { value: 0, label: 'Không hoạt động' },
  { value: 2, label: 'Đang chờ' }
];

const statusLabels: Record<number, string> = {
  0: 'Không hoạt động',
  1: 'Hoạt động',
  2: 'Đang chờ'
};

export default function AnalysisMethodView() {
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState({ search: '', status: -1 });

  const [data, setData] = useState<AnalysisMethodProps[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [selectedRow, setSelectedRow] = useState<AnalysisMethodProps | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>, row: AnalysisMethodProps) => {
    e.preventDefault();
    setAnchorEl(e.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAnalysisMethods({
        page: pageNum,
        size: pageSize,
        search: filters.search,
        status: filters.status
      });

      setData(res.data.content || []);
      setTotal(res.data.total || 0);
    } catch (error) {
      console.error('Failed to fetch analysis methods:', error);
    } finally {
      setLoading(false);
    }
  }, [pageNum, pageSize, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const reload = () => fetchData();

  const formik = useFormik({
    initialValues: { search: '', status: -1 },
    onSubmit: ({ search, status }) => {
      setPageNum(1);
      setFilters({ search, status });
    }
  });

  const columns: Column<AnalysisMethodProps>[] = [
    { label: '#', field: 'id', width: 60 },
    { label: 'Tên phương pháp', field: 'name' },
    { label: 'Mô tả', field: 'description' },
    { label: 'Trạng thái', field: 'status', render: (row) => statusLabels[row.status] || 'Không rõ' },
    { label: 'Chuyên viên', field: 'environmentalAnalyst' },
    {
      label: 'Lấy mẫu nhanh',
      field: 'rapidAirSampling',
      render: (row) => row.rapidAirSampling ? '✔️' : ''
    },
    {
      label: 'Lấy mẫu đẳng động học',
      field: 'isokineticSampling',
      render: (row) => row.isokineticSampling ? '✔️' : ''
    },
    {
      label: '',
      width: 100,
      render: (row) => (
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Typography color="primary" sx={{ cursor: 'pointer' }} onClick={(e) => handleMenuOpen(e, row)}>
            Hành động
          </Typography>
        </Stack>
      )
    }
  ];

  const handleDeleteConfirm = async () => {
    if (selectedRow) {
      try {
        await deleteAnalysisMethod(selectedRow.id);
        reload();
      } catch (error) {
        console.error('Error deleting method:', error);
      }
    }
    setDeleteModal(false);
  };

  const menuItems = [
    {
      label: 'Sửa thông tin',
      action: () => setOpenModal(true)
    },
    {
      label: 'Xóa',
      action: () => setDeleteModal(true),
      color: 'error.main'
    }
  ];

  return (
    <Box sx={{ pt: 2, pb: 1 }}>
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item>
            <Stack spacing={1}>
              <Typography fontWeight="bold">Trạng thái</Typography>
              <TextField
                select
                name="status"
                value={formik.values.status}
                onChange={formik.handleChange}
                size="small"
                sx={{ width: 220, '& .MuiInputBase-root': { height: 40 }, background: 'white' }}
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          </Grid>
          <Grid item>
            <Stack spacing={1}>
              <Typography fontWeight="bold">Tìm kiếm</Typography>
              <TextField
                name="search"
                value={formik.values.search}
                onChange={formik.handleChange}
                placeholder="Tên phương pháp..."
                size="small"
                sx={{ width: 220, '& .MuiInputBase-root': { height: 40 }, background: 'white' }}
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
                setSelectedRow(null);
                setOpenModal(true);
              }}
            >
              Thêm phương pháp
            </Button>
          </Grid>
        </Grid>
      </form>

      <CommonTable
        columns={columns}
        data={data}
        totalItems={total}
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

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        {menuItems.map((item, index) => (
          <MenuItem
            key={index}
            onClick={() => {
              item.action();
              handleMenuClose();
            }}
            sx={{ color: item.color || undefined }}
          >
            {item.label}
          </MenuItem>
        ))}
      </Menu>

      {openModal && (
        <AnalysisMethodModal
          type={selectedRow ? 'edit' : 'create'}
          open={openModal}
          initialData={selectedRow}
          onClose={() => {
            setOpenModal(false);
            setSelectedRow(null);
          }}
          onSuccess={() => {
            reload();
            setOpenModal(false);
            setSelectedRow(null);
          }}
        />
      )}

      <DeleteConfirmModal
        open={deleteModal}
        onConfirm={handleDeleteConfirm}
        onClose={() => {
          setDeleteModal(false);
        }}
      />
    </Box>
  );
}
