import { ReactNode, useEffect } from 'react';
import { useSnackbar, VariantType, SnackbarKey } from 'notistack';

let useSnackbarRef: (variant: VariantType, node: ReactNode) => SnackbarKey;

export const SnackbarUtilsConfigurator = () => {
  const { enqueueSnackbar } = useSnackbar();
  useEffect(() => {
    useSnackbarRef = enqueueSnackbar;
  }, [enqueueSnackbar]);
  return null;
};

export const toast = (node: ReactNode, variant: VariantType = 'default') => useSnackbarRef?.(variant, node);
