'use client';

import { useMemo } from 'react';

// material-ui
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Stack } from '@mui/material';

// third-party
import { flexRender, useReactTable, ColumnDef, HeaderGroup, getCoreRowModel } from '@tanstack/react-table';

// project-imports
import ScrollX from 'components/ScrollX';
import MainCard from 'components/MainCard';
import { CSVExport } from 'components/third-party/react-table';
import LinearWithLabel from 'components/@extended/progress/LinearWithLabel';

import makeData from 'data/react-table';

// types
import { TableDataProps } from 'types/table';
import { LabelKeyObject } from 'react-csv/lib/core';

interface ReactTableProps {
  columns: any;
  data: any;
  striped?: boolean;
  title?: string;
  secondary?: React.ReactNode;
}

// ==============================|| REACT TABLE ||============================== //

function ReactTable({ columns, data, striped, title, secondary }: ReactTableProps) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel()
  });

  let headers: LabelKeyObject[] = [];
  table.getAllColumns().map((columns) =>
    headers.push({
      label: typeof columns.columnDef.header === 'string' ? columns.columnDef.header : '#',
      // @ts-ignore
      key: columns.columnDef.accessorKey
    })
  );

  return (
    <MainCard
      content={false}
      title={title}
      secondary={
        <Stack flexDirection="row" alignItems="center" gap={2}>
          {secondary} <CSVExport {...{ data, headers, filename: striped ? 'striped.csv' : 'basic.csv' }} />
        </Stack>
      }
    >
      <ScrollX>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              {table.getHeaderGroups().map((headerGroup: HeaderGroup<any>) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableCell key={header.id} {...header.column.columnDef.meta}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableHead>
            <TableBody {...(striped && { className: 'striped' })}>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} {...cell.column.columnDef.meta}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </ScrollX>
    </MainCard>
  );
}

// ==============================|| REACT TABLE - BASIC ||============================== //

export default function BasicTable({ striped, title, secondary, columns, data = makeData(10) }: ReactTableProps) {
  const _columns =
    columns ||
    useMemo<ColumnDef<TableDataProps>[]>(
      () => [
        {
          header: 'First Name',
          accessorKey: 'firstName'
        },
        {
          header: 'Last Name',
          accessorKey: 'lastName'
        },
        {
          header: 'Age',
          accessorKey: 'age',
          meta: {
            className: 'cell-right'
          }
        },
        {
          header: 'Visits',
          accessorKey: 'visits',
          meta: {
            className: 'cell-right'
          }
        },
        {
          header: 'Status',
          accessorKey: 'status',
          cell: (cell) => {
            switch (cell.getValue()) {
              case 'Complicated':
                return <Chip color="error" label="Complicated" size="small" variant="light" />;
              case 'Relationship':
                return <Chip color="success" label="Relationship" size="small" variant="light" />;
              case 'Single':
              default:
                return <Chip color="info" label="Single" size="small" variant="light" />;
            }
          }
        },
        {
          header: 'Profile Progress',
          accessorKey: 'progress',
          cell: (cell) => <LinearWithLabel value={cell.getValue() as number} sx={{ minWidth: 75 }} />
        }
      ],
      []
    );

  return <ReactTable {...{ data, columns: _columns, title, striped, secondary }} />;
}
