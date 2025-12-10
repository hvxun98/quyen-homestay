'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Grid,
  IconButton,
  MenuItem,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Snackbar,
  Alert
} from '@mui/material';
import { Column, CommonTable } from 'components/table/CommonTable';
import { SearchNormal1, AddSquare, Edit2, CloseSquare, Trash } from 'iconsax-react';
import { listUsers, createUser, updateUser, deleteUser } from 'services/users';
import { getHouses } from 'services/houses';
import dayjs from 'dayjs';

type Role = 'admin' | 'staff';

type UserRow = {
  _id: string;
  name?: string;
  email: string;
  role: Role;
  houses?: { _id: string; code?: string; address?: string }[];
  createdAt?: string;
};

export default function UsersPage() {
  // filter / query
  const [q, setQ] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // data
  const [rows, setRows] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // houses for assign
  const [houses, setHouses] = useState<{ _id: string; code?: string; address?: string }[]>([]);

  // modals
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editing, setEditing] = useState<UserRow | null>(null);

  // notifications
  const [toast, setToast] = useState<{ open: boolean; severity?: 'success' | 'error' | 'info'; message?: string }>({ open: false });

  // fetch list
  async function fetchList(p = page, s = limit) {
    setLoading(true);
    try {
      const payload: any = { page: p, limit: s };
      if (q) payload.q = q;
      if (roleFilter) payload.role = roleFilter;
      const data = await listUsers(payload);
      setRows(data?.items ?? []);
      setTotal(data?.total ?? 0);
      setPage(data?.page ?? p);
      setLimit(data?.limit ?? s);
    } catch (err: any) {
      console.error(err);
      setToast({ open: true, severity: 'error', message: err?.message || 'Lỗi khi tải danh sách' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const hs = await getHouses({ pageNum: 1, pageSize: 500 });
        setHouses(hs?.items ?? []);
      } catch (e) {
        console.error(e);
      }
      await fetchList(1, limit);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // refetch when filter changes
    setPage(1);
    fetchList(1, limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, roleFilter]);

  // columns for CommonTable
  const columns: Column<UserRow>[] = [
    { label: 'Email', field: 'email', width: 260 },
    { label: 'Tên', field: 'name', width: 200 },
    {
      label: 'Vai trò',
      width: 120,
      render: (r) => (r.role === 'admin' ? <Chip size="small" label="Admin" color="primary" /> : <Chip size="small" label="Staff" />)
    },
    {
      label: 'Cơ sở quản lý',
      width: 300,
      render: (r) => (r.houses?.length ? r.houses.map((h) => h.code || h.address || h._id).join(', ') : '-')
    },
    { label: 'Tạo lúc', width: 160, render: (r) => (r.createdAt ? dayjs(r.createdAt).format('DD/MM/YYYY HH:mm') : '') },
    {
      label: 'Hành động',
      width: 120,
      render: (r) => (
        <Stack direction="row" spacing={1}>
          <IconButton
            size="small"
            onClick={() => {
              setEditing(r);
              setOpenEdit(true);
            }}
          >
            <Edit2 />
          </IconButton>
          {r.role !== 'admin' && (
            <IconButton size="small" onClick={() => handleDelete(r)}>
              <Trash />
            </IconButton>
          )}
        </Stack>
      )
    }
  ];

  // create / update handlers
  async function handleCreate(payload: { name?: string; email: string; password?: string; role: Role; houseIds?: string[] }) {
    try {
      await createUser(payload);
      setOpenCreate(false);
      setToast({ open: true, severity: 'success', message: 'Tạo user thành công' });
      fetchList(1, limit);
    } catch (e: any) {
      setToast({ open: true, severity: 'error', message: e?.message || 'Tạo thất bại' });
    }
  }

  async function handleUpdate(
    id: string,
    payload: Partial<{ name: string; email: string; password?: string; role: Role; houseIds?: string[] }>
  ) {
    try {
      await updateUser(id, payload);
      setOpenEdit(false);
      setEditing(null);
      setToast({ open: true, severity: 'success', message: 'Cập nhật user thành công' });
      fetchList(page, limit);
    } catch (e: any) {
      setToast({ open: true, severity: 'error', message: e?.message || 'Cập nhật thất bại' });
    }
  }

  async function handleDelete(row: UserRow) {
    if (!confirm(`Bạn có chắc muốn xoá user ${row.email}?`)) return;
    try {
      await deleteUser(row._id);
      setToast({ open: true, severity: 'success', message: 'Đã xoá' });
      fetchList(page, limit);
    } catch (e: any) {
      setToast({ open: true, severity: 'error', message: e?.message || 'Xoá thất bại' });
    }
  }

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Grid item xs={12} md={6}>
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              placeholder="Tìm theo email hoặc tên..."
              size="small"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              InputProps={{
                endAdornment: (
                  <IconButton size="small" onClick={() => fetchList(1, limit)}>
                    <SearchNormal1 />
                  </IconButton>
                )
              }}
              fullWidth
            />
          </Stack>
        </Grid>

        <Grid item xs={8} sm={4} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Vai trò</InputLabel>
            <Select label="Vai trò" value={roleFilter} onChange={(e) => setRoleFilter(String(e.target.value))}>
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="staff">Staff</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={4} sm={2} md={3} textAlign="right">
          <Button variant="contained" startIcon={<AddSquare />} onClick={() => setOpenCreate(true)}>
            Tạo user
          </Button>
        </Grid>
      </Grid>

      <CommonTable<UserRow>
        columns={columns}
        data={rows}
        totalItems={total}
        pageNum={page}
        pageSize={limit}
        onPageChange={(p) => {
          setPage(p);
          fetchList(p, limit);
        }}
        onPageSizeChange={(s) => {
          setLimit(s);
          setPage(1);
          fetchList(1, s);
        }}
        getRowKey={(r) => r._id}
        loading={loading}
        scroll={{ y: 560 }}
      />

      {/* Create Modal */}
      <UserModal open={openCreate} onClose={() => setOpenCreate(false)} houses={houses} title="Tạo user" onSubmit={handleCreate} />

      {/* Edit Modal */}
      <UserModal
        open={openEdit}
        onClose={() => {
          setOpenEdit(false);
          setEditing(null);
        }}
        houses={houses}
        title="Sửa user"
        initialData={editing ?? undefined}
        onSubmit={async (payload) => {
          if (!editing) return;
          await handleUpdate(editing._id, payload);
        }}
      />

      <Snackbar open={toast.open} autoHideDuration={3500} onClose={() => setToast({ open: false })}>
        <Alert severity={toast.severity ?? 'info'} onClose={() => setToast({ open: false })}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

/* ---------------- UserModal component (create / edit) ---------------- */
function UserModal({
  open,
  onClose,
  houses,
  title,
  onSubmit,
  initialData
}: {
  open: boolean;
  onClose: () => void;
  houses: { _id: string; code?: string; address?: string }[];
  title: string;
  onSubmit: (payload: { name?: string; email: string; password?: string; role: Role; houseIds?: string[] }) => Promise<void>;
  initialData?: UserRow;
}) {
  const [name, setName] = useState(initialData?.name || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>((initialData?.role as Role) ?? 'staff');
  const [selectedHouses, setSelectedHouses] = useState<string[]>(initialData?.houses?.map((h) => h._id) ?? []);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // sync when initialData changes (for edit)
  useEffect(() => {
    setName(initialData?.name ?? '');
    setEmail(initialData?.email ?? '');
    setRole((initialData?.role as Role) ?? 'staff');
    setSelectedHouses(initialData?.houses?.map((h) => h._id) ?? []);
    setPassword('');
    setError(null);
  }, [initialData, open]);

  const handleOk = async () => {
    setError(null);

    if (!email) {
      setError('Vui lòng nhập email');
      return;
    }
    if (!role) {
      setError('Vui lòng chọn vai trò');
      return;
    }
    if (role === 'staff' && (!selectedHouses || selectedHouses.length === 0)) {
      setError('Staff phải được gán ít nhất 1 house');
      return;
    }

    const payload: any = {
      name: name || undefined,
      email,
      role
    };
    if (password) payload.password = password;
    if (role === 'staff') payload.houseIds = selectedHouses;

    setSubmitting(true);
    try {
      await onSubmit(payload);
      onClose();
    } catch (e: any) {
      setError(e?.message || 'Lỗi');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Email" size="small" value={email} onChange={(e) => setEmail(e.target.value)} />
          <TextField label="Tên" size="small" value={name} onChange={(e) => setName(e.target.value)} />
          <TextField
            label="Mật khẩu"
            size="small"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            helperText={initialData ? 'Để trống nếu không đổi mật khẩu' : 'Mật khẩu tối thiểu 6 ký tự'}
          />
          <FormControl size="small">
            <InputLabel>Vai trò</InputLabel>
            <Select label="Vai trò" value={role} onChange={(e) => setRole(e.target.value as Role)}>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="staff">Staff</MenuItem>
            </Select>
          </FormControl>

          {role === 'staff' && (
            <FormControl size="small">
              <InputLabel>Cơ sở quản lý</InputLabel>
              <Select
                multiple
                value={selectedHouses}
                onChange={(e) =>
                  setSelectedHouses(
                    typeof e.target.value === 'string' ? (e.target.value as string).split(',') : (e.target.value as string[])
                  )
                }
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {(selected as string[]).map((id) => {
                      const h = houses.find((x) => x._id === id);
                      return <Chip key={id} size="small" label={h?.code ?? id} />;
                    })}
                  </Box>
                )}
              >
                {houses.map((h) => (
                  <MenuItem key={h._id} value={h._id}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="body2">{h.code}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {h.address}
                      </Typography>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} startIcon={<CloseSquare />}>
          Huỷ
        </Button>
        <Button variant="contained" onClick={handleOk} disabled={submitting} startIcon={<AddSquare />}>
          {initialData ? 'Cập nhật' : 'Tạo mới'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
