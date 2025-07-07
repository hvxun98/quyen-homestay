import { Backdrop, Button, Divider, Fade, Grid, Modal, Stack, Typography } from '@mui/material';
import CardContent from '@mui/material/CardContent';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import FormInputCommon from 'components/field/FormInputCommon';
import MainCard from 'components/MainCard';
import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { useParams } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { addContract, editContract } from 'services/customers';
import * as Yup from 'yup';

interface ContractModalActionProps {
  type: 'create' | 'edit';
  open: boolean;
  initialData?: any;
  onClose: () => void;
  reload: boolean;
  setReload: (reload: boolean) => void;
}

interface ContractFormValues {
  contractNo: string;
  contractValue: string;
  dateSign: Date | null;
  dateLiquidation: Date | null;
  representativePartyA: string;
  representativePartyB: string;
  contractLink: string;
  liquidationLink: string;
  invoiceLink: string;
}

export default function ContractModalAction({ type, open, initialData, onClose, reload, setReload }: ContractModalActionProps) {
  const labelStyles = { fontWeight: 'bold', fontSize: 14 };
  const { customerId } = useParams();

  const formik = useFormik<ContractFormValues>({
    initialValues: {
      contractNo: '',
      contractValue: '',
      dateSign: null,
      dateLiquidation: null,
      representativePartyA: '',
      representativePartyB: '',
      contractLink: '',
      liquidationLink: '',
      invoiceLink: ''
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      contractNo: Yup.string().required('Vui lòng nhập số hợp đồng'),
      contractValue: Yup.string().required('Vui lòng nhập giá trị'),
      dateSign: Yup.date().nullable().required('Vui lòng chọn ngày ký')
    }),
    onSubmit: async (values) => {
      const dateKeys = ['dateSign', 'dateLiquidation'];
      const getParams = () => {
        return Object.entries(values).reduce<Record<string, any>>((acc, [k, v]) => {
          if (v === '' || v === undefined || v === null) return acc;
          acc[k] = dateKeys.includes(k) ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : v;
          return acc;
        }, {});
      };
      if (type === 'edit') {
        await editContract(Number(customerId), getParams());
      } else {
        await addContract(Number(customerId), getParams());
      }
      setReload(!reload);
      onClose();
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

  const { handleChange, values, touched, errors, handleSubmit, setFieldValue } = formik;

  const fields: { label: string; name: keyof ContractFormValues; placeholder: string }[] = useMemo(
    () => [
      { label: 'Số hợp đồng', name: 'contractNo', placeholder: 'Nhập số hợp đồng' },
      { label: 'Giá trị hợp đồng (đồng)', name: 'contractValue', placeholder: 'Nhập giá trị' },
      { label: 'Người ký bên A', name: 'representativePartyA', placeholder: 'Nhập người ký bên A' },
      { label: 'Người ký bên B', name: 'representativePartyB', placeholder: 'Nhập người ký bên B' },
      { label: 'Link hợp đồng', name: 'contractLink', placeholder: 'Nhập link hợp đồng' },
      { label: 'Link biên bản thanh lý', name: 'liquidationLink', placeholder: 'Nhập link biên bản thanh lý' },
      { label: 'Link hóa đơn', name: 'invoiceLink', placeholder: 'Nhập link hóa đơn' }
    ],
    []
  );

  const dateFields: { label: string; name: keyof ContractFormValues }[] = [
    { label: 'Ngày ký', name: 'dateSign' },
    { label: 'Ngày thanh lý', name: 'dateLiquidation' }
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
        <MainCard title={type === 'edit' ? 'Cập nhật hợp đồng' : 'Thêm hợp đồng'} modal darkTitle content={false}>
          <form onSubmit={handleSubmit}>
            <CardContent>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Grid container spacing={2}>
                  {fields.map(({ label, name, placeholder }) => (
                    <Grid item xs={12} md={6} key={name}>
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

                  {dateFields.map(({ label, name }) => (
                    <Grid container item xs={12} md={6} spacing={1} key={name} alignItems="center">
                      <Grid item xs={4}>
                        <Typography sx={labelStyles}>{label}</Typography>
                      </Grid>
                      <Grid item xs={8}>
                        <DatePicker
                          value={values[name] as Date | null}
                          onChange={(date) => setFieldValue(name, date)}
                          slotProps={{ textField: { size: 'small', fullWidth: true } }}
                        />
                      </Grid>
                    </Grid>
                  ))}
                </Grid>
              </LocalizationProvider>
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
