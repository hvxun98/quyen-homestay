'use client';

import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Autocomplete, Box, Button, Grid, IconButton, Menu, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { Add, SearchNormal1 } from 'iconsax-react';
import React, { useEffect, useState } from 'react';

import FileDownloadIcon from '@mui/icons-material/FileDownload';
import DeleteConfirmModal from 'components/modal/delete-modal/DeleteConfirmModal';
import { Column, CommonTable } from 'components/table/CommonTable';
import { useParams } from 'next/navigation';
import { deleteContract, fetchContracts } from 'services/customers';
import { ContractInfoProps } from 'types/customer';
import ContractModalAction from './ContractModalAction';
import dayjs from 'dayjs';

const statusOptions = [
  { label: 'Tất cả', value: '1' },
  { label: 'Đang thực hiện', value: '2' },
  { label: 'Nghiệm thu đợt', value: '3' },
  { label: 'Thanh lý', value: '4' },
  { label: 'Thanh toán', value: '5' },
  { label: 'Bị xóa', value: '6' }
];

const inputStyles = {
  height: 40,
  width: 200,
  '& .MuiInputBase-root': { height: 40 },
  background: 'white'
};

function CustomerContractsView() {
  const { customerId } = useParams();
  const [data, setData] = useState<ContractInfoProps[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<ContractInfoProps | null>(null);
  const [modalType, setModalType] = useState<'create' | 'edit' | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteContract, setIsDeleteContract] = useState(false);
  const [reload, setReload] = useState(false);

  const formik = useFormik({
    initialValues: { code: '', status: '1' },
    onSubmit: (values) => {
      getContracts({ ...values, page: 1, size: pageSize });
      setPageNum(1);
    }
  });

  const getContracts = async (params: { code: string; status: string; page: number; size: number }) => {
    setLoading(true);
    try {
      const res = await fetchContracts(Number(customerId), params);
      setData(res.data.content);
      setTotalItems(res.data.total);
    } catch (err) {
      console.error('Failed to fetch contracts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getContracts({ code: '', status: '1', page: pageNum, size: pageSize });
  }, [pageNum, pageSize, reload]);

  const handleMenuOpen = (e: React.MouseEvent<HTMLButtonElement>, row: ContractInfoProps) => {
    setAnchorEl(e.currentTarget);
    setSelectedRow(row);
  };
  const handleMenuClose = () => setAnchorEl(null);

  const handleDeleteContract = async () => {
    await deleteContract(selectedRow?.id);
    setIsDeleteContract(false);
    setReload(!reload);
  };

  const columns: Column<ContractInfoProps>[] = [
    {
      label: 'Số hợp đồng',
      field: 'contractNo',
      render: (row) => <Typography color="primary">{row?.contractNo}</Typography>
    },
    {
      label: 'Giá trị hợp đồng (đồng)',
      field: 'contractValue',
      render: (row) => Number(row?.contractValue).toLocaleString('vi-VN')
    },
    {
      label: 'Ngày ký',
      field: 'dateSign',
      render: (row) => dayjs(row.dateSign).format('DD/MM/YYYY')
    },
    {
      label: 'Ngày thanh lý',
      field: 'dateLiquidation',
      render: (row) => dayjs(row.dateLiquidation).format('DD/MM/YYYY')
    },
    { label: 'Trạng thái', field: 'status' },
    {
      label: '',
      render: () => (
        <Button variant="text" startIcon={<FileDownloadIcon />}>
          File đính kèm
        </Button>
      )
    },
    {
      label: '',
      render: (row) => (
        <IconButton onClick={(e) => handleMenuOpen(e, row)}>
          <MoreVertIcon />
        </IconButton>
      )
    }
  ];

  const menuItems = [
    {
      label: 'Sửa hợp đồng',
      action: () => {
        setModalType('edit');
        setIsModalOpen(true);
        handleMenuClose();
      }
    },
    {
      label: 'Xóa',
      action: () => {
        setIsDeleteContract(true);
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
                onChange={(_, value) => formik.setFieldValue('status', value?.value || '1')}
                value={statusOptions.find((s) => s.value === formik.values.status) || null}
                renderInput={(params) => <TextField {...params} placeholder="Trạng thái" sx={inputStyles} size="small" />}
              />
            </Stack>
          </Grid>

          <Grid item>
            <Stack spacing={1}>
              <Typography sx={{ fontWeight: 'bold' }}>Số hợp đồng</Typography>
              <TextField
                name="code"
                onChange={formik.handleChange}
                value={formik.values.code}
                placeholder="Nhập số hợp đồng"
                sx={inputStyles}
                size="small"
              />
            </Stack>
          </Grid>

          <Grid item alignSelf="flex-end">
            <Button type="submit" variant="contained" sx={{ height: 40 }} startIcon={<SearchNormal1 />}>
              Tìm kiếm
            </Button>
          </Grid>

          <Grid item display="flex" alignItems="flex-end">
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
              Thêm hợp đồng
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
        getRowKey={(row, index) => `${row.contractNo}-${index}`}
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
        <ContractModalAction
          type={modalType}
          open={isModalOpen}
          initialData={modalType === 'edit' ? selectedRow : undefined}
          onClose={() => {
            setModalType(null);
            setIsModalOpen(false);
          }}
          reload={reload}
          setReload={setReload}
        />
      )}

      <DeleteConfirmModal open={isDeleteContract} onConfirm={handleDeleteContract} onClose={() => setIsDeleteContract(false)} />
    </Box>
  );
}

export default CustomerContractsView;
