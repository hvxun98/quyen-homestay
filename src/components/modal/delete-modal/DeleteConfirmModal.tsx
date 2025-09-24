'use client';

import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Typography } from '@mui/material';
import { DeleteOutline } from '@mui/icons-material';
import LoadingButton from 'components/@extended/LoadingButton';
import React from 'react';
interface DeleteConfirmModalProps {
  open: boolean;
  title?: string;
  description?: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function DeleteConfirmModal({
  open,
  title = 'Xác nhận xoá',
  description = 'Bạn có chắc chắn muốn xoá mục này? Hành động này không thể hoàn tác.',
  confirmText = 'Xoá',
  cancelText = 'Huỷ',
  loading,
  onConfirm,
  onClose
}: DeleteConfirmModalProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <DeleteOutline color="error" />
        <Typography variant="h6">{title}</Typography>
      </DialogTitle>
      <DialogContent>
        <DialogContentText>{description}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          {cancelText}
        </Button>
        <LoadingButton onClick={onConfirm} variant="contained" color="error" loading={loading}>
          {confirmText}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
