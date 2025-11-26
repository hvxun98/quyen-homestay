'use client';

import React, { useEffect, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { INPUT_BASER_STYLE } from 'constants/style';
import { notifySuccess } from 'utils/notify';
import { createFinanceCategory, type FinanceType } from 'services/finance';

// slug đơn giản từ tên
function slugify(input: string) {
  return (input || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void; // reload categories ở modal chi phí
}

export default function FinanceCategoryModal({ open, onClose, onCreated }: Props) {
  const [saving, setSaving] = useState(false);

  const schema = Yup.object({
    name: Yup.string().required('Nhập tên'),
    description: Yup.string().nullable()
  });

  const formik = useFormik({
    initialValues: {
      type: 'expense' as FinanceType,
      name: '',
      description: ''
    },
    enableReinitialize: true,
    validationSchema: schema,
    onSubmit: async (v) => {
      const code = slugify(v.name);
      if (!code) return; // tránh gửi rỗng
      try {
        setSaving(true);
        await createFinanceCategory({
          type: 'expense',
          name: v.name.trim(),
          code, // tự sinh, không hiển thị
          description: v.description?.trim() || undefined,
          houseId: null // GLOBAL
        });
        notifySuccess('Đã tạo loại chi phí');
        onCreated();
        onClose();
      } finally {
        setSaving(false);
      }
    }
  });

  // Reset form về mặc định mỗi lần mở
  useEffect(() => {
    if (!open) return;
    formik.resetForm({
      values: { type: 'expense', name: '', description: '' }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Tạo loại chi phí</DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent dividers>
          <Stack gap={2}>
            <TextField
              sx={INPUT_BASER_STYLE}
              label="Tên loại chi phí"
              value={formik.values.name}
              onChange={(e) => formik.setFieldValue('name', e.target.value)}
            />
            <TextField
              label="Mô tả"
              value={formik.values.description}
              onChange={(e) => formik.setFieldValue('description', e.target.value)}
              multiline
              minRows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Đóng</Button>
          <Button type="submit" variant="contained" disabled={saving || !formik.values.name.trim()}>
            Tạo
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
