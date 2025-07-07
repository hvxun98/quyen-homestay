import { Backdrop, Button, Divider, Fade, Modal, Stack } from '@mui/material';
import CardContent from '@mui/material/CardContent';
import FormInputCommon from 'components/field/FormInputCommon';
import MainCard from 'components/MainCard';
import { useFormik } from 'formik';
import { useEffect } from 'react';
import { createNormTable, updateNormTable } from 'services/normtable';
import * as Yup from 'yup';

interface NormTableModalActionProps {
  type: 'create' | 'edit';
  open: boolean;
  initialData?: any;
  onClose: () => void;
  reload: boolean;
  setReload: (reload: boolean) => void;
}

interface FormValues {
  name: string;
  description: string;
}

export default function NormTableModalAction({ type, open, initialData, onClose, reload, setReload }: NormTableModalActionProps) {
  const formik = useFormik<FormValues>({
    initialValues: {
      name: '',
      description: ''
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      name: Yup.string().required('Vui lòng nhập tên bảng định mức')
    }),
    onSubmit: async (values) => {
      try {
        if (type === 'edit' && initialData?.id) {
          await updateNormTable(initialData.id, values);
        } else {
          await createNormTable(values);
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
  }, [open]);

  const { values, touched, errors, handleChange, handleSubmit, setFieldValue } = formik;

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
        <MainCard
          title={type === 'edit' ? 'Cập nhật bảng định mức' : 'Thêm bảng định mức'}
          modal
          darkTitle
          content={false}
          sx={{ width: 500 }}
        >
          <form onSubmit={handleSubmit}>
            <CardContent>
              <FormInputCommon
                label="Tên"
                name="name"
                value={values.name}
                placeholder="Nhập tên bảng định mức"
                onChange={handleChange}
                error={Boolean(touched.name && errors.name)}
                helperText={touched.name && errors.name}
                onClear={() => setFieldValue('name', '')}
                isRequired
              />
              <FormInputCommon
                label="Mô tả"
                name="description"
                value={values.description}
                placeholder="Nhập mô tả"
                onChange={handleChange}
                error={Boolean(touched.description && errors.description)}
                helperText={touched.description && errors.description}
                onClear={() => setFieldValue('description', '')}
              />
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
