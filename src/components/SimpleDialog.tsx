import { Box, Button, ButtonProps, Dialog, DialogActions, DialogContent, DialogTitle, SxProps, useMediaQuery } from '@mui/material';
import { Theme, useTheme } from '@mui/material/styles';
import React, { useState } from 'react';
import LoadingButton from './@extended/LoadingButton';

interface ConfirmDialogProps {
  title?: string;
  buttonProps?: ButtonProps;
  content?: any;
  sx?: SxProps<Theme>;
  loadingSubmit?: boolean;
  onAccept?: (next?: Function) => void;
  onClose?: () => void;
  children?: any;
}
function SimpleDialog({
  title,
  buttonProps,
  onAccept = () => {},
  onClose = () => {},
  children,
  sx,
  loadingSubmit,
  content,
  ...props
}: ConfirmDialogProps) {
  const [open, setOpen] = useState<boolean>(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  const handleAccept = () => {
    onAccept(handleClose);
  };

  return (
    <Box>
      {buttonProps ? (
        <Button {...buttonProps} onClick={handleClickOpen}></Button>
      ) : (
        <Button onClick={handleClickOpen} variant="contained">
          Open
        </Button>
      )}
      <Dialog
        sx={sx}
        fullScreen={fullScreen}
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        {...props}
      >
        <Box sx={{ p: 1, py: 1.5 }}>
          <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
          <DialogContent>{content}</DialogContent>
          <DialogActions>
            <Button color="error" onClick={handleClose}>
              Bỏ qua
            </Button>
            <LoadingButton loading={loadingSubmit} variant="contained" onClick={handleAccept} autoFocus>
              Đồng ý
            </LoadingButton>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}

export default SimpleDialog;
