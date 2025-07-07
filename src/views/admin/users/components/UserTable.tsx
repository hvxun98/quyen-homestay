'use client';
import { useEffect, useMemo, useState } from 'react';

// material-ui

import Chip from '@mui/material/Chip';

// third-party
import { ColumnDef } from '@tanstack/react-table';
import { IndeterminateCheckbox } from 'components/third-party/react-table';

// project-imports
import IconButton from 'components/@extended/IconButton';
import ExpandingUserDetail from './user-detail/UserDetail';
import { getUsers } from 'services/users';

// assets
import { Add, ArrowDown2, ArrowRight2, Forbidden, MinusCirlce, Trash } from 'iconsax-react';

// types
import { UserPropsTable } from 'types/user-profile';
import { toNumber } from 'lodash';
import ExpendedTable from 'components/table/ExpendedTable';
import CustomPopover from 'components/CustomPopover';
import { Button, Stack } from '@mui/material';
import UserActionModal from './UserActionModal';

export interface UserTableSearch {
  username: string;
  phoneNumber: string;
  email: string;
  role: any;
  status: number;
}

interface UserTableProps {
  search?: UserTableSearch;
}

export default function UserTable({ search }: UserTableProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [pageSize, setPageSize] = useState<number>(10);
  const [pageNum, setPageNum] = useState<number>(1);
  const [totalRows, setTotalRows] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [reloadTable, setReloadTable] = useState<boolean>(false);

  useEffect(() => {
    const getUserList = async () => {
      try {
        setLoading(true);
        const res = await getUsers({
          roles: search?.role || undefined,
          status: toNumber(search?.status) || undefined,
          login: search?.username || undefined,
          phone: search?.phoneNumber || undefined,
          email: search?.email || undefined,
          page: pageNum,
          size: pageSize
        });
        setUsers(res.data?.content);
        setTotalRows(res.data?.total);
      } finally {
        setLoading(false);
      }

      // setUsers(data);
    };
    getUserList();
  }, [search, pageNum, pageSize, reloadTable]);

  const columns = useMemo<ColumnDef<UserPropsTable>[]>(
    () => [
      {
        id: 'select',
        enableGrouping: false,
        header: ({ table }) => (
          <IndeterminateCheckbox
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler()
            }}
          />
        ),
        cell: ({ row }) => (
          <IndeterminateCheckbox
            {...{
              checked: row.getIsSelected(),
              disabled: !row.getCanSelect(),
              indeterminate: row.getIsSomeSelected(),
              onChange: row.getToggleSelectedHandler()
            }}
          />
        )
      },
      {
        id: 'expander',
        header: () => null,
        cell: ({ row }) => {
          return row.getCanExpand() ? (
            <IconButton color={row.getIsExpanded() ? 'primary' : 'secondary'} onClick={row.getToggleExpandedHandler()} size="small">
              {row.getIsExpanded() ? <ArrowDown2 size="32" variant="Outline" /> : <ArrowRight2 size="32" variant="Outline" />}
            </IconButton>
          ) : (
            <IconButton color="secondary" size="small" disabled>
              <MinusCirlce />
            </IconButton>
          );
        }
      },
      {
        header: 'Email',
        accessorKey: 'email'
      },
      {
        header: 'Tên người dùng',
        accessorKey: 'email'
      },
      {
        header: 'Trạng thái',
        accessorKey: 'activated',
        cell: (cell) => {
          switch (cell.getValue()) {
            case false:
              return <Chip color="error" label="Ngưng hoạt động" size="small" variant="light" />;
            case true:
              return <Chip color="success" label="Đang hoạt động" size="small" variant="light" />;
            default:
              return <Chip color="info" label="Single" size="small" variant="light" />;
          }
        }
      }
    ],
    []
  );

  return (
    <ExpendedTable
      data={users}
      columns={columns}
      loading={loading}
      page={pageNum}
      pageSize={pageSize}
      totalRows={totalRows}
      secondary={
        <Stack>
          {selectedRows?.length > 0 && (
            <CustomPopover buttonText="Thao tác" buttonProps={{ endIcon: <ArrowDown2 />, color: 'success' }}>
              <Stack sx={{ p: 1 }}>
                <Button sx={{ justifyContent: 'flex-start', p: 1, width: 180 }} startIcon={<Forbidden />}>
                  Ngừng hoạt động
                </Button>
                <Button sx={{ justifyContent: 'flex-start', p: 1 }} startIcon={<Trash />}>
                  Xóa
                </Button>
              </Stack>
            </CustomPopover>
          )}
          <UserActionModal
            onFormSubmit={() => setReloadTable(!reloadTable)}
            type="create"
            buttonProps={{ variant: 'contained', startIcon: <Add />, children: 'Thêm mới' }}
          />
        </Stack>
      }
      scroll={{ y: 800 }}
      onPageChange={setPageNum}
      onPageSizeChange={setPageSize}
      onSelectedRows={setSelectedRows}
      renderExpended={(rowOriginal) => <ExpandingUserDetail data={rowOriginal} />}
    />
  );
}
