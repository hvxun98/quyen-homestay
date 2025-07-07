'use client';
import { Fragment, useEffect } from 'react';

// material-ui
import { alpha, SxProps, useTheme } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Box, CircularProgress, MenuItem, Pagination, Select, Stack, Theme, Typography } from '@mui/material';

// third-party
import { flexRender, useReactTable, ColumnDef, HeaderGroup, getExpandedRowModel, getCoreRowModel } from '@tanstack/react-table';
import { CSVExport } from 'components/third-party/react-table';
import { LabelKeyObject } from 'react-csv/lib/core';

// project-imports
import ScrollX from 'components/ScrollX';
import MainCard from 'components/MainCard';

// assets
import { ScrollOptions } from './CommonTable';
import { isFunction } from 'lodash';
import EmptyComponent from 'components/Empty';

interface ReactTableProps {
  columns: ColumnDef<any>[];
  data: any[];
  page: number;
  pageSize: number;
  totalRows: number;
  loading?: boolean;
  pageSizeOptions?: number[];
  scroll?: ScrollOptions;
  secondary?: React.ReactNode;
  renderExpended?: (data: any) => React.ReactNode;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newPageSize: number) => void;
  onSelectedRows?: (rows: any) => void;
}

function ExpendedTable({
  columns,
  data,
  page,
  pageSize,
  totalRows,
  loading,
  pageSizeOptions = [5, 10, 25, 50],
  scroll,
  secondary,
  onPageChange,
  onPageSizeChange,
  renderExpended,
  onSelectedRows = () => {}
}: ReactTableProps) {
  const theme = useTheme();

  const table = useReactTable({
    data,
    columns,
    getRowCanExpand: () => isFunction(renderExpended),
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowId: (row) => `${row.id}`
  });

  const backColor = alpha(theme.palette.primary.lighter, 0.1);

  let headers: LabelKeyObject[] = [];
  table.getAllColumns().map(
    (columns) =>
      // @ts-ignore
      columns.columnDef.accessorKey &&
      headers.push({
        label: typeof columns.columnDef.header === 'string' ? columns.columnDef.header : '#',
        // @ts-ignore
        key: columns.columnDef.accessorKey
      })
  );
  const selectedRows = table.getSelectedRowModel().rows;
  const totalPages = Math.ceil(totalRows / pageSize);

  const tableContainerSx: SxProps<Theme> = {
    ...(scroll?.x ? { width: scroll.x, overflowX: 'auto' } : {}),
    ...(scroll?.y ? { maxHeight: scroll.y, overflowY: 'auto' } : {})
  };

  useEffect(() => {
    onSelectedRows(selectedRows);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRows]);

  return (
    <MainCard
      title="Danh sách người dùng"
      content={false}
      secondary={
        <Stack flexDirection="row" alignItems="center" gap={3}>
          {secondary}

          <CSVExport {...{ data, headers, filename: 'expanding-details.csv' }} />
        </Stack>
      }
    >
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <ScrollX>
            <TableContainer component={Paper} sx={tableContainerSx}>
              <Table>
                <TableHead>
                  {table.getHeaderGroups().map((headerGroup: HeaderGroup<any>, index) => (
                    <TableRow key={headerGroup.id + index} sx={{ '& > th:first-of-type': { width: '58px' } }}>
                      {headerGroup.headers.map((header, index) => (
                        <TableCell key={header.id + index} {...header.column.columnDef.meta}>
                          {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableHead>
                <TableBody>
                  {table.getRowModel().rows.length > 0 ? (
                    table.getRowModel().rows.map((row, index) => (
                      <Fragment key={row.id + index}>
                        <TableRow>
                          {row.getVisibleCells().map((cell, i) => (
                            <TableCell key={cell.id + i} {...cell.column.columnDef.meta}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                        {row.getIsExpanded() && isFunction(renderExpended) && (
                          <TableRow sx={{ bgcolor: backColor, '&:hover': { bgcolor: `${backColor} !important` } }}>
                            <TableCell colSpan={row.getVisibleCells().length}>{renderExpended(row.original)}</TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <EmptyComponent title="Không có dữ liệu" />
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </ScrollX>
          <Box display="flex" justifyContent="flex-end" alignItems="center" p={2}>
            <Typography>Tổng số {totalRows} bản ghi</Typography>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(event, value) => onPageChange(value)}
              siblingCount={1}
              boundaryCount={1}
              color="primary"
              variant="outlined"
              shape="rounded"
              showFirstButton
              showLastButton
              sx={{ ml: 1 }}
            />
            <Stack direction="row" alignItems="center" spacing={1} ml={1}>
              <Select value={pageSize} onChange={(event) => onPageSizeChange(Number(event.target.value))} size="small">
                {pageSizeOptions.map((size) => (
                  <MenuItem key={size} value={size}>
                    {size} / trang
                  </MenuItem>
                ))}
              </Select>
            </Stack>
          </Box>
        </>
      )}
    </MainCard>
  );
}

export default ExpendedTable;
