import { Backdrop, Box, Button, Divider, Fade, Grid, InputAdornment, Modal, Stack, TextField, Typography } from '@mui/material';
import CardContent from '@mui/material/CardContent';
import MainCard from 'components/MainCard';
import SpecialSymbolPicker from 'components/special-symbol-picker/SpecialSymbolPicker';
import { useFormik } from 'formik';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { addMonitoringLocation, editMonitoringLocation } from 'services/customers';
import { MonitoringLocation } from 'types/customer';
import * as Yup from 'yup';

interface MonitoringLocationModalActionProps {
  type: 'create' | 'edit';
  buttonProps?: any;
  initialData?: MonitoringLocation;
  onClose?: () => void;
  reload: boolean;
  setReload: (reload: boolean) => void;
}

interface MonitoringLocationFormValues {
  name: string;
  nameEn: string;
  description: string;
  latitude: string;
  longitude: string;
  order: number;
}

const inputStyles = { width: '100%', height: 40 };
const labelStyles = { fontWeight: 'bold', fontSize: 14 };

export default function MonitoringLocationModalAction({
  type,
  buttonProps,
  initialData,
  onClose,
  reload,
  setReload
}: MonitoringLocationModalActionProps) {
  const [open, setOpen] = useState(false);
  const { locationId } = useParams();

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    onClose?.();
  };

  const formik = useFormik<MonitoringLocationFormValues>({
    initialValues: {
      name: '',
      nameEn: '',
      description: '',
      latitude: '',
      longitude: '',
      order: 0
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      name: Yup.string().required('Vui lòng nhập tên'),
      nameEn: Yup.string(),
      description: Yup.string(),
      latitude: Yup.string(),
      longitude: Yup.string(),
      order: Yup.number()
    }),
    onSubmit: async (values) => {
      try {
        if (type === 'create') {
          await addMonitoringLocation(Number(locationId), values);
        } else {
          await editMonitoringLocation(initialData?.id!, values);
        }
        setReload(!reload);
        handleClose();
      } catch (error) {
        console.error(error);
      }
    }
  });

  useEffect(() => {
    if (initialData) {
      setOpen(true);
      formik.setValues({
        name: initialData.name || '',
        nameEn: initialData.nameEn || '',
        description: initialData.description || '',
        latitude: initialData.latitude || '',
        longitude: initialData.longitude || '',
        order: initialData.order || 0
      });
    }
  }, [initialData]);

  const { handleChange, values, handleSubmit, setFieldValue } = formik;

  const fields: { label: string; name: keyof MonitoringLocationFormValues; symbol?: boolean }[] = [
    { label: 'Tên', name: 'name', symbol: true },
    { label: 'Tên tiếng Anh', name: 'nameEn' },
    { label: 'Mô tả', name: 'description', symbol: true },
    { label: 'Vĩ độ', name: 'latitude' },
    { label: 'Kinh độ', name: 'longitude' },
    { label: 'Thứ tự', name: 'order' }
  ];

  return (
    <Box>
      {buttonProps && type !== 'edit' ? <Button {...buttonProps} onClick={handleOpen} /> : null}

      <Modal
        open={open}
        onClose={handleClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{ backdrop: { timeout: 500 } }}
      >
        <Fade in={open}>
          <MainCard
            title={type === 'edit' ? 'Cập nhật vị trí quan trắc' : 'Thêm vị trí quan trắc'}
            modal
            darkTitle
            content={false}
            sx={{ width: 600 }}
          >
            <form onSubmit={handleSubmit}>
              <CardContent>
                <Grid container spacing={2}>
                  {fields.map(({ label, name, symbol }) => (
                    <Grid container item xs={12} spacing={1} key={name} alignItems="center">
                      <Grid item xs={4}>
                        <Typography sx={labelStyles}>{label}</Typography>
                      </Grid>
                      <Grid item xs={8}>
                        <TextField
                          name={name}
                          value={values[name]}
                          onChange={handleChange}
                          fullWidth
                          variant="outlined"
                          size="small"
                          sx={inputStyles}
                          InputProps={
                            symbol
                              ? {
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <SpecialSymbolPicker onSelect={(symbolValue) => setFieldValue(name, values[name] + symbolValue)} />
                                  </InputAdornment>
                                )
                              }
                              : undefined
                          }
                        />
                      </Grid>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
              <Divider />
              <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ px: 2.5, py: 2 }}>
                <Button color="error" onClick={handleClose}>
                  Hủy
                </Button>
                <Button variant="contained" type="submit">
                  Lưu
                </Button>
              </Stack>
            </form>
          </MainCard>
        </Fade>
      </Modal>
    </Box>
  );
}
