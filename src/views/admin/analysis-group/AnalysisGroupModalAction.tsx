'use client';

import { Backdrop, Box, Button, Divider, Fade, Grid, MenuItem, Modal, Stack, Tab, Tabs, TextField, Typography } from '@mui/material';
import CardContent from '@mui/material/CardContent';
import MainCard from 'components/MainCard';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import * as Yup from 'yup';

interface AnalysisGroupModalActionProps {
  type: 'create' | 'edit';
  buttonProps?: any;
  initialData?: any;
  onClose?: () => void;
  reload: boolean;
  setReload: (val: boolean) => void;
}

interface FormValues {
  name: string;
  description: string;
  resultForm: string;
  analysts: { id: number; name: string; default: boolean }[];
}

const inputStyles = { width: '100%', height: 40 };
const labelStyles = { fontWeight: 'bold', fontSize: 14 };

export default function AnalysisGroupModalAction({
  type,
  buttonProps,
  initialData,
  onClose,
  reload,
  setReload
}: AnalysisGroupModalActionProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(0);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    onClose?.();
  };

  const formik = useFormik<FormValues>({
    initialValues: {
      name: '',
      description: '',
      resultForm: '',
      analysts: []
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Vui lòng nhập tên')
    }),
    enableReinitialize: true,
    onSubmit: async (values) => {
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
  }, [initialData]);

  return (
    <Box>
      {buttonProps && type === 'create' && <Button {...buttonProps} onClick={handleOpen} />}

      <Modal
        open={open}
        onClose={handleClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{ backdrop: { timeout: 500 } }}
      >
        <Fade in={open}>
          <MainCard title={type === 'edit' ? 'Cập nhật nhóm chỉ tiêu phân tích' : 'Tạo mới'} modal darkTitle content={false}>
            <form onSubmit={formik.handleSubmit}>
              <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ px: 2, pt: 2 }}>
                <Tab label="Thông tin" />
                <Tab label="Người phân tích" />
              </Tabs>
              <Divider />
              {tab === 0 && (
                <CardContent>
                  {[
                    { label: 'Tên', name: 'name' },
                    { label: 'Mô tả', name: 'description' }
                  ].map(({ label, name }) => (
                    <Grid container item xs={12} spacing={1} alignItems="center" key={name} sx={{ mb: 2 }}>
                      <Grid item xs={2}>
                        <Typography sx={labelStyles}>{label}</Typography>
                      </Grid>
                      <Grid item xs={10}>
                        <TextField
                          name={name}
                          value={formik.values[name as keyof FormValues] as string}
                          onChange={formik.handleChange}
                          fullWidth
                          size="small"
                          sx={inputStyles}
                        />
                      </Grid>
                    </Grid>
                  ))}

                  <Grid container item xs={12} spacing={1} alignItems="center" sx={{ mb: 2 }}>
                    <Grid item xs={2}>
                      <Typography sx={labelStyles}>Mẫu phiếu kết quả</Typography>
                    </Grid>
                    <Grid item xs={10}>
                      <TextField
                        select
                        name="resultForm"
                        value={formik.values.resultForm}
                        onChange={formik.handleChange}
                        fullWidth
                        size="small"
                      >
                        <MenuItem value="">-không chọn-</MenuItem>
                        <MenuItem value="formA">Form A</MenuItem>
                        <MenuItem value="formB">Form B</MenuItem>
                      </TextField>
                    </Grid>
                  </Grid>
                </CardContent>
              )}
              {tab === 1 && (
                <CardContent>
                  <Box sx={{ backgroundColor: '#eaf4fb', p: 2, borderRadius: 1 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={6}>
                        <TextField select fullWidth size="small" label="Chọn nhân viên">
                          <MenuItem value="1">Nguyễn Văn A</MenuItem>
                          <MenuItem value="2">Trần Thị B</MenuItem>
                        </TextField>
                      </Grid>
                      <Grid item>
                        <Button variant="contained">Thêm</Button>
                      </Grid>
                    </Grid>
                  </Box>
                  <Grid container spacing={2} sx={{ mt: 2 }}>
                    <Grid item xs={6}>
                      <Typography fontWeight={600}>Tên</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography fontWeight={600}>Mặc định</Typography>
                    </Grid>
                  </Grid>
                  {formik.values.analysts.map((analyst, index) => (
                    <Grid container spacing={2} key={index}>
                      <Grid item xs={6}>
                        {analyst.name}
                      </Grid>
                      <Grid item xs={6}>
                        {analyst.default ? '✓' : ''}
                      </Grid>
                    </Grid>
                  ))}
                </CardContent>
              )}
              <Divider />
              <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ p: 2 }}>
                <Button variant="outlined" onClick={handleClose}>
                  Lưu & thoát
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
