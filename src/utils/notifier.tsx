import { enqueueSnackbar } from 'notistack';
import { FormattedMessage } from 'react-intl';
import { ERROR_CODES, ErrorCode } from './errorCodes';

export const notifyError = (code: string, fallback?: string) => {
  const message = ERROR_CODES[code as ErrorCode] ?? fallback ?? code;

  enqueueSnackbar(<FormattedMessage id={code} defaultMessage={message} />, { variant: 'error' });
};

export const notifySuccess = (code: string = 'SUCCESS', fallback?: string) => {
  const message = ERROR_CODES[code as ErrorCode] ?? fallback ?? code;

  enqueueSnackbar(<FormattedMessage id={code} defaultMessage={message} />, { variant: 'success' });
};

export const notifyWarning = (code: string, fallback?: string) => {
  const message = ERROR_CODES[code as ErrorCode] ?? fallback ?? code;

  enqueueSnackbar(<FormattedMessage id={code} defaultMessage={message} />, { variant: 'warning' });
};
