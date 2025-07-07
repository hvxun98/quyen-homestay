'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Checkbox,
  MenuItem,
  Stack,
  TextField,
  Typography,
  Grid,
  Link
} from '@mui/material';
import { SearchNormal1 } from 'iconsax-react';
import { FileCopy, Clear } from '@mui/icons-material';
import { useFormik } from 'formik';
import { FormattedMessage } from 'react-intl';
import { CommonTable, Column } from 'components/table/CommonTable';
import { fetchAnalysisRequest } from 'services/request';

const STATUS = {
  DELETED: 0,
  BEFORE_SAMPLING: 1,
  SAMPLING: 2,
  RECEIPT_SAMPLING: 3,
  MOVE_TO_REPORT: 4,
  WAIT_APPROVE: 5,
  NO_APPROVE: 6,
  APPROVE: 7,
  RESULT_DELIVERY: 8,
  ARCHIVE: 9,
  CANCEL: 10
};

interface AnalysisRequest {
  id: number;
  code: string;
  clientId: number;
  clientName: string;
  clientLocationId: number;
  clientLocationName: string;
  status: number;
}

const statusOptions = [
  { value: 'all', label: 'Tất cả' },
  { value: STATUS.BEFORE_SAMPLING, label: 'Đợi lấy mẫu', color: '#FF9800' },
  { value: STATUS.SAMPLING, label: 'Lấy mẫu', color: '#2196F3' },
  { value: STATUS.RECEIPT_SAMPLING, label: 'Nhận mẫu', color: '#9C27B0' },
  { value: STATUS.MOVE_TO_REPORT, label: 'Đưa vào biên bản TN', color: '#795548' },
  { value: STATUS.WAIT_APPROVE, label: 'Đợi duyệt', color: '#3F51B5' },
  { value: STATUS.NO_APPROVE, label: 'Không duyệt', color: '#F44336' },
  { value: STATUS.APPROVE, label: 'Duyệt', color: '#4CAF50' },
  { value: STATUS.RESULT_DELIVERY, label: 'Đã trả kết quả', color: '#009688' },
  { value: STATUS.ARCHIVE, label: 'Lưu mẫu', color: '#607D8B' },
  { value: STATUS.CANCEL, label: 'Hủy mẫu', color: '#E91E63' },
  { value: STATUS.DELETED, label: 'Bị xóa', color: '#9E9E9E' }
];

export default function AnalysisRequests() {
  const [data, setData] = useState<AnalysisRequest[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [reload, setReload] = useState(false);

  const formik = useFormik({
    initialValues: { status: 'all' as string | number, search: '' },
    onSubmit: (values) => {
      fetchData({ ...values, page: 1, size: pageSize });
      setPageNum(1);
    }
  });

  const fetchData = async (params: {
    search: string; page: number; size: number
  }) => {
    setLoading(true);
    try {
      const res = await fetchAnalysisRequest(params);
      setData(res.data.content);
      setTotalItems(res.data.total);
    } catch (error) {
      console.error('Error fetching analysis requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData({
      // status: 'all',
      search: '', page: pageNum, size: pageSize
    });
  }, [pageNum, pageSize, reload]);

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedRows(data.map(row => row.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id: number) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const getStatusOption = (status: number | string) => {
    return statusOptions.find(option => option.value === status);
  };

  const getStatusDisplay = (status: number) => {
    const option = statusOptions.find(opt => opt.value === status);
    if (!option || option.value === 'all') return null;

    return (
      <Typography
        component="span"
        sx={{
          color: option.color,
          fontWeight: 500
        }}
      >
        {option.label}
      </Typography>
    );
  };

  const columns: Column<AnalysisRequest>[] = [
    {
      label: (
        <Checkbox
          checked={selectedRows.length === data.length && data.length > 0}
          indeterminate={selectedRows.length > 0 && selectedRows.length < data.length}
          onChange={handleSelectAll}
        />
      ),
      width: 50,
      render: (row) => (
        <Checkbox
          checked={selectedRows.includes(row.id)}
          onChange={() => handleSelectRow(row.id)}
        />
      )
    },
    {
      label: <FormattedMessage id="id" defaultMessage="#" />,
      field: 'id',
      width: 80
    },
    {
      label: <FormattedMessage id="request.code" defaultMessage="Mã yêu cầu" />,
      width: 150,
      render: (row) => (
        <Link href="#" underline="hover" color="primary">
          {row.code || '-'}
        </Link>
      )
    },
    {
      label: <FormattedMessage id="client" defaultMessage="Khách hàng" />,
      field: 'clientName'
    },
    {
      label: <FormattedMessage id="sampling.location" defaultMessage="Vị trí lấy mẫu" />,
      field: 'clientLocationName'
    },
    {
      label: <FormattedMessage id="status" defaultMessage="Trạng thái" />,
      width: 150,
      render: (row) => getStatusDisplay(row.status)
    },
    {
      label: '',
      width: 120,
      render: (row) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <Link
            href="#"
            underline="hover"
            sx={{
              display: 'flex',
              alignItems: 'center',
              color: 'primary.main'
            }}
          >
            Copy <FileCopy sx={{ ml: 0.5, fontSize: 16 }} />
          </Link>
          <Typography sx={{ mx: 0.5 }}>|</Typography>
          <Link
            href="#"
            underline="hover"
            sx={{
              display: 'flex',
              alignItems: 'center',
              color: 'primary.main'
            }}
          >
            Xóa <Clear sx={{ ml: 0.5, fontSize: 16 }} />
          </Link>
        </Stack>
      )
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
                sx={{
                  height: 40,
                  width: 220,
                  '& .MuiInputBase-root': {
                    height: 40,
                    color: getStatusOption(formik.values.status)?.color || 'inherit'
                  },
                  background: 'white'
                }}
              >
                {statusOptions.map((option) => (
                  <MenuItem
                    key={option.value}
                    value={option.value}
                    sx={{
                      color: option.color || 'inherit',
                      '&:hover': {
                        backgroundColor: option.color ? `${option.color}15` : 'action.hover'
                      }
                    }}
                  >
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          </Grid>
          <Grid item>
            <Stack spacing={1}>
              <Typography fontWeight="bold">
                <FormattedMessage id="search" defaultMessage="Từ khóa tìm kiếm" />
              </Typography>
              <TextField
                sx={{ height: 40, width: 300, '& .MuiInputBase-root': { height: 40 }, background: 'white' }}
                name="search"
                onChange={formik.handleChange}
                value={formik.values.search}
                placeholder="Từ khóa tìm kiếm..."
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
        getRowKey={(row) => row.id}
        scroll={{ y: 600 }}
        loading={loading}
      />

      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
        <Button variant="contained" sx={{ backgroundColor: '#2196F3' }}>
          Lấy mẫu
        </Button>
        <Button variant="contained" sx={{ backgroundColor: '#9C27B0' }}>
          Nhận mẫu
        </Button>
        <Button variant="contained" sx={{ backgroundColor: '#4CAF50' }}>
          Trả kết quả
        </Button>
      </Stack>
    </Box>
  );
}