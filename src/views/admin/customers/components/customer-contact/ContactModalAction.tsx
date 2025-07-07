'use client';

import { Backdrop, Button, Divider, Fade, Grid, Modal, Stack } from '@mui/material';
import CardContent from '@mui/material/CardContent';
import FormInputCommon from 'components/field/FormInputCommon';
import MainCard from 'components/MainCard';
import { useFormik } from 'formik';
import { useParams } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { addContacts } from 'services/customers';
import * as Yup from 'yup';

interface ContactModalActionProps {
  type: 'create' | 'edit';
  open: boolean;
  initialData?: any;
  onClose: () => void;
  reload: boolean;
  setReload: (reload: boolean) => void;
}

interface ContactFormValues {
  honorific: string;
  name: string;
  jobTitle: string;
  department: string;
  phoneNumber: string;
  secondaryPhoneNumber: string;
  email: string;
}

export default function ContactModalAction({ type, open, initialData, onClose, reload, setReload }: ContactModalActionProps) {
  const { customerId } = useParams();

  const formik = useFormik<ContactFormValues>({
    initialValues: {
      honorific: '1',
      name: '',
      jobTitle: '',
      department: '',
      phoneNumber: '',
      secondaryPhoneNumber: '',
      email: ''
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      name: Yup.string().required('Vui lòng nhập họ tên'),
      phoneNumber: Yup.string().required('Vui lòng nhập số điện thoại'),
      email: Yup.string().email('Email không hợp lệ')
    }),
    onSubmit: async (values) => {
      try {
        await addContacts(Number(customerId), values);
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

  const { handleChange, values, touched, errors, setFieldValue } = formik;

  const fields: { label: string; name: keyof ContactFormValues; placeholder: string }[] = useMemo(
    () => [
      { label: 'Họ và tên', name: 'name', placeholder: 'Nhập họ và tên' },
      { label: 'Chức danh', name: 'jobTitle', placeholder: 'Nhập chức danh' },
      { label: 'Phòng', name: 'department', placeholder: 'Nhập phòng' },
      { label: 'Số điện thoại', name: 'phoneNumber', placeholder: 'Nhập số điện thoại' },
      { label: 'Số điện thoại 2', name: 'secondaryPhoneNumber', placeholder: 'Nhập số điện thoại phụ' },
      { label: 'Email', name: 'email', placeholder: 'Nhập email' }
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
        <MainCard title={type === 'edit' ? 'Cập nhật liên hệ' : 'Thêm liên hệ'} modal darkTitle content={false}>
          <form onSubmit={formik.handleSubmit}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormInputCommon
                    label="Ông/bà"
                    name="honorific"
                    type="select"
                    value={values.honorific}
                    onChange={handleChange}
                    options={[
                      { label: 'Ông', value: '1' },
                      { label: 'Bà', value: '2' }
                    ]}
                    placeholder="Chọn xưng hô"
                    onClear={() => setFieldValue('honorific', '')}
                  />
                </Grid>

                {fields.map(({ label, name, placeholder }) => (
                  <Grid item xs={12} md={6} key={name}>
                    <FormInputCommon
                      label={label}
                      name={name}
                      type="text"
                      value={values[name]}
                      onChange={handleChange}
                      placeholder={placeholder}
                      error={Boolean(touched[name] && errors[name])}
                      helperText={touched[name] && typeof errors[name] === 'string' ? errors[name] : ''}
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
