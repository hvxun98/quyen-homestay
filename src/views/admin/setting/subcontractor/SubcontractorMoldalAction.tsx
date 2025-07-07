'use client';

import {
  Backdrop,
  Button,
  Checkbox,
  Divider,
  Fade,
  FormControlLabel,
  Grid,
  Modal,
  Stack
} from '@mui/material';
import CardContent from '@mui/material/CardContent';
import FormInputCommon from 'components/field/FormInputCommon';
import MainCard from 'components/MainCard';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { fetchCompanyEmployeeList } from 'services/orders';
import { createSubcontractor, updateSubcontractor } from 'services/setting';
import * as Yup from 'yup';

export interface SubcontractorProps {
  id?: number;
  companyName: string;
  companyCode: string;
  taxCode: string;
  phoneNumber?: string;
  fax?: string;
  email?: string;
  address?: string;
  invoiceAddress?: string;
  contactUserId?: number;
  applyNotSubContract?: boolean;
  status: number;
}

interface SubcontractorModalProps {
  type?: 'create' | 'edit';
  open: boolean;
  initialData?: SubcontractorProps | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SubcontractorModal({
  type = 'create',
  open,
  initialData,
  onClose,
  onSuccess
}: SubcontractorModalProps) {
  const [userList, setUserList] = useState<any[]>([]);

  useEffect(() => {
    fetchCompanyEmployeeList({ page: 1, size: 1000000 })
      .then((res) =>
        setUserList(
          res.data.content.map((e: any) => ({
            label: `${e.login ?? ''}`,
            value: e.id
          }))
        )
      )
      .catch(() => { });
  }, []);

  const validationSchema = Yup.object({
    companyName: Yup.string().required('Vui lòng nhập tên cơ quan'),
    companyCode: Yup.string().required('Vui lòng nhập mã cơ quan'),
    taxCode: Yup.string().required('Vui lòng nhập mã số thuế')
  });

  const defaultValues: SubcontractorProps = {
    companyName: '',
    companyCode: '',
    taxCode: '',
    phoneNumber: '',
    fax: '',
    email: '',
    address: '',
    invoiceAddress: '',
    contactUserId: undefined,
    applyNotSubContract: false,
    status: 1
  };

  const formik = useFormik<SubcontractorProps>({
    initialValues: initialData ? { ...defaultValues, ...initialData } : defaultValues,
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values) => {
      const filteredValues = Object.fromEntries(
        Object.entries(values).filter(
          ([_, value]) =>
            typeof value === 'boolean' ||
            typeof value === 'number' ||
            (value !== '' && value !== null && value !== undefined)
        )
      );

      try {
        if (type === 'edit' && initialData?.id) {
          await updateSubcontractor(initialData.id, filteredValues);
        } else {
          await createSubcontractor(filteredValues);
        }
        onSuccess();
      } catch (error) {
        console.error('Error saving subcontractor:', error);
      }
    }
  });

  useEffect(() => {
    if (!open) formik.resetForm();
  }, [open]);

  const { handleChange, values, touched, errors, setFieldValue } = formik;

  const renderTitle = () => (type === 'edit' ? 'Cập nhật thầu phụ' : 'Tạo thầu phụ');

  const fieldList: { label: string; name: keyof SubcontractorProps; required?: boolean }[] = [
    { label: 'Tên cơ quan', name: 'companyName', required: true },
    { label: 'Mã cơ quan', name: 'companyCode', required: true },
    { label: 'Mã số thuế', name: 'taxCode', required: true },
    { label: 'Số điện thoại', name: 'phoneNumber' },
    { label: 'Fax', name: 'fax' },
    { label: 'Email', name: 'email' },
    { label: 'Địa chỉ', name: 'address' },
    { label: 'Địa chỉ hóa đơn', name: 'invoiceAddress' }
  ];

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
          title={renderTitle()}
          subheader="Thông tin thầu phụ"
          modal
          darkTitle
          content={false}
          sx={{ width: 'auto', maxWidth: 600 }}
        >
          <form onSubmit={formik.handleSubmit}>
            <CardContent>
              <Grid container spacing={2}>
                {fieldList.map(({ label, name, required }) => (
                  <Grid item xs={12} key={name}>
                    <FormInputCommon
                      label={label}
                      name={name}
                      type="text"
                      value={values[name] || ''}
                      onChange={handleChange}
                      placeholder=""
                      error={touched[name] && Boolean(errors[name])}
                      helperText={touched[name] && (errors[name] as string)}
                      onClear={() => setFieldValue(name, '')}
                      isRequired={required}
                    />
                  </Grid>
                ))}

                <Grid item xs={12}>
                  <FormInputCommon
                    label="Người liên lạc"
                    name="contactUserId"
                    type="autocomplete"
                    value={values.contactUserId ?? ''}
                    options={userList}
                    placeholder="Chọn liên lạc"
                    error={touched.contactUserId && Boolean(errors.contactUserId)}
                    helperText={touched.contactUserId && (errors.contactUserId as string)}
                    onChange={(e: any) => {
                      const value = e?.target?.value;
                      setFieldValue('contactUserId', value ? Number(value) : undefined);
                    }}
                    onClear={() => setFieldValue('contactUserId', undefined)}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="applyNotSubContract"
                        checked={values.applyNotSubContract ?? false}
                        onChange={(e) => setFieldValue('applyNotSubContract', e.target.checked)}
                      />
                    }
                    label="Áp dụng như không thầu phụ"
                  />
                </Grid>
              </Grid>
            </CardContent>

            <Divider />

            <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ px: 2.5, py: 2 }}>
              <Button variant="outlined" color="error" onClick={onClose} disabled={formik.isSubmitting}>
                Hủy
              </Button>
              <Button type="submit" variant="contained" disabled={formik.isSubmitting}>
                Lưu
              </Button>
            </Stack>
          </form>
        </MainCard>
      </Fade>
    </Modal>
  );
}
