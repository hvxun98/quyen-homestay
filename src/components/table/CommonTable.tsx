'use client';

import React, { useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Pagination,
  Select,
  MenuItem,
  Stack,
  SxProps,
  Theme,
  CircularProgress
} from '@mui/material';

export interface ScrollOptions {
  x?: number | string;
  y?: number | string;
}

export interface Column<T> {
  label: React.ReactNode;
  field?: keyof T;
  render?: (row: T, index: number) => React.ReactNode;
  width?: number | string;
  summary?: boolean;
}

export interface CommonTableProps<T> {
  columns: Column<T>[];
  data: T[];
  totalItems: number;
  pageNum: number;
  pageSize: number;
  pageSizeOptions?: number[];
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newPageSize: number) => void;
  getRowKey?: (row: T, index: number) => string | number;
  scroll?: ScrollOptions;
  loading?: boolean;
  footer?: React.ReactNode;
}

export function CommonTable<T>(props: CommonTableProps<T>) {
  const {
    columns,
    data,
    totalItems,
    pageNum,
    pageSize,
    pageSizeOptions = [5, 10, 25, 50],
    onPageChange,
    onPageSizeChange,
    getRowKey,
    scroll,
    loading,
    footer
  } = props;

  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalItems / pageSize)), [totalItems, pageSize]);

  // IMPORTANT: Don't paginate data here since it's already paginated from the server
  // Remove this:
  // const paginatedData = useMemo(() => {
  //   const start = (pageNum - 1) * pageSize;
  //   return data.slice(start, start + pageSize);
  // }, [data, pageNum, pageSize]);

  const summaryValues = useMemo(() => {
    const summary: Record<string, number> = {};
    columns.forEach((col) => {
      if (col.summary && col.field) {
        summary[col.field as string] = data.reduce((acc, cur) => acc + (Number(cur[col.field as keyof T]) || 0), 0);
      }
    });
    return summary;
  }, [columns, data]);

  const tableContainerSx: SxProps<Theme> = {
    ...(scroll?.x ? { width: scroll.x, overflowX: 'auto' } : {}),
    ...(scroll?.y ? { maxHeight: scroll.y, overflowY: 'auto' } : {})
  };

  useEffect(() => {
    if (pageNum > totalPages && totalPages > 0) {
      onPageChange(1);
    }
  }, [pageNum, pageSize, totalItems, onPageChange, totalPages]);

  return (
    <Box>
      <TableContainer component={Paper} sx={tableContainerSx}>
        <Table stickyHeader>
          <TableHead sx={{ position: 'sticky', top: 0, zIndex: 2, backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', width: 50, textAlign: 'center' }}>STT</TableCell>
              {columns.map((col, idx) => (
                <TableCell key={idx} sx={{ fontWeight: 'bold', width: col.width }}>
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1}>
                  <Box display="flex" justifyContent="center" alignItems="center" py={3} minHeight={200}>
                    <CircularProgress />
                  </Box>
                </TableCell>
              </TableRow>
            ) : data && data.length > 0 ? (
              // Use data directly instead of paginatedData
              data.map((row, rowIndex) => {
                const key = getRowKey ? getRowKey(row, rowIndex) : rowIndex.toString();
                const stt = (pageNum - 1) * pageSize + rowIndex + 1;

                return (
                  <TableRow key={key}>
                    <TableCell sx={{ textAlign: 'center' }}>{stt}</TableCell>
                    {columns.map((col, colIndex) => (
                      <TableCell key={colIndex}>
                        {col.render ? col.render(row, rowIndex) : String(row[col.field as keyof T] ?? '')}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length + 1}>
                  <Box display="flex" justifyContent="center" alignItems="center" py={3}>
                    <Typography fontStyle="italic" color="text.secondary">
                      Không có dữ liệu
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}

            {columns.some((col) => col.summary) &&
              (() => {
                const firstSummaryIndex = columns.findIndex((col) => col.summary);
                return (
                  <TableRow>
                    <TableCell />
                    {columns.map((col, idx) => {
                      if (idx === firstSummaryIndex - 1) {
                        return (
                          <TableCell key={idx} align="right">
                            <Typography fontWeight="bold">Tổng cộng</Typography>
                          </TableCell>
                        );
                      }

                      return (
                        <TableCell key={idx}>
                          {col.summary && col.field ? (
                            <Typography fontWeight="bold" color="primary">
                              {summaryValues[col.field as string]?.toLocaleString() ?? ''}
                            </Typography>
                          ) : null}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })()}
          </TableBody>
        </Table>
      </TableContainer>

      <Box display="flex" justifyContent="space-between" alignItems="center" mt={2} flexWrap="wrap" gap={1}>
        <Typography>
          Tổng số: <strong>{totalItems}</strong> bản ghi
        </Typography>

        <Stack direction="row" alignItems="center" spacing={1}>
          <Pagination
            count={totalPages}
            page={Math.min(pageNum, totalPages)}
            onChange={(_, value) => {
              if (value !== pageNum) onPageChange(value);
            }}
            siblingCount={1}
            boundaryCount={1}
            color="primary"
            variant="outlined"
            shape="rounded"
            showFirstButton
            showLastButton
          />

          <Select
            value={pageSize}
            onChange={(e) => {
              onPageSizeChange(Number(e.target.value));
            }}
            size="small"
          >
            {pageSizeOptions.map((size) => (
              <MenuItem key={size} value={size}>
                {size} / trang
              </MenuItem>
            ))}
          </Select>
        </Stack>
      </Box>
    </Box>
  );
}