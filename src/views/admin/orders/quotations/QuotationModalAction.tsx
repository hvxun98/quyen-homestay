import { Backdrop, Button, CardContent, Divider, Fade, Grid, Modal, Stack } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import MainCard from 'components/MainCard';
import FormInputCommon from 'components/field/FormInputCommon';
import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { addQuotation, editQuotation } from 'services/quotations';
import * as Yup from 'yup';

export default function QuotationModalAction({
  open,
  onClose,
  initialData,
  reload,
  setReload
}: {
  open: boolean;
  onClose: () => void;
  initialData?: any;
  reload: boolean;
  setReload: (reload: boolean) => void;
}) {
  const isEdit = Boolean(initialData);

  const formik = useFormik({
    initialValues: {
      quotationNo: '',
      date: ''
    },
    validationSchema: Yup.object({
      quotationNo: Yup.string().required('Vui lòng nhập số báo giá'),
      date: Yup.string().required('Vui lòng nhập ngày báo giá')
    }),
    enableReinitialize: true,
    onSubmit: async (values) => {
      if (isEdit) {
        await editQuotation(initialData.id, values);
      } else {
        await addQuotation(values);
      }
      setReload(!reload);
      onClose();
    }
  });

  return (
    <Modal open={open} onClose={onClose} closeAfterTransition slots={{ backdrop: Backdrop }} slotProps={{ backdrop: { timeout: 500 } }}>
      <Fade in={open}>
        <MainCard title={isEdit ? 'Cập nhật báo giá' : 'Thêm báo giá'} modal darkTitle content={false} sx={{ width: 500 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <form onSubmit={formik.handleSubmit}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormInputCommon
                      label="Số báo giá"
                      name="quotationNo"
                      type="text"
                      value={formik.values.quotationNo}
                      onChange={formik.handleChange}
                      placeholder="Nhập số báo giá"
                      error={formik.touched.quotationNo && Boolean(formik.errors.quotationNo)}
                      helperText={formik.touched.quotationNo && formik.errors.quotationNo}
                      onClear={() => formik.setFieldValue('quotationNo', '')}
                      isRequired
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormInputCommon
                      label="Ngày báo giá"
                      name="date"
                      type="date"
                      value={formik.values.date ? dayjs(formik.values.date) : null}
                      onChange={(val: any) => formik.setFieldValue('date', val)}
                      placeholder="Chọn ngày"
                      error={formik.touched.date && Boolean(formik.errors.date)}
                      helperText={formik.touched.date && formik.errors.date}
                      onClear={() => formik.setFieldValue('date', '')}
                      isRequired
                    />
                  </Grid>
                </Grid>
              </CardContent>
              <Divider />
              <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ px: 2.5, py: 2 }}>
                <Button color="error" onClick={onClose}>
                  Hủy
                </Button>
                <Button type="submit" variant="contained">
                  Lưu
                </Button>
              </Stack>
            </form>
          </LocalizationProvider>
        </MainCard>
      </Fade>
    </Modal>
  );
}
