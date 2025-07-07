'use client';

import { Box, Button, Grid, Stack, TextField, Typography, Chip } from '@mui/material';
import { useFormik } from 'formik';
import { SearchNormal1 } from 'iconsax-react';
import React, { useEffect, useState } from 'react';
import { Column, CommonTable } from 'components/table/CommonTable';
import { fetchScanRequests } from 'services/request';

const inputStyles = {
  height: 40,
  width: 300,
  '& .MuiInputBase-root': { height: 40 },
  background: 'white'
};

interface ScanRequestProps {
  id: string;
  requestCode: string;
  status: string;
}

function ScanRequestCodeView() {
  const [data, setData] = useState<ScanRequestProps[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: { requestCode: '' },
    onSubmit: (values) => {
      fetchData({ ...values, page: 1, size: pageSize });
      setPageNum(1);
    }
  });

  const fetchData = async (params: { requestCode: string; page: number; size: number }) => {
    setLoading(true);
    try {
      const res = await fetchScanRequests(params);
      setData(res.data.content);
      setTotalItems(res.data.total);
    } catch (error) {
      console.error('Error fetching scan requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData({ requestCode: '', page: pageNum, size: pageSize });
  }, [pageNum, pageSize]);

  const columns: Column<ScanRequestProps>[] = [
    {
      label: 'Mã yêu cầu',
      field: 'requestCode',
      width: '50%'
    },
    {
      label: 'Trạng thái',
      width: '50%',
      render: (row) => (
        <Chip
          label="Nhận mẫu"
          size="small"
          sx={{
            backgroundColor: '#e3f2fd',
            color: '#1976d2',
            fontWeight: 500
          }}
        />
      )
    }
  ];

  return (
    <Box sx={{ pt: 2, pb: 1 }}>
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item>
            <Stack spacing={1}>
              <Typography sx={{ fontWeight: 500 }}>Quét mã yêu cầu:</Typography>
              <TextField
                sx={inputStyles}
                name="requestCode"
                onChange={formik.handleChange}
                value={formik.values.requestCode}
                placeholder="Nhập mã yêu cầu"
                size="small"
                type="search"
              />
            </Stack>
          </Grid>

          <Grid item alignSelf="flex-end">
            <Button
              sx={{ height: 40 }}
              startIcon={<SearchNormal1 />}
              variant="contained"
              type="submit"
            >
              Tìm kiếm
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
        pageSizeOptions={[20, 50, 100]}
      />

      <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Lưu ý: danh sách trên chỉ hiển thị 20 yêu cầu mới nhất. Để xem danh sách đầy đủ, bạn vui lòng bấm link sau:{' '}
          <a href="#" style={{ color: '#1976d2', textDecoration: 'none' }}>
            Danh sách yêu cầu đã nhận mẫu
          </a>
        </Typography>
      </Box>
    </Box>
  );
}

export default ScanRequestCodeView;