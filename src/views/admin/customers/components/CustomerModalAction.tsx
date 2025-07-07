'use client';

import { Backdrop, Button, Checkbox, Divider, Fade, FormControlLabel, Grid, Modal, Stack } from '@mui/material';
import CardContent from '@mui/material/CardContent';
import FormInputCommon from 'components/field/FormInputCommon';
import MainCard from 'components/MainCard';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { addCustomer, editCustomer, getDepartment } from 'services/customers';
import { CustomerInfoProps } from 'types/customer';
import * as Yup from 'yup';

interface CustomerModalActionProps {
  type: 'create' | 'edit' | 'copy';
  open: boolean;
  initialData?: CustomerInfoProps | null;
  onClose: () => void;
  reload: boolean;
  setReload: (reload: boolean) => void;
}

export default function CustomerModalAction({ type, open, initialData, onClose, reload, setReload }: CustomerModalActionProps) {
  const [departmentList, setDepartmentList] = useState<any[]>([]);

  useEffect(() => {
    getDepartment().then((res) => setDepartmentList(res.data));
  }, []);

  const validationSchema = Yup.object({
    name: Yup.string().required('Vui lòng nhập tên khách hàng'),
    email: Yup.string().email('Email không hợp lệ').nullable(),
    clientCode: Yup.string().required('Vui lòng nhập mã khách hàng'),
    phoneNumber: Yup.string().required('Vui lòng nhập số điện thoại'),
    address: Yup.string().required('Vui lòng nhập địa chỉ'),
    // departmentId: Yup.string().required('Vui lòng chọn chi nhánh')
  });

  const formik = useFormik<CustomerInfoProps>({
    initialValues: {
      departmentId: '',
      name: '',
      namePrint: '',
      nameEnglish: '',
      clientCode: '',
      taxCode: '',
      accountNumber: '',
      phoneNumber: '',
      faxNumber: '',
      email: '',
      address: '',
      addressInvoice: '',
      representative: '',
      jobTitle: '',
      unitRequest: false,
      inspector: false
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values) => {
      const filteredValues = Object.fromEntries(
        Object.entries(values).filter(([_, value]) => typeof value === 'boolean' || (value !== '' && value !== null && value !== undefined))
      );

      try {
        if (type === 'edit' && typeof initialData?.id === 'number') {
          await editCustomer(initialData.id, filteredValues);
        } else {
          await addCustomer(filteredValues);
        }
        setReload(!reload);
        onClose();
      } catch (error) {
        console.error('Error saving customer:', error);
      }
    }
  });

  useEffect(() => {
    if (initialData) {
      formik.setValues(initialData);
    }
  }, [initialData]);

  useEffect(() => {
    if (!open) formik.resetForm();
  }, [open]);

  const { handleChange, values, touched, errors, setFieldValue } = formik;

  const renderTitle = () => {
    switch (type) {
      case 'create':
        return 'Thêm khách hàng';
      case 'edit':
        return 'Cập nhật khách hàng';
      case 'copy':
        return 'Sao chép khách hàng';
    }
  };

  const fieldList: { label: string; name: keyof typeof values; placeholder: string; required?: boolean }[] = [
    { label: 'Tên khách hàng', name: 'name', placeholder: 'Nhập tên khách hàng', required: true },
    { label: 'Tên khi in', name: 'namePrint', placeholder: 'Nhập tên khi in' },
    { label: 'Tên tiếng Anh', name: 'nameEnglish', placeholder: 'Nhập tên tiếng Anh' },
    { label: 'Mã khách hàng', name: 'clientCode', placeholder: 'Nhập mã khách hàng', required: true },
    { label: 'Mã số thuế', name: 'taxCode', placeholder: 'Nhập mã số thuế' },
    { label: 'Số tài khoản', name: 'accountNumber', placeholder: 'Nhập số tài khoản' },
    { label: 'Số điện thoại', name: 'phoneNumber', placeholder: 'Nhập số điện thoại', required: true },
    { label: 'Fax', name: 'faxNumber', placeholder: 'Nhập số fax' },
    { label: 'Email', name: 'email', placeholder: 'Nhập email' },
    { label: 'Địa chỉ', name: 'address', placeholder: 'Nhập địa chỉ', required: true },
    { label: 'Địa chỉ hóa đơn', name: 'addressInvoice', placeholder: 'Nhập địa chỉ hóa đơn' },
    { label: 'Người đại diện', name: 'representative', placeholder: 'Nhập người đại diện' },
    { label: 'Chức danh', name: 'jobTitle', placeholder: 'Nhập chức danh' }
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
        <MainCard title={renderTitle()} modal darkTitle content={false} sx={{ width: 'auto' }}>
          <form onSubmit={formik.handleSubmit}>
            <CardContent>
              <Grid container spacing={2}>
                {fieldList.map(({ label, name, placeholder, required }) => (
                  <Grid item xs={12} md={6} key={name}>
                    <FormInputCommon
                      label={label}
                      name={name}
                      type="text"
                      value={values[name]}
                      onChange={handleChange}
                      placeholder={placeholder}
                      error={touched[name] && Boolean(errors[name])}
                      helperText={touched[name] && (errors[name] as string)}
                      onClear={() => setFieldValue(name, '')}
                      isRequired={required}
                    />
                  </Grid>
                ))}

                <Grid item xs={12} md={6}>
                  <FormInputCommon
                    label="Phòng ban/Chi nhánh"
                    name="departmentId"
                    type="autocomplete"
                    value={values.departmentId}
                    options={departmentList.map((d) => ({ label: d.brandName, value: d.id }))}
                    placeholder="Chọn chi nhánh"
                    error={touched.departmentId && Boolean(errors.departmentId)}
                    helperText={touched.departmentId && (errors.departmentId as string)}
                    onChange={handleChange}
                    onClear={() => setFieldValue('departmentId', '')}
                  // isRequired
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={<Checkbox name="unitRequest" checked={values.unitRequest} onChange={handleChange} />}
                    label="Đơn vị yêu cầu quan trắc"
                  />
                  <FormControlLabel
                    control={<Checkbox name="inspector" checked={values.inspector} onChange={handleChange} />}
                    label="Thanh tra"
                  />
                </Grid>
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
