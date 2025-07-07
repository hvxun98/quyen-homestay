'use client';

import {
  Backdrop, Button, Checkbox, Divider, Fade, FormControlLabel,
  Grid, Modal, Stack, Typography
} from '@mui/material';
import CardContent from '@mui/material/CardContent';
import FormInputCommon from 'components/field/FormInputCommon';
import MainCard from 'components/MainCard';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { fetchCompanyEmployeeList } from 'services/orders';
import { createAnalysisMethod, updateAnalysisMethod } from 'services/setting';
import * as Yup from 'yup';

interface AnalysisMethodProps {
  id?: number;
  name: string;
  description: string;
  environmentalAnalyst: number | string;
  attachmentFile?: string;
  reportTemp1?: number | null;
  reportTemp2?: number | null;
  status?: number | null;
  isokineticSampling?: boolean;
  rapidAirSampling?: boolean;
  subcontractorSampling?: boolean; // ✅ NEW
}

interface AnalysisMethodModalProps {
  type?: 'create' | 'edit';
  open: boolean;
  initialData?: AnalysisMethodProps | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AnalysisMethodModal({
  type = 'create',
  open,
  initialData,
  onClose,
  onSuccess
}: AnalysisMethodModalProps) {
  const [userList, setUserList] = useState<any[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchCompanyEmployeeList({ page: 1, size: 1000000 })
      .then((res) => {
        const list = res.data.content.map((e: any) => ({
          label: e.login ?? '',
          value: e.id
        }));
        setUserList(list);
      }).catch(() => { });
  }, []);

  const validationSchema = Yup.object({
    name: Yup.string().required('Vui lòng nhập tên'),
    environmentalAnalyst: Yup.number().required('Vui lòng chọn người phân tích')
  });

  const formik = useFormik<AnalysisMethodProps>({
    initialValues: {
      name: '',
      description: '',
      environmentalAnalyst: '',
      attachmentFile: '',
      reportTemp1: null,
      reportTemp2: null,
      status: 1,
      isokineticSampling: false,
      rapidAirSampling: false,
      subcontractorSampling: false // ✅ NEW
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values) => {
      const payload = {
        ...values,
        attachmentFile: uploadedFile?.name || values.attachmentFile || ''
      };

      try {
        if (type === 'edit' && initialData?.id) {
          await updateAnalysisMethod(initialData.id, payload);
        } else {
          await createAnalysisMethod(payload);
        }
        onSuccess();
      } catch (error) {
        console.error('Error saving analysis method:', error);
      }
    }
  });

  useEffect(() => {
    if (initialData) {
      formik.setValues(initialData);
    }
  }, [initialData]);

  useEffect(() => {
    if (!open) {
      formik.resetForm();
      setUploadedFile(null);
    }
  }, [open]);

  const { values, touched, errors, handleChange, setFieldValue } = formik;

  return (
    <Modal
      open={open}
      onClose={(_, reason) => reason !== 'backdropClick' && onClose()}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{ backdrop: { timeout: 500 } }}
    >
      <Fade in={open}>
        <MainCard
          title={type === 'edit' ? 'Cập nhật' : 'Tạo mới'}
          subheader="Thông tin phương pháp phân tích"
          modal
          darkTitle
          content={false}
          sx={{ width: 'auto', maxWidth: 600 }}
        >
          <form onSubmit={formik.handleSubmit}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormInputCommon
                    label="Tên phương pháp"
                    name="name"
                    type="text"
                    value={values.name}
                    onChange={handleChange}
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && (errors.name as string)}
                    isRequired
                    onClear={() => setFieldValue('name', '')}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormInputCommon
                    label="Mô tả"
                    name="description"
                    type="text"
                    value={values.description}
                    onChange={handleChange}
                    onClear={() => setFieldValue('description', '')}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormInputCommon
                    label="Người phân tích"
                    name="environmentalAnalyst"
                    type="autocomplete"
                    value={values.environmentalAnalyst}
                    options={userList}
                    placeholder="Chọn người phân tích"
                    error={touched.environmentalAnalyst && Boolean(errors.environmentalAnalyst)}
                    helperText={touched.environmentalAnalyst && (errors.environmentalAnalyst as string)}
                    onChange={(e: any) => {
                      setFieldValue('environmentalAnalyst', e?.target?.value || '');
                    }}
                    onClear={() => setFieldValue('environmentalAnalyst', '')}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Stack spacing={1}>
                    <Typography variant="body2" fontWeight={500}>
                      File đính kèm
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Button
                        variant="outlined"
                        component="label"
                        sx={{
                          textTransform: 'none',
                          color: 'text.secondary',
                          borderColor: 'divider',
                          '&:hover': {
                            borderColor: 'primary.main',
                            backgroundColor: 'transparent'
                          }
                        }}
                      >
                        Chọn file
                        <input
                          type="file"
                          hidden
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            setUploadedFile(file);
                            setFieldValue('attachmentFile', file?.name || '');
                          }}
                        />
                      </Button>
                      <Typography variant="caption" color="text.secondary">
                        {uploadedFile?.name || values.attachmentFile || 'Chưa chọn file'}
                      </Typography>
                    </Stack>
                  </Stack>
                </Grid>

                <Grid item xs={12}>
                  <FormInputCommon
                    label="Mẫu biên bản 1"
                    name="reportTemp1"
                    type="text"
                    value={values.reportTemp1 ?? ''}
                    onChange={handleChange}
                    onClear={() => setFieldValue('reportTemp1', null)}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormInputCommon
                    label="Mẫu biên bản 2"
                    name="reportTemp2"
                    type="text"
                    value={values.reportTemp2 ?? ''}
                    onChange={handleChange}
                    onClear={() => setFieldValue('reportTemp2', null)}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={values.isokineticSampling}
                        onChange={(e) => setFieldValue('isokineticSampling', e.target.checked)}
                      />
                    }
                    label="Phương pháp lấy mẫu khí: Đẳng động lực"
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={values.rapidAirSampling}
                        onChange={(e) => setFieldValue('rapidAirSampling', e.target.checked)}
                      />
                    }
                    label="Phương pháp lấy mẫu khí: Do nhanh"
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={values.subcontractorSampling}
                        onChange={(e) => setFieldValue('subcontractorSampling', e.target.checked)}
                      />
                    }
                    label="Phương pháp của nhà thầu phụ"
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
