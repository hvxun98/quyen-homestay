'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { notifySuccess } from 'utils/notify';

import { getHouses } from 'services/houses';
import { createRoom, updateRoom } from 'services/rooms';

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void; // reload bảng
  initialData?: {
    _id?: string;
    id?: string;
    houseId?: string;
    code?: string;
    name?: string;
    type?: 'Standard' | 'VIP' | string;
  };
};

type RoomFormValues = {
  houseId: string;
  name: string;
  type: string;
};

const validationSchema = Yup.object({
  houseId: Yup.string().required('Vui lòng chọn cơ sở'),
  name: Yup.string().required('Vui lòng nhập tên phòng'),
  type: Yup.string().required('Vui lòng chọn loại phòng')
});

export default function RoomActionModal({ open, onClose, onSuccess, initialData }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [houses, setHouses] = useState<Array<{ _id: string; name?: string; code?: string }>>([]);

  const isEdit = useMemo(() => Boolean(initialData && (initialData._id || initialData.id)), [initialData]);
  const editingId = useMemo(() => String(initialData?._id || initialData?.id || ''), [initialData]);

  // load danh sách cơ sở cho dropdown
  useEffect(() => {
    (async () => {
      try {
        const res = await getHouses({ pageNum: 1, pageSize: 100 }); // lấy đủ để chọn
        // API houses trả { items, total } -> dùng items
        setHouses(res.items || []);
      } catch {
        setHouses([]);
      }
    })();
  }, []);

  const formik = useFormik<RoomFormValues>({
    enableReinitialize: true,
    initialValues: {
      houseId: initialData?.houseId ?? '',
      name: initialData?.name ?? '',
      type: initialData?.type ?? 'Standard'
    },
    validationSchema,
    onSubmit: async (values) => {
      setSubmitting(true);
      try {
        const payload = {
          houseId: values.houseId,
          name: values.name.trim(),
          type: values.type
        };

        if (isEdit && editingId) {
          await updateRoom(editingId, payload);
          notifySuccess('Cập nhật phòng thành công');
        } else {
          await createRoom(payload);
          notifySuccess('Thêm phòng thành công');
          formik.resetForm();
        }

        onClose();
        onSuccess?.();
      } finally {
        setSubmitting(false);
      }
    }
  });

  const err = (k: keyof RoomFormValues) => Boolean(formik.touched[k] && formik.errors[k]);
  const helper = (k: keyof RoomFormValues) => (formik.touched[k] && formik.errors[k] ? String(formik.errors[k]) : undefined);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md">
      <DialogTitle>{isEdit ? 'Chỉnh sửa phòng' : 'Thêm phòng'}</DialogTitle>

      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            {/* Cơ sở */}
            <Grid item xs={12}>
              <FormControl fullWidth error={err('houseId')}>
                <InputLabel>Cơ sở</InputLabel>
                <Select label="Cơ sở" name="houseId" value={formik.values.houseId} onChange={formik.handleChange}>
                  {houses.map((h) => (
                    <MenuItem key={h._id} value={h._id}>
                      {h.name || h.code || h._id}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {helper('houseId') && <div style={{ color: '#d32f2f', fontSize: 12, marginTop: 4 }}>{helper('houseId')}</div>}
            </Grid>

            {/* Tên phòng */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tên phòng"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={err('name')}
                helperText={helper('name')}
              />
            </Grid>

            {/* Loại phòng */}
            <Grid item xs={12}>
              <FormControl fullWidth error={err('type')}>
                <InputLabel>Loại phòng</InputLabel>
                <Select label="Loại phòng" name="type" value={formik.values.type} onChange={formik.handleChange}>
                  <MenuItem value="Standard">Standard</MenuItem>
                  <MenuItem value="VIP">VIP</MenuItem>
                </Select>
              </FormControl>
              {helper('type') && <div style={{ color: '#d32f2f', fontSize: 12, marginTop: 4 }}>{helper('type')}</div>}
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={submitting}>
            Đóng
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={18} /> : undefined}
          >
            {isEdit ? 'Lưu' : 'Thêm'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
