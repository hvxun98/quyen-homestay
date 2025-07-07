'use client';

import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Typography } from '@mui/material';
import { DeleteOutline } from '@mui/icons-material';
interface DeleteConfirmModalProps {
  open: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onClose: () => void;
}

export default function DeleteConfirmModal({
  open,
  title = 'Xác nhận xoá',
  description = 'Bạn có chắc chắn muốn xoá mục này? Hành động này không thể hoàn tác.',
  confirmText = 'Xoá',
  cancelText = 'Huỷ',
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
        <Button onClick={onConfirm} variant="contained" color="error">
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
