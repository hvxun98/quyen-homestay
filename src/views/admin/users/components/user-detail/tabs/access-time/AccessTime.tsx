import React, { useState } from 'react';

// material-ui
import { Box, Button, Checkbox, FormControl, FormControlLabel, FormHelperText, Stack } from '@mui/material';
import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// third-party
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { enqueueSnackbar } from 'notistack';

// assets
import { Add, CloseCircle, Minus, Save2 } from 'iconsax-react';

// project-imports
import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';
import { UserAccessTimeProps } from 'types/user-profile';
import { generateUniqueId } from 'utils/functions';

function AccessTime() {
  const [accessTimeChildren, setAccessTimeChildren] = useState<UserAccessTimeProps[]>([]);
  const days = [
    { objKey: 'monday', label: 'Thứ hai', numberOrder: 0 },
    { objKey: 'tuesday', label: 'Thứ ba', numberOrder: 1 },
    { objKey: 'wednesday', label: 'Thứ tư', numberOrder: 2 },
    { objKey: 'thursday', label: 'Thứ năm', numberOrder: 3 },
    { objKey: 'friday', label: 'Thứ sáu', numberOrder: 4 },
    { objKey: 'saturday', label: 'Thứ bảy', numberOrder: 5 },
    { objKey: 'sunday', label: 'Chủ nhật', numberOrder: 6 }
  ];

  const validationSchema = Yup.object({
    start_monday: Yup.date().nullable().required('Vui lòng chọn thời gian bắt đầu cho thứ hai'),
    start_tuesday: Yup.date().nullable().required('Vui lòng chọn thời gian bắt đầu cho thứ ba'),
    start_wednesday: Yup.date().nullable().required('Vui lòng chọn thời gian bắt đầu cho thứ tư'),
    start_thursday: Yup.date().nullable().required('Vui lòng chọn thời gian bắt đầu cho thứ năm'),
    start_friday: Yup.date().nullable().required('Vui lòng chọn thời gian bắt đầu cho thứ sáu'),
    start_saturday: Yup.date().nullable().required('Vui lòng chọn thời gian bắt đầu cho thứ bảy'),
    start_sunday: Yup.date().nullable().required('Vui lòng chọn thời gian bắt đầu cho Chủ nhật'),

    end_monday: Yup.date().nullable().required('Vui lòng chọn thời gian kết thúc cho thứ hai'),
    end_tuesday: Yup.date().nullable().required('Vui lòng chọn thời gian kết thúc cho thứ ba'),
    end_wednesday: Yup.date().nullable().required('Vui lòng chọn thời gian kết thúc cho thứ tư'),
    end_thursday: Yup.date().nullable().required('Vui lòng chọn thời gian kết thúc cho thứ năm'),
    end_friday: Yup.date().nullable().required('Vui lòng chọn thời gian kết thúc cho thứ sáu'),
    end_saturday: Yup.date().nullable().required('Vui lòng chọn thời gian kết thúc cho thứ bảy'),
    end_sunday: Yup.date().nullable().required('Vui lòng chọn thời gian kết thúc cho Chủ nhật')
  });

  const formik = useFormik({
    // enableReinitialize: true,
    initialValues: {
      allowAccessByTime: false,
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,

      start_monday: null as Date | null,
      start_tuesday: null as Date | null,
      start_wednesday: null as Date | null,
      start_thursday: null as Date | null,
      start_friday: null as Date | null,
      start_saturday: null as Date | null,
      start_sunday: null as Date | null,

      end_monday: null as Date | null,
      end_tuesday: null as Date | null,
      end_wednesday: null as Date | null,
      end_thursday: null as Date | null,
      end_friday: null as Date | null,
      end_saturday: null as Date | null,
      end_sunday: null as Date | null
    },
    validationSchema,
    onSubmit: (values) => {
      console.log('Submitted Values:', values);
      console.log('Formik Errors:', formik.errors);
    }
  });

  const { values, handleChange, handleSubmit } = formik;

  const handleAddRecordTime = (numberOrder: number) => {
    const currentDay = days?.find((day) => day.numberOrder === numberOrder);

    const newAccessTime: UserAccessTimeProps = {
      id: generateUniqueId(),
      numberOrder: numberOrder,
      dayOfWeek: currentDay?.objKey || '',
      name: currentDay?.objKey || '',
      from: '',
      to: '',
      isActive: true,
      isChild: true
    };

    setAccessTimeChildren((prevState) => [...prevState, newAccessTime]);
  };

  const handleSubRecordTime = (recordId: number | string | undefined) => {
    if (!accessTimeChildren?.some((item: UserAccessTimeProps) => item.id === recordId))
      enqueueSnackbar('Thao tác thất bại', {
        variant: 'error',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'right'
        }
      });
    else {
      setAccessTimeChildren((prevState) => prevState.filter((item: UserAccessTimeProps) => item.id !== recordId));
    }
  };

  return (
    <MainCard sx={{ mt: 2 }}>
      <form onSubmit={handleSubmit}>
        <Box>
          <FormControlLabel
            control={<Checkbox value={values.allowAccessByTime} name="allowAccessByTime" onChange={handleChange} />}
            label="Chỉ cho phép truy cập theo khung giờ"
            labelPlacement="end"
            sx={{ ml: 1 }}
          />

          {days.map((day) => (
            <Box key={day.objKey}>
              <Stack flexDirection="row" gap={5} sx={{ mt: 1 }} alignItems={'center'}>
                <FormControlLabel
                  control={<Checkbox name={day.objKey} value={values[day.objKey as keyof typeof values]} onChange={handleChange} />}
                  label={day.label}
                  labelPlacement="end"
                  disabled={!values.allowAccessByTime}
                  sx={{ ml: 1, width: 100 }}
                />

                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <Stack flexDirection="row" gap={2}>
                    <FormControl
                      error={
                        values.allowAccessByTime &&
                        Boolean(values[day.objKey as keyof typeof values]) &&
                        formik.touched[`start_${day.objKey}` as keyof typeof values] &&
                        Boolean(formik.errors[`start_${day.objKey}` as keyof typeof values])
                      }
                    >
                      <TimePicker
                        name={`start_${day.objKey}`}
                        label="Từ"
                        disabled={!values[day.objKey as keyof typeof values]}
                        value={(values[`start_${day.objKey}` as keyof typeof values] as Date) || null}
                        onChange={(value) => {
                          formik.setFieldValue(`start_${day.objKey}`, value);
                          formik.setFieldTouched(`start_${day.objKey}`, true);
                        }}
                      />
                      {Boolean(values[day.objKey as keyof typeof values]) &&
                        formik.touched[`start_${day.objKey}` as keyof typeof values] &&
                        formik.errors[`start_${day.objKey}` as keyof typeof values] && (
                          <FormHelperText>{formik.errors[`start_${day.objKey}` as keyof typeof values]}</FormHelperText>
                        )}
                    </FormControl>
                    <FormControl
                      error={
                        values.allowAccessByTime &&
                        Boolean(values[day.objKey as keyof typeof values]) &&
                        formik.touched[`end_${day.objKey}` as keyof typeof values] &&
                        Boolean(formik.errors[`end_${day.objKey}` as keyof typeof values])
                      }
                    >
                      <TimePicker
                        name={`end_${day.objKey}`}
                        label="Tới"
                        disabled={!values[day.objKey as keyof typeof values]}
                        value={(values[`end_${day.objKey}` as keyof typeof values] as Date) || null}
                        onChange={(value) => {
                          formik.setFieldValue(`end_${day.objKey}`, value);
                          formik.setFieldTouched(`end_${day.objKey}`, true);
                        }}
                      />
                      {Boolean(values[day.objKey as keyof typeof values]) &&
                        formik.touched[`end_${day.objKey}` as keyof typeof values] &&
                        formik.errors[`end_${day.objKey}` as keyof typeof values] && (
                          <FormHelperText>{formik.errors[`end_${day.objKey}` as keyof typeof values]}</FormHelperText>
                        )}
                    </FormControl>
                  </Stack>
                </LocalizationProvider>
                {Boolean(values[day.objKey as keyof typeof values]) && (
                  <IconButton onClick={() => handleAddRecordTime(day.numberOrder)}>
                    <Add />
                  </IconButton>
                )}
              </Stack>
              {accessTimeChildren
                .filter((record: UserAccessTimeProps) => record.numberOrder === day.numberOrder)
                .map((record: UserAccessTimeProps, index) => (
                  <LocalizationProvider dateAdapter={AdapterDateFns} key={record.id}>
                    <Stack flexDirection="row" gap={5} sx={{ mt: 1 }} alignItems={'center'}>
                      <Box sx={{ ml: 1, width: 116 }}></Box>
                      <Stack flexDirection="row" gap={2}>
                        <FormControl>
                          <TimePicker
                            value={(values[`start_${day.objKey}_child_${index}` as keyof typeof values] as Date) || null}
                            onChange={(value) => formik.setFieldValue(`start_${day.objKey}_child_${index}`, value)}
                            label="Từ"
                          />
                        </FormControl>
                        <FormControl>
                          <TimePicker
                            label="Tới"
                            value={(values[`end_${day.objKey}_child_${index}` as keyof typeof values] as Date) || null}
                            onChange={(value) => formik.setFieldValue(`end_${day.objKey}_child_${index}`, value)}
                          />
                        </FormControl>
                      </Stack>
                      <IconButton onClick={() => handleSubRecordTime(record.id)}>
                        <Minus />
                      </IconButton>
                    </Stack>
                  </LocalizationProvider>
                ))}
            </Box>
          ))}

          <Stack flexDirection="row" gap={2} sx={{ pt: 2 }} justifyContent="flex-end">
            <Button type="submit" variant="contained" color="success" startIcon={<Save2 />}>
              Lưu
            </Button>
            <Button variant="contained" color="secondary" startIcon={<CloseCircle />}>
              Bỏ qua
            </Button>
          </Stack>
        </Box>
      </form>
    </MainCard>
  );
}

export default AccessTime;
