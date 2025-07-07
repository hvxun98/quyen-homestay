'use client';

import React, { useMemo } from 'react';
import {
  Grid,
  TextField,
  Typography,
  Select,
  MenuItem,
  Autocomplete,
  IconButton,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormControl
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import ClearIcon from '@mui/icons-material/Clear';
import dayjs from 'dayjs';
import debounce from 'lodash/debounce';

export type InputType =
  | 'text'
  | 'select'
  | 'autocomplete'
  | 'date'
  | 'checkbox'
  | 'radio';

interface Props {
  type?: InputType;
  label: string;
  name: string;
  value?: any;
  options?: ReadonlyArray<any>;
  placeholder?: string;
  error?: boolean;
  helperText?: any;
  onChange?: (e: any) => void;
  onBlur?: (e: any) => void;
  onClear?: () => void;
  disabled?: boolean;
  hasLabel?: boolean;
  isRequired?: boolean;
  debounceInput?: boolean;
}

const toOption = (opt: any) =>
  typeof opt === 'object' ? opt : { label: String(opt), value: opt };

const parseDate = (v: any) => {
  const d = dayjs(v);
  return d.isValid() ? d : null;
};

const FormInputCommon: React.FC<Props> = React.memo(
  ({
    type = 'text',
    label,
    name,
    value,
    options = [],
    placeholder,
    error,
    helperText,
    onChange,
    onBlur,
    onClear,
    disabled,
    isRequired,
    hasLabel = true,
    debounceInput = false
  }) => {
    const showClear = Boolean(onClear && value);

    const commonGridProps = {
      container: true,
      spacing: 1,
      sx: { mb: 1, align: 'flex-start' }
    } as const;

    const debouncedChange = useMemo(
      () => (debounceInput && onChange ? debounce(onChange, 300) : onChange),
      [onChange, debounceInput]
    );

    if (type === 'checkbox') {
      return (
        <Grid {...commonGridProps}>
          <Grid
            item
            xs={hasLabel ? 4 : 12}
            sx={{ mt: 1, display: 'flex', alignItems: 'flex-start' }}
          >
            {hasLabel && (
              <Typography fontWeight="bold" fontSize={14}>
                {label}
                {isRequired && <span style={{ color: 'red' }}> *</span>}
              </Typography>
            )}
          </Grid>
          <Grid item xs={hasLabel ? 8 : 12}>
            <FormControlLabel
              control={
                <Checkbox
                  name={name}
                  checked={Boolean(value)}
                  onChange={onChange}
                  disabled={disabled}
                />
              }
              label=""
            />
          </Grid>
        </Grid>
      );
    }

    if (type === 'radio') {
      return (
        <Grid {...commonGridProps}>
          {hasLabel && (
            <Grid
              item
              xs={4}
              sx={{ mt: 1, display: 'flex', alignItems: 'flex-start' }}
            >
              <Typography fontWeight="bold" fontSize={14}>
                {label}
                {isRequired && <span style={{ color: 'red' }}> *</span>}
              </Typography>
            </Grid>
          )}
          <Grid item xs={hasLabel ? 8 : 12}>
            <FormControl component="fieldset" disabled={disabled}>
              <RadioGroup row name={name} value={value} onChange={onChange}>
                {options.map(toOption).map((opt) => (
                  <FormControlLabel
                    key={opt.value}
                    value={opt.value}
                    control={<Radio />}
                    label={opt.label}
                  />
                ))}
              </RadioGroup>
            </FormControl>
            {error && (
              <Typography variant="caption" color="error">
                {helperText}
              </Typography>
            )}
          </Grid>
        </Grid>
      );
    }

    return (
      <Grid {...commonGridProps}>
        {hasLabel && (
          <Grid
            item
            xs={4}
            sx={{ mt: 1, display: 'flex', alignItems: 'flex-start' }}
          >
            <Typography fontWeight="bold" fontSize={14}>
              {label}
              {isRequired && <span style={{ color: 'red' }}> *</span>}
            </Typography>
          </Grid>
        )}
        <Grid item xs={hasLabel ? 8 : 12}>
          {type === 'select' ? (
            <Select
              fullWidth
              size="small"
              name={name}
              value={value ?? ''}
              onChange={onChange}
              onBlur={onBlur}
              error={error}
              disabled={disabled}
              displayEmpty
              renderValue={(selected) => {
                const opt = options
                  .map(toOption)
                  .find((o) => o.value === selected);
                return opt ? opt.label : placeholder || '';
              }}
              sx={{ '& .MuiOutlinedInput-root': { height: 40 } }}
            >
              {placeholder && (
                <MenuItem disabled value="">
                  {placeholder}
                </MenuItem>
              )}
              {options.map((o) => {
                const { value: v, label: l } = toOption(o);
                return (
                  <MenuItem key={v} value={v}>
                    {l}
                  </MenuItem>
                );
              })}
            </Select>
          ) : type === 'autocomplete' ? (
            <Autocomplete
              size="small"
              disableClearable
              options={options.map(toOption)}
              value={options
                .map(toOption)
                .find((o) => o.value === value) || undefined}
              isOptionEqualToValue={(o, v) => o.value === v.value}
              getOptionLabel={(o) => o.label}
              onChange={(_, val) =>
                onChange?.({ target: { name, value: val ? val.value : '' } })
              }
              disabled={disabled}
              noOptionsText="Không có dữ liệu"
              sx={{
                '& .MuiOutlinedInput-root': {
                  pr: '22px !important',
                  height: 40
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  name={name}
                  placeholder={placeholder}
                  error={error}
                  helperText={helperText}
                  disabled={disabled}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {value && onClear && (
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              onClear();
                              onChange?.({ target: { name, value: '' } });
                            }}
                          >
                            <ClearIcon fontSize="small" />
                          </IconButton>
                        )}
                        {params.InputProps.endAdornment}
                      </>
                    )
                  }}
                />
              )}
            />
          ) : type === 'date' ? (
            <DatePicker
              value={parseDate(value)}
              onChange={(date) => onChange?.(date ?? null)}
              disabled={disabled}
              slotProps={{
                textField: {
                  name,
                  fullWidth: true,
                  size: 'small',
                  error,
                  helperText,
                  placeholder
                }
              }}
            />
          ) : (
            <TextField
              fullWidth
              size="small"
              name={name}
              value={value}
              onChange={debouncedChange}
              onBlur={onBlur}
              placeholder={placeholder}
              error={error}
              helperText={helperText}
              disabled={disabled}
              InputProps={{
                endAdornment: showClear ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={onClear}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : undefined
              }}
              sx={{ '& .MuiOutlinedInput-root': { height: 40 } }}
            />
          )}
        </Grid>
      </Grid>
    );
  }
);

export default React.memo(FormInputCommon, (prev, next) => {
  return (
    prev.type === next.type &&
    prev.label === next.label &&
    prev.name === next.name &&
    prev.value === next.value &&
    prev.placeholder === next.placeholder &&
    prev.error === next.error &&
    prev.helperText === next.helperText &&
    prev.disabled === next.disabled &&
    prev.isRequired === next.isRequired &&
    prev.hasLabel === next.hasLabel &&
    JSON.stringify(prev.options) === JSON.stringify(next.options)
  );
});
