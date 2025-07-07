'use client';

import { Box, Button, Grid, Menu, MenuItem, Stack, TextField, Typography } from '@mui/material';
import DeleteConfirmModal from 'components/modal/delete-modal/DeleteConfirmModal';
import { Column, CommonTable } from 'components/table/CommonTable';
import { useFormik } from 'formik';
import { Add, SearchNormal1 } from 'iconsax-react';
import React, { useCallback, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import SubcontractorModal from './SubcontractorMoldalAction';
import { fetchSubcontractors, deleteSubcontractor } from 'services/setting';

export interface SubcontractorProps {
  id: number;
  companyName: string;
  companyCode: string;
  taxCode: string;
  phoneNumber?: string;
  fax?: string;
  email?: string;
  address?: string;
  invoiceAddress?: string;
  contactUserId?: number;
  applyNotSubContract?: boolean;
  status: number; // 0: Inactive, 1: Active, 2: Deleted
}

const statusOptions = [
  { value: 1, label: 'Hoạt động' },
  { value: 0, label: 'Không hoạt động' },
  { value: 2, label: 'Bị xóa' }
];

export default function SubcontractorView() {
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState({ search: '', status: 1 });

  const [data, setData] = useState<SubcontractorProps[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [selectedRow, setSelectedRow] = useState<SubcontractorProps | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>, row: SubcontractorProps) => {
    e.preventDefault();
    setAnchorEl(e.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDeleteConfirm = async () => {
    if (selectedRow) {
      try {
        await deleteSubcontractor(selectedRow.id);
        reload();
      } catch (error) {
        console.error('Error deleting subcontractor:', error);
      }
    }
    setDeleteModal(false);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchSubcontractors({
        page: pageNum,
        size: pageSize,
        search: filters.search,
        status: filters.status
      });
      setData(res.data.content);
      setTotal(res.data.total);
    } finally {
      setLoading(false);
    }
  }, [pageNum, pageSize, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const reload = () => {
    fetchData();
  };

  const formik = useFormik({
    initialValues: { search: '', status: 1 },
    onSubmit: ({ search, status }) => {
      setPageNum(1);
      setFilters({ search, status });
    }
  });

  const getStatusDisplay = (status: number) => {
    switch (status) {
      case 0:
        return { text: 'Không hoạt động', color: 'orange' };
      case 1:
        return { text: 'Hoạt động', color: 'blue' };
      case 2:
        return { text: 'Bị xóa', color: 'gray' };
      default:
        return { text: 'Không xác định', color: 'gray' };
    }
  };

  const columns: Column<SubcontractorProps>[] = [
    {
      label: '#',
      width: 80,
      render: (row) => row.id
    },
    {
      label: <FormattedMessage id="subcontractor.name" defaultMessage="Tên cơ quan" />,
      field: 'companyName'
    },
    {
      label: <FormattedMessage id="subcontractor.code" defaultMessage="Mã cơ quan" />,
      field: 'companyCode'
    },
    {
      label: <FormattedMessage id="subcontractor.phone" defaultMessage="Số điện thoại" />,
      field: 'phoneNumber',
      render: (row) => row.phoneNumber || '-'
    },
    {
      label: <FormattedMessage id="actions" defaultMessage="Xóa" />,
      width: 80,
      render: (row) => (
        <Typography
          color="primary"
          sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          onClick={(e) => handleMenuOpen(e, row)}
        >
          Xóa ✖
        </Typography>
      )
    }
  ];


  const menuItems = [
    {
      label: 'Sửa thông tin',
      action: () => {
        setOpenModal(true);
      }
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
              <Typography fontWeight="bold">
                <FormattedMessage id="status" defaultMessage="Trạng thái" />
              </Typography>
              <TextField
                select
                name="status"
                value={formik.values.status}
                onChange={formik.handleChange}
                size="small"
                sx={{ height: 40, width: 220, '& .MuiInputBase-root': { height: 40 }, background: 'white' }}
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
              <Typography fontWeight="bold">
                <FormattedMessage id="search.subcontractor" defaultMessage="Thầu phụ" />
              </Typography>
              <TextField
                sx={{ height: 40, width: 220, '& .MuiInputBase-root': { height: 40 }, background: 'white' }}
                name="search"
                onChange={formik.handleChange}
                value={formik.values.search}
                placeholder="Nhập tên hoặc mã công ty"
                size="small"
                type="search"
              />
            </Stack>
          </Grid>
          <Grid item alignSelf="flex-end">
            <Button type="submit" variant="contained" startIcon={<SearchNormal1 />} sx={{ height: 40 }}>
              <FormattedMessage id="search" defaultMessage="Tìm kiếm" />
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
              <FormattedMessage id="subcontractor.add" defaultMessage="Thêm thầu phụ" />
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
            sx={{ color: item?.color || undefined }}
          >
            {item.label}
          </MenuItem>
        ))}
      </Menu>

      {openModal && (
        <SubcontractorModal
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