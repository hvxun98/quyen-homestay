import { enqueueSnackbar } from 'notistack';

export const notifySuccess = (message: string) => {
  return enqueueSnackbar(message, {
    variant: 'success',
    autoHideDuration: 2000,
    anchorOrigin: {
      vertical: 'top',
      horizontal: 'right'
    }
  });
};

export const notifyError = (message: string) => {
  return enqueueSnackbar(message, {
    variant: 'error',
    autoHideDuration: 2000,
    anchorOrigin: {
      vertical: 'top',
      horizontal: 'right'
    }
  });
};

export const notifyWarning = (message: string) => {
  return enqueueSnackbar(message, {
    variant: 'warning',
    autoHideDuration: 2000,
    anchorOrigin: {
      vertical: 'top',
      horizontal: 'right'
    }
  });
};
