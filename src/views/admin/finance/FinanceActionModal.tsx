'use client';

import React, { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import dayjs from 'dayjs';
import { INPUT_BASER_STYLE } from 'constants/style';
import { notifySuccess } from 'utils/notify';

import { type FinanceType, createExpense, createIncome, getFinanceCategories, updateFinanceRecord } from 'services/finance';
import { onlyDigits, toVND } from 'utils/format';

type HouseOption = { _id: string; code: string; address?: string };
type FileAsset = { _id: string; url: string };

export type FinanceRecord = {
  _id: string;
  code: string;
  type: FinanceType;
  houseId: string;
  year: number;
  month: number;
  amount: number;
  note?: string;
  attachments?: FileAsset[];
  createdBy?: { name?: string };
  categoryId?: string | null;
};

type FinanceCategory = { _id: string; type: FinanceType; name: string };

const years = (() => {
  const y = dayjs().year();
  return [y - 1, y, y + 1, y + 2];
})();
const months = Array.from({ length: 12 }, (_, i) => i + 1);

interface Props {
  open: boolean;
  type: FinanceType; // 'income' | 'expense'
  houses: HouseOption[]; // danh sách nhà để chọn
  initialHouseId: string; // houseId mặc định
  initial?: Partial<FinanceRecord>; // dùng cho edit
  onClose: () => void;
  onSuccess: () => void;
  refreshKey?: number; // tăng sau khi tạo category để reload
}

export default function FinanceActionModal({ open, type, houses, initialHouseId, initial, onClose, onSuccess, refreshKey }: Props) {
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<FinanceCategory[]>([]);

  console.log('initial', initial);

  const schema = Yup.object({
    houseId: Yup.string().required('Chọn nhà'),
    year: Yup.number().required(),
    month: Yup.number().required().min(1).max(12),
    amount: Yup.number().required().positive().integer(),
    note: Yup.string().nullable(),
    categoryId: type === 'expense' ? (Yup.string().required('Chọn loại chi phí') as any) : (Yup.string().nullable() as any)
  });

  const formik = useFormik({
    initialValues: {
      houseId: initial?.houseId ?? initialHouseId,
      year: initial?.year ?? dayjs().year(),
      month: initial?.month ?? dayjs().month() + 1,
      amount: initial?.amount ?? 0,
      note: initial?.note ?? '',
      categoryId: (initial as any)?.categoryId?._id ?? '' // only for expense
    },
    enableReinitialize: true,
    validationSchema: schema,
    onSubmit: async (values) => {
      try {
        setSaving(true);
        if (initial?._id) {
          await updateFinanceRecord(initial._id, {
            houseId: values.houseId,
            year: values.year,
            month: values.month,
            amount: values.amount,
            note: values.note,
            ...(type === 'expense' ? { categoryId: values.categoryId } : {})
          });
          notifySuccess('Cập nhật thành công');
        } else {
          if (type === 'expense') {
            await createExpense({
              houseId: values.houseId,
              year: values.year,
              month: values.month,
              amount: values.amount,
              note: values.note,
              categoryId: values.categoryId
            });
            notifySuccess('Tạo chi phí thành công');
          } else {
            await createIncome({
              houseId: values.houseId,
              year: values.year,
              month: values.month,
              amount: values.amount,
              note: values.note
            });
            notifySuccess('Tạo thu nhập thành công');
          }
        }
        onSuccess();
      } finally {
        setSaving(false);
      }
    }
  });

  // Load category theo nhà
  useEffect(() => {
    if (!open || type !== 'expense' || !formik.values.houseId) return;
    getFinanceCategories('expense', formik.values.houseId)
      .then((cs: any) => setCategories(cs ?? []))
      .catch(() => setCategories([]));
  }, [open, type, formik.values.houseId, refreshKey]);

  return (
    <Dialog
      open={open}
      // onClose={onClose}
      fullWidth
      maxWidth="xs"
      disableEscapeKeyDown
      onClose={(event, reason) => {
        if (reason === 'backdropClick') return;
        onClose();
      }}
    >
      <DialogTitle>{initial?._id ? 'Sửa bản ghi' : type === 'expense' ? 'Tạo chi phí' : 'Tạo thu nhập'}</DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent dividers>
          <Stack gap={2}>
            {/* Chọn nhà */}
            <FormControl fullWidth>
              <Select
                sx={INPUT_BASER_STYLE}
                value={formik.values.houseId}
                onChange={(e) => formik.setFieldValue('houseId', String(e.target.value))}
              >
                {houses.map((h) => (
                  <MenuItem key={h._id} value={h._id}>
                    {h.code}
                  </MenuItem>
                ))}
              </Select>
              {formik.touched.houseId && formik.errors.houseId && (
                <Typography color="error" variant="caption">
                  {String(formik.errors.houseId)}
                </Typography>
              )}
            </FormControl>

            {/* Năm / Tháng */}
            <Stack direction="row" gap={2}>
              <FormControl fullWidth>
                <Select
                  sx={INPUT_BASER_STYLE}
                  value={formik.values.year}
                  onChange={(e) => formik.setFieldValue('year', Number(e.target.value))}
                >
                  {years.map((y) => (
                    <MenuItem key={y} value={y}>
                      {y}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <Select
                  sx={INPUT_BASER_STYLE}
                  value={formik.values.month}
                  onChange={(e) => formik.setFieldValue('month', Number(e.target.value))}
                >
                  {months.map((m) => (
                    <MenuItem key={m} value={m}>
                      Tháng {m}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            {/* Số tiền */}
            <TextField
              sx={INPUT_BASER_STYLE}
              label="Số tiền"
              // value={formik.values.amount}
              // onChange={(e) => formik.setFieldValue('amount', Number(e.target.value))}
              value={formik.values.amount ? toVND(formik.values.amount) : ''} // hiển thị 1.000.000
              // onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              onChange={(e) => {
                const raw = onlyDigits(e.target.value);
                formik.setFieldValue('amount', Number(raw));
                if (!formik.touched.amount) formik.setFieldTouched('amount', true, false);
              }}
              inputMode="numeric"
            />

            {/* Category (chỉ khi chi phí) */}
            {type === 'expense' && (
              <FormControl fullWidth>
                <Select
                  sx={INPUT_BASER_STYLE}
                  displayEmpty
                  value={formik.values.categoryId}
                  onChange={(e) => formik.setFieldValue('categoryId', String(e.target.value))}
                  renderValue={(val) => (val ? categories.find((c) => c._id === val)?.name : 'Chọn loại chi phí')}
                >
                  {categories.map((c) => (
                    <MenuItem key={c._id} value={c._id}>
                      {c.name}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.categoryId && formik.errors.categoryId && (
                  <Typography color="error" variant="caption">
                    {String(formik.errors.categoryId)}
                  </Typography>
                )}
              </FormControl>
            )}

            {/* Ghi chú */}
            <TextField
              label="Ghi chú"
              value={formik.values.note}
              onChange={(e) => formik.setFieldValue('note', e.target.value)}
              multiline
              minRows={2}
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Đóng</Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {initial?._id ? 'Lưu' : 'Tạo'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
