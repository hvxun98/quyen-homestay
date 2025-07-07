'use client';

import { Box, Grid, Stack, TextField, Typography, Button, Input, TableFooter, TableCell, TableRow } from '@mui/material';
import { Column, CommonTable } from 'components/table/CommonTable';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { fetchQuotationDetail } from 'services/quotations';

interface QuotationDetail {
  id: number;
  quoteCode: string;
  createdDate: string;
  vatPercent: number;
  batchDiscountPercent: number;
  managementFeePercent: number;
  total: number;
  note?: string;
  batchQuoteAnalysisServiceDtoList: {
    id: number;
    analysisServiceId: number;
    batchQuoteId: number;
    price: number;
    priceDiscount: number;
    quantity: number;
    totalPrice: number;
    unitName?: string;
    name?: string;
    sampleType?: string;
  }[];
}

export default function QuotationDetailView() {
  const params = useParams();
  const quoteId = Number(params?.quoteId);

  const [data, setData] = useState<QuotationDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    if (!quoteId) return;
    setLoading(true);
    fetchQuotationDetail(quoteId)
      .then((res: any) => setData(res.data))
      .finally(() => setLoading(false));
  }, [quoteId]);

  const handleChange = (index: number, field: keyof QuotationDetail['batchQuoteAnalysisServiceDtoList'][0], value: any) => {
    setData((prev) => {
      if (!prev) return prev;
      const newList = [...prev.batchQuoteAnalysisServiceDtoList];
      const item = { ...newList[index], [field]: Number(value) || 0 };
      item.priceDiscount = item.price * (1 - (prev.batchDiscountPercent || 0) / 100);
      item.totalPrice = item.priceDiscount * item.quantity;
      newList[index] = item;
      return { ...prev, batchQuoteAnalysisServiceDtoList: newList };
    });
  };

  const totalSum = useMemo(() => {
    return data?.batchQuoteAnalysisServiceDtoList.reduce((acc, cur) => acc + cur.totalPrice, 0) || 0;
  }, [data]);

  const columns: Column<any>[] = [
    {
      label: 'Chỉ tiêu',
      render: (row) => (
        <Stack direction="row" spacing={1} alignItems="center">
          {row.sampleType && (
            <Box
              sx={{
                bgcolor: row.sampleType.includes('Đất')
                  ? 'green'
                  : row.sampleType.includes('Nước')
                    ? 'blue'
                    : row.sampleType.includes('Khí')
                      ? 'teal'
                      : row.sampleType.includes('Thải')
                        ? 'red'
                        : 'gray',
                color: 'white',
                fontSize: 12,
                px: 1,
                borderRadius: 1
              }}
            >
              {row.sampleType}
            </Box>
          )}
          <Typography>{row.name || 'Chỉ tiêu ID ' + row.analysisServiceId}</Typography>
        </Stack>
      )
    },
    { label: 'Đơn vị', render: (row) => row.unitName || 'mẫu' },
    {
      label: 'Số lượng',
      render: (row, idx) => (
        <Input type="number" value={row.quantity} onChange={(e) => handleChange(idx, 'quantity', e.target.value)} sx={{ width: 60 }} />
      )
    },
    {
      label: 'Đơn giá (đồng)',
      render: (row, idx) => (
        <Input type="number" value={row.price} onChange={(e) => handleChange(idx, 'price', e.target.value)} sx={{ width: 100 }} />
      )
    },
    { label: 'Đơn giá đã giảm', field: 'priceDiscount' },
    { label: 'Thành tiền', field: 'totalPrice', summary: true }
  ];

  const paginatedData = useMemo(() => {
    if (!data) return [];
    const start = (pageNum - 1) * pageSize;
    return data.batchQuoteAnalysisServiceDtoList.slice(start, start + pageSize);
  }, [data, pageNum, pageSize]);

  return (
    <Box sx={{ pt: 2 }}>
      {data && (
        <>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            {data.quoteCode}
          </Typography>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={3}>
              <TextField label="Giảm giá đơn hàng %" value={data.batchDiscountPercent} fullWidth InputProps={{ readOnly: true }} />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField label="VAT %" value={data.vatPercent} fullWidth InputProps={{ readOnly: true }} />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField label="Phí quản lý %" value={data.managementFeePercent} fullWidth InputProps={{ readOnly: true }} />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Ngày báo giá"
                value={dayjs(data.createdDate).format('DD/MM/YYYY HH:mm')}
                fullWidth
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Ghi chú" fullWidth InputProps={{ readOnly: true }} />
            </Grid>
          </Grid>

          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <TextField label="Bảng giá" sx={{ width: 300 }} />
            <Button variant="contained">Áp dụng bảng giá</Button>
            <Box flexGrow={1} />
            <Button variant="contained" color="primary">
              Lưu
            </Button>
          </Stack>

          <CommonTable
            columns={columns}
            data={paginatedData}
            totalItems={data.batchQuoteAnalysisServiceDtoList?.length || 0}
            pageNum={pageNum}
            pageSize={pageSize}
            onPageChange={setPageNum}
            onPageSizeChange={setPageSize}
            getRowKey={(row, index) => `${row.id}-${index}`}
            loading={loading}
            scroll={{ y: 500 }}
            footer={
              <TableRow>
                {columns.map((_, idx) => (
                  <TableCell key={idx} align={idx === columns.length - 1 ? 'right' : 'left'}>
                    {idx === columns.length - 2 && <Typography fontWeight="bold">Tổng cộng</Typography>}
                    {idx === columns.length - 1 && (
                      <Typography fontWeight="bold" color="primary">
                        {totalSum.toLocaleString()}
                      </Typography>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            }
          />
        </>
      )}
    </Box>
  );
}
