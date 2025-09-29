'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, TextField, CircularProgress } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { notifySuccess } from 'utils/notify';
import { createHouse, updateHouse } from 'services/houses';
import { toVND } from 'utils/format';

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void; // gọi sau khi tạo/sửa thành công để refresh list
  initialData?: {
    _id?: string;
    id?: string; // id nhà (1 trong 2)
    code?: string;
    address?: string;
    numOfFloors?: number | string;
    numOfRooms?: number | string;
    price?: number | string;
  };
};

type HouseFormValues = {
  code: string;
  address: string;
  numOfFloors: string; // giữ string để dễ nhập
  numOfRooms: string;
  price: string; // giữ dạng số thô '1000000' (input hiển thị dạng VNĐ)
};

const validationSchema = Yup.object({
  code: Yup.string().required('Vui lòng nhập mã'),
  address: Yup.string().required('Vui lòng nhập địa chỉ'),
  numOfFloors: Yup.number().typeError('Phải là số').min(0).required('Vui lòng nhập số tầng'),
  numOfRooms: Yup.number().typeError('Phải là số').min(0).required('Vui lòng nhập số phòng'),
  price: Yup.number().typeError('Phải là số').min(0).required('Vui lòng nhập giá thuê')
});

// helpers format/parse VNĐ
const onlyDigits = (s: string) => s.replace(/\D/g, '');

export default function HouseActionModal({ open, onClose, onSuccess, initialData }: Props) {
  const [submitting, setSubmitting] = useState(false);

  const isEdit = useMemo(() => Boolean(initialData && (initialData._id || initialData.id)), [initialData]);
  const editingId = useMemo(() => String(initialData?._id || initialData?.id || ''), [initialData]);

  const formik = useFormik<HouseFormValues>({
    enableReinitialize: true,
    initialValues: {
      code: initialData?.code ?? '',
      address: initialData?.address ?? '',
      numOfFloors: initialData?.numOfFloors != null ? String(initialData.numOfFloors) : '',
      numOfRooms: initialData?.numOfRooms != null ? String(initialData.numOfRooms) : '',
      price: initialData?.price != null ? String(initialData.price) : ''
    },
    validationSchema,
    onSubmit: async (values) => {
      setSubmitting(true);
      try {
        const payload = {
          code: values.code.trim(),
          address: values.address.trim(),
          numOfFloors: Number(values.numOfFloors),
          numOfRooms: Number(values.numOfRooms),
          price: Number(values.price)
        };

        if (isEdit && editingId) {
          await updateHouse(editingId, payload);
          notifySuccess('Cập nhật nhà thành công');
        } else {
          await createHouse(payload);
          notifySuccess('Thêm nhà thành công');
          // reset form sau khi tạo mới
          formik.resetForm();
        }

        onClose();
        onSuccess?.(); // refresh bảng
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        // lỗi đã được interceptor hiển thị notifyError
      } finally {
        setSubmitting(false);
      }
    }
  });

  // Khi đóng modal trong lúc đang sửa -> không giữ lại định dạng giá
  useEffect(() => {
    if (!open && !isEdit) {
      formik.resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const err = (k: keyof HouseFormValues) => Boolean(formik.touched[k] && formik.errors[k]);
  const helper = (k: keyof HouseFormValues) => (formik.touched[k] && formik.errors[k] ? String(formik.errors[k]) : undefined);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm">
      <DialogTitle>{isEdit ? 'Chỉnh sửa nhà' : 'Thêm nhà'}</DialogTitle>

      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            {/* Mã */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tên"
                name="code"
                value={formik.values.code}
                onChange={formik.handleChange}
                error={err('code')}
                helperText={helper('code')}
              />
            </Grid>

            {/* Địa chỉ */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Địa chỉ"
                name="address"
                value={formik.values.address}
                onChange={formik.handleChange}
                error={err('address')}
                helperText={helper('address')}
              />
            </Grid>

            {/* Số tầng */}
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="number"
                label="Số tầng"
                name="numOfFloors"
                value={formik.values.numOfFloors}
                onChange={formik.handleChange}
                error={err('numOfFloors')}
                helperText={helper('numOfFloors')}
                inputProps={{ min: 0 }}
              />
            </Grid>

            {/* Số phòng */}
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="number"
                label="Số phòng"
                name="numOfRooms"
                value={formik.values.numOfRooms}
                onChange={formik.handleChange}
                error={err('numOfRooms')}
                helperText={helper('numOfRooms')}
                inputProps={{ min: 0 }}
              />
            </Grid>

            {/* Giá thuê (VNĐ) – input format */}
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Giá thuê (VND)"
                name="price"
                value={formik.values.price ? toVND(formik.values.price) : ''} // hiển thị 1.000.000
                onChange={(e) => {
                  const raw = onlyDigits(e.target.value);
                  formik.setFieldValue('price', raw);
                  if (!formik.touched.price) formik.setFieldTouched('price', true, false);
                }}
                error={err('price')}
                helperText={helper('price')}
                inputMode="numeric"
              />
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
