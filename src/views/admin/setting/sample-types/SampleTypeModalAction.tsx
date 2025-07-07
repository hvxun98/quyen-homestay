import { Backdrop, Button, Divider, Fade, Grid, MenuItem, Modal, Stack, TextField, Typography } from '@mui/material';
import CardContent from '@mui/material/CardContent';
import MainCard from 'components/MainCard';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import * as Yup from 'yup';

interface SampleTypeModalActionProps {
  type: 'create' | 'edit';
  buttonProps?: any;
  initialData?: any;
  onClose?: () => void;
  reload: boolean;
  setReload: (val: boolean) => void;
}

interface FormValues {
  name: string;
  nameEn: string;
  description: string;
  hazardous: boolean;
  prefix: string;
  order: string;
  minQuantity: string;
  defaultTool: string;
  sampleAlt1: string;
  sampleAlt2: string;
}

const inputStyles = { width: '100%', height: 40 };
const labelStyles = { fontWeight: 'bold', fontSize: 14 };

export default function SampleTypeModalAction({ type, buttonProps, initialData, onClose, reload, setReload }: SampleTypeModalActionProps) {
  const [open, setOpen] = useState(false);
  const handleClose = () => {
    setOpen(false);
    onClose?.();
  };

  const formik = useFormik<FormValues>({
    initialValues: {
      name: '',
      nameEn: '',
      description: '',
      hazardous: false,
      prefix: '',
      order: '',
      minQuantity: '',
      defaultTool: '',
      sampleAlt1: '',
      sampleAlt2: ''
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Vui lòng nhập tên'),
      prefix: Yup.string(),
      order: Yup.string()
    }),
    enableReinitialize: true,
    onSubmit: (values) => {
      console.log(type === 'edit' ? 'Cập nhật:' : 'Tạo mới:', values);
      setReload(!reload);
      handleClose();
    }
  });

  useEffect(() => {
    if (initialData) {
      setOpen(true);
      formik.setValues(initialData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  return (
    <Modal open={open} onClose={handleClose} closeAfterTransition slots={{ backdrop: Backdrop }} slotProps={{ backdrop: { timeout: 500 } }}>
      <Fade in={open}>
        <MainCard title={type === 'edit' ? 'Cập nhật loại mẫu' : 'Tạo mới'} modal darkTitle content={false}>
          <form onSubmit={formik.handleSubmit}>
            <CardContent>
              <Grid container spacing={2}>
                {[
                  { label: 'Tên', name: 'name' },
                  { label: 'Tên tiếng Anh', name: 'nameEn' },
                  { label: 'Mô tả', name: 'description' },
                  { label: 'Tiền tố', name: 'prefix' },
                  { label: 'Thứ tự', name: 'order' },
                  { label: 'Số lượng tối thiểu', name: 'minQuantity' }
                ].map(({ label, name }) => (
                  <Grid container item xs={12} md={6} spacing={1} key={name} alignItems="center">
                    <Grid item xs={4}>
                      <Typography sx={labelStyles}>{label}</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <TextField
                        name={name}
                        value={formik.values[name as keyof FormValues] as string}
                        onChange={formik.handleChange}
                        fullWidth
                        variant="outlined"
                        size="small"
                        sx={inputStyles}
                      />
                    </Grid>
                  </Grid>
                ))}

                <Grid container item xs={12} md={6} spacing={1} alignItems="center">
                  <Grid item xs={4}>
                    <Typography sx={labelStyles}>Nguy hại</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <input
                      type="checkbox"
                      checked={formik.values.hazardous}
                      onChange={(e) => formik.setFieldValue('hazardous', e.target.checked)}
                    />
                  </Grid>
                </Grid>

                <Grid container item xs={12} md={6} spacing={1} alignItems="center">
                  <Grid item xs={4}>
                    <Typography sx={labelStyles}>Dụng cụ lưu mặc định</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <TextField
                      name="defaultTool"
                      select
                      fullWidth
                      size="small"
                      value={formik.values.defaultTool}
                      onChange={formik.handleChange}
                    >
                      <MenuItem value="">-không chọn-</MenuItem>
                      <MenuItem value="Dụng cụ chứa mẫu">Dụng cụ chứa mẫu</MenuItem>
                      <MenuItem value="Ống hấp thụ/Sorbent Tube">Ống hấp thụ/Sorbent Tube</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>

                {[1, 2].map((num) => {
                  const field = `sampleAlt${num}` as keyof FormValues;
                  return (
                    <Grid container item xs={12} md={6} spacing={1} key={num} alignItems="center">
                      <Grid item xs={4}>
                        <Typography sx={labelStyles}>{`Mẫu biên bản ${num}`}</Typography>
                      </Grid>
                      <Grid item xs={8}>
                        <TextField name={field} select fullWidth size="small" value={formik.values[field]} onChange={formik.handleChange}>
                          <MenuItem value="">-không chọn-</MenuItem>
                        </TextField>
                      </Grid>
                    </Grid>
                  );
                })}
              </Grid>
            </CardContent>
            <Divider />
            <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ p: 2 }}>
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
  );
}
