import React, { useState } from 'react';
import { InputAdornment, IconButton, SxProps, Theme } from '@mui/material';
import { Calendar1 } from 'iconsax-react';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { LocalizationProvider, DesktopDatePickerProps } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

interface DatePickerStandardProps extends Partial<DesktopDatePickerProps<Date, false>> {
  label?: string;
  inputStyles?: SxProps<Theme>;
  variant?: 'outlined' | 'standard' | 'filled';
}

const DatePickerCustom: React.FC<DatePickerStandardProps> = ({
  value,
  variant = 'outlined',
  onChange,
  label = 'Chọn ngày',
  inputStyles,
  ...props
}) => {
  const [open, setOpen] = useState(false);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DesktopDatePicker
        {...props}
        value={value}
        onChange={onChange}
        format="dd/MM/yyyy"
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        slotProps={{
          textField: {
            sx: inputStyles,
            variant: variant,
            fullWidth: true,
            onClick: () => setOpen(true),
            InputProps: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setOpen(true)}>
                    <Calendar1 />
                  </IconButton>
                </InputAdornment>
              )
            }
          }
        }}
      />
    </LocalizationProvider>
  );
};

export default DatePickerCustom;
