import { Backdrop, Button, Divider, Fade, Grid, Modal, Stack } from '@mui/material';
import CardContent from '@mui/material/CardContent';
import FormInputCommon from 'components/field/FormInputCommon';
import MainCard from 'components/MainCard';
import { useFormik } from 'formik';
import { useParams } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { addLocation, editLocation } from 'services/customers';
import * as Yup from 'yup';

interface LocationModalActionProps {
  type: 'create' | 'edit';
  open: boolean;
  initialData?: any;
  onClose: () => void;
  reload: boolean;
  setReload: (reload: boolean) => void;
}

interface LocationFormValues {
  name: string;
  name_en: string;
  description: string;
}

export default function LocationModalAction({ type, open, initialData, onClose, reload, setReload }: LocationModalActionProps) {
  const { customerId } = useParams();

  const formik = useFormik<LocationFormValues>({
    initialValues: {
      name: '',
      name_en: '',
      description: ''
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      name: Yup.string().required('Vui lòng nhập tên địa điểm'),
      name_en: Yup.string(),
      description: Yup.string()
    }),
    onSubmit: async (values) => {
      try {
        if (type === 'edit') {
          await editLocation(Number(customerId), values);
        } else {
          await addLocation(Number(customerId), values);
        }

        setReload(!reload);
        onClose();
      } catch (error) {
        console.error(error);
      }
    }
  });

  useEffect(() => {
    if (open) {
      if (type === 'edit' && initialData) {
        formik.setValues(initialData);
      } else {
        formik.resetForm();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const { values, errors, touched, handleChange, handleSubmit, setFieldValue } = formik;

  const fields: { label: string; name: keyof LocationFormValues; placeholder: string }[] = useMemo(
    () => [
      { label: 'Tên địa điểm', name: 'name', placeholder: 'Nhập tên địa điểm' },
      { label: 'Tên tiếng Anh', name: 'name_en', placeholder: 'Nhập tên tiếng Anh' },
      { label: 'Mô tả', name: 'description', placeholder: 'Nhập mô tả' }
    ],
    []
  );

  return (
    <Modal
      open={open}
      onClose={(_, reason) => {
        if (reason !== 'backdropClick') onClose();
      }}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{ backdrop: { timeout: 500 } }}
    >
      <Fade in={open}>
        <MainCard title={type === 'edit' ? 'Cập nhật địa điểm' : 'Thêm địa điểm'} modal darkTitle content={false} sx={{ width: 500 }}>
          <form onSubmit={handleSubmit}>
            <CardContent>
              <Grid container spacing={2}>
                {fields.map(({ label, name, placeholder }) => (
                  <Grid item xs={12} key={name}>
                    <FormInputCommon
                      label={label}
                      name={name}
                      placeholder={placeholder}
                      value={values[name]}
                      onChange={handleChange}
                      error={Boolean(touched[name] && errors[name])}
                      helperText={touched[name] && (errors[name] as string)}
                      onClear={() => setFieldValue(name, '')}
                    />
                  </Grid>
                ))}
              </Grid>
            </CardContent>
            <Divider />
            <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ px: 2.5, py: 2 }}>
              <Button color="error" onClick={onClose}>
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
  );
}
