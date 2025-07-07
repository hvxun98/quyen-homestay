import {
  Backdrop,
  Button,
  Divider,
  Fade,
  Grid,
  Modal,
  Stack,
  Typography
} from '@mui/material';
import CardContent from '@mui/material/CardContent';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { Form, Formik } from 'formik';
import { useEffect, useMemo, useState } from 'react';
import * as Yup from 'yup';

import FormInputCommon from 'components/field/FormInputCommon';
import MainCard from 'components/MainCard';
import {
  fetchContacts,
  fetchContracts,
  fetchCustomer,
  fetchLocation,
  getDepartment
} from 'services/customers';
import { addOrders, fetchCompanyEmployeeList } from 'services/orders';
import {
  ContactInfoProps,
  ContractInfoProps,
  CustomerInfoProps,
  LocationInfoProps
} from 'types/customer';
import {
  compareFields,
  FieldConfig,
  formFields,
  orderTypeOptions
} from './OrderFieldConfigs';

interface OrderModalActionProps {
  type: 'create' | 'edit';
  open: boolean;
  onClose: () => void;
  initialData?: Record<string, any> | null;
  onSuccess: () => void;
}

export default function OrderModalAction({
  type,
  open,
  onClose,
  initialData,
  onSuccess
}: OrderModalActionProps) {
  const [customers, setCustomers] = useState<CustomerInfoProps[]>([]);
  const [contacts, setContacts] = useState<ContactInfoProps[]>([]);
  const [locations, setLocations] = useState<LocationInfoProps[]>([]);
  const [contracts, setContracts] = useState<ContractInfoProps[]>([]);
  const [departments, setDepartments] = useState<
    { id: string | number; brandName: string }[]
  >([]);
  const [employees, setEmployees] = useState<any[]>([]);

  const buildInitialValues = () => {
    const all = [...formFields, ...compareFields];
    const base: Record<string, any> = { batchType: orderTypeOptions[0].value };
    all.forEach((f) => {
      if (f.type === 'checkbox') base[f.name] = !!f.defaultValue;
      else if (f.type === 'date') base[f.name] = null;
      else base[f.name] = f.defaultValue ?? '';
    });
    return base;
  };

  const initialValues = useMemo(() => {
    if (!initialData) return buildInitialValues();

    const fixed = { ...buildInitialValues(), ...initialData };
    [
      'monitoringDate',
      'sampleReceiptDate',
      'resultDeliveryDate',
      'internalResultDeliveryDate',
      'actualResultDeliveryDate',
      'sampleDisposalDate',
      'analysisDate'
    ].forEach((k) => {
      if (fixed[k]) fixed[k] = dayjs(fixed[k]);
    });
    return fixed;
  }, [initialData]);

  const validationSchema = Yup.object({
    name: Yup.string().required('Bạn chưa nhập Tên'),
    clientId: Yup.number()
      .typeError('Bạn chưa chọn Khách hàng')
      .required('Bạn chưa chọn Khách hàng'),
    monitoringDate: Yup.date().required('Bạn chưa nhập Ngày quan trắc'),
    sampleReceiptDate: Yup.date().required('Bạn chưa nhập Ngày nhận mẫu'),
    resultDeliveryDate: Yup.date().required('Bạn chưa nhập Ngày trả kết quả')
  });

  useEffect(() => {
    (async () => {
      const [cus, dep, emp] = await Promise.all([
        fetchCustomer({ page: 1, size: 1000000 }),
        getDepartment(),
        fetchCompanyEmployeeList({ page: 1, size: 1000000 }),
      ]);
      setCustomers(cus.data.content);
      setDepartments(dep.data ?? []);
      setEmployees(emp.data.content);
    })();
  }, []);

  const toOptions = (src: any[], labelKey = 'name') =>
    src.map((i) => ({ label: i[labelKey], value: i.id }));

  const buildFieldOptions = (
    field: FieldConfig
  ): Array<{ label: string; value: any }> => {
    switch (field.name) {
      case 'clientId':
        return toOptions(customers);
      case 'clientContactId':
        return toOptions(contacts);
      case 'clientLocationId':
        return toOptions(locations);
      case 'clientContractId':
        return toOptions(contracts);
      case 'departmentId':
        return departments.map((d) => ({ label: d.brandName, value: d.id }));
      case 'monitoringSupervisor':
      case 'qaQcOfficer':
      case 'salesManager':
      case 'resultApprovalOfficer':
        return employees.map((e) => ({
          label: `${e.login ?? ''} `,
          value: e.id
        }));
      default:
        return (field.options || []).map((o) =>
          typeof o === 'string' ? { label: o, value: o } : (o as any)
        );
    }
  };

  const renderField = (field: FieldConfig, formik: any) => {
    const { values, errors, touched, setFieldValue } = formik;
    const opts = buildFieldOptions(field);

    const disabled =
      !values.clientId &&
      ['clientContactId', 'clientContractId', 'clientLocationId'].includes(field.name);

    return (
      <FormInputCommon
        key={field.name}
        type={field.type === 'select' ? 'autocomplete' : (field.type as any)}
        label={field.defaultMessage}
        name={field.name}
        value={values[field.name]}
        options={opts}
        placeholder={field.placeholder}
        error={touched[field.name] && Boolean(errors[field.name])}
        helperText={touched[field.name] && (errors[field.name] as any)}
        disabled={disabled}
        onChange={(e: any) => {
          if (field.type === 'date') {
            setFieldValue(field.name, e);
          } else if (field.type === 'checkbox') {
            setFieldValue(field.name, e.target.checked);
          }
          else {
            setFieldValue(field.name, e?.target?.value ?? '');
          }
        }}
        onClear={() => setFieldValue(field.name, field.type === 'checkbox' ? false : '')}
        isRequired={field.required}
      />
    );
  };

  const prepareSubmit = (vals: Record<string, any>) => {
    const dateKeys = [
      'monitoringDate',
      'sampleReceiptDate',
      'resultDeliveryDate',
      'internalResultDeliveryDate',
      'actualResultDeliveryDate',
      'sampleDisposalDate',
      'analysisDate'
    ];

    return Object.entries(vals).reduce<Record<string, any>>((acc, [k, v]) => {
      if (v === '' || v === undefined || v === null) return acc;
      acc[k] = dateKeys.includes(k)
        ? dayjs(v).format('YYYY-MM-DD HH:mm:ss')
        : v;
      return acc;
    }, {});
  };

  return (
    <Modal
      open={open}
      onClose={(_, reason) => {
        if (reason !== 'backdropClick') onClose();
      }}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{ backdrop: { timeout: 300 } }}
    >
      <Fade in={open}>
        <MainCard
          modal
          darkTitle
          content={false}
          title={type === 'edit' ? 'Cập nhật đơn hàng' : 'Tạo đơn hàng'}
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: 1200,
            maxHeight: '96vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              validateOnBlur
              onSubmit={async (vals, { setSubmitting }) => {
                try {
                  await addOrders({ ...prepareSubmit(vals), status: 1 });
                  onSuccess();
                  onClose();
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {(formik) => {
                useEffect(() => {
                  if (!formik.values.clientId) return;

                  const loadDependencies = async () => {
                    const [contactRes, locationRes, contractRes] =
                      await Promise.all([
                        fetchContacts(formik.values.clientId, {
                          page: 1,
                          size: 100000
                        }),
                        fetchLocation(formik.values.clientId, {
                          page: 1,
                          size: 100000
                        }),
                        fetchContracts(formik.values.clientId, {
                          page: 1,
                          size: 100000
                        })
                      ]);

                    setContacts(contactRes.data.content);
                    setLocations(locationRes.data.content);
                    setContracts(
                      contractRes.data.content.map((i: any) => ({
                        ...i,
                        name: i.contractNo
                      }))
                    );

                    if (
                      initialData &&
                      formik.values.clientId !== initialData.clientId
                    ) {
                      formik.setFieldValue('clientContactId', '');
                      formik.setFieldValue('clientLocationId', '');
                      formik.setFieldValue('clientContractId', '');
                    }
                  };

                  loadDependencies();
                }, [formik.values.clientId]);

                return (
                  <Form
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%'
                    }}
                  >
                    <CardContent sx={{ flex: 1, overflowY: 'auto' }}>
                      <Grid container spacing={3}>
                        {formFields.map((f) => (
                          <Grid item xs={12} md={6} key={f.name}>
                            {renderField(f, formik)}
                          </Grid>
                        ))}

                        <Grid item xs={12}>
                          <FormInputCommon
                            type="radio"
                            label="Loại đơn hàng"
                            name="batchType"
                            value={formik.values.batchType}
                            options={orderTypeOptions}
                            onChange={formik.handleChange}
                          />
                        </Grid>
                      </Grid>

                      <Divider sx={{ my: 3 }} />
                      <Typography fontWeight="bold" gutterBottom>
                        So sánh với đơn hàng
                      </Typography>
                      <Grid container spacing={2}>
                        {compareFields.map((f) => (
                          <Grid item xs={12} md={6} key={f.name}>
                            {renderField(f, formik)}
                          </Grid>
                        ))}
                      </Grid>
                    </CardContent>

                    <Divider />
                    <Stack
                      direction="row"
                      justifyContent="flex-end"
                      spacing={2}
                      sx={{ px: 2.5, py: 2 }}
                    >
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={onClose}
                        disabled={formik.isSubmitting}
                      >
                        Hủy
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={formik.isSubmitting}
                      >
                        Lưu
                      </Button>
                    </Stack>
                  </Form>
                );
              }}
            </Formik>
          </LocalizationProvider>
        </MainCard>
      </Fade>
    </Modal>
  );
}
