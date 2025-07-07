import DeleteIcon from '@mui/icons-material/Delete';
import { Backdrop, Box, Button, Divider, Fade, Grid, IconButton, Modal, Stack, Tab, Tabs, Typography } from '@mui/material';
import CardContent from '@mui/material/CardContent';
import FormInputCommon from 'components/field/FormInputCommon';
import MainCard from 'components/MainCard';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { createSampleTemplate, fetchAnalysisCategory, fetchAnalysisService, getSampleTypes, updateSampleTemplate } from 'services/setting';
import * as Yup from 'yup';

interface SampleBreakdownTemplateModalActionProps {
  type: 'create' | 'edit';
  buttonProps?: any;
  initialData?: any;
  onClose?: () => void;
  reload: boolean;
  setReload: (val: boolean) => void;
}

interface FormValues {
  name: string;
  sampleTypeId: number | null;
  description: string;
}

export default function SampleBreakdownTemplateModalAction({
  type,
  buttonProps,
  initialData,
  onClose,
  reload,
  setReload
}: SampleBreakdownTemplateModalActionProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const [sampleTypes, setSampleTypes] = useState<any[]>([]);
  const [analysisCategories, setAnalysisCategories] = useState<any[]>([]);
  const [analysisServices, setAnalysisServices] = useState<any[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [selectedIndicators, setSelectedIndicators] = useState<any[]>([]);

  const formik = useFormik<FormValues>({
    initialValues: {
      name: '',
      sampleTypeId: null,
      description: ''
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Vui lòng nhập tên')
    }),
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        const payload = {
          ...values,
          indicators: selectedIndicators.map((item) => item.id)
        };
        if (type === 'edit') {
          await updateSampleTemplate(initialData.id, payload);
        } else {
          await createSampleTemplate(payload);
        }
        setReload(!reload);
        handleClose();
      } catch (err) {
        console.error('Error saving template:', err);
      }
    }
  });

  const { values, handleChange, setFieldValue, touched, errors } = formik;

  const handleOpen = () => {
    setOpen(true);
    formik.resetForm();
    setSelectedGroupId(null);
    setSelectedServiceId(null);
    setSelectedIndicators([]);
    setAnalysisCategories([]);
    setAnalysisServices([]);
    getSampleTypes().then((res) => setSampleTypes(res.data || []));
  };

  const handleClose = () => {
    setOpen(false);
    formik.resetForm();
    setSelectedGroupId(null);
    setSelectedServiceId(null);
    setSelectedIndicators([]);
    setAnalysisCategories([]);
    setAnalysisServices([]);
  };

  useEffect(() => {
    if (initialData) {
      setOpen(true);
      formik.setValues(initialData);
      getSampleTypes().then((res) => setSampleTypes(res.data || []));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  useEffect(() => {
    if (values.sampleTypeId) {
      fetchAnalysisCategory({ sampleTypeId: values.sampleTypeId })
        .then((res) => setAnalysisCategories(res.data || []))
        .catch(console.error);
      setSelectedGroupId(null);
      setAnalysisServices([]);
      setSelectedServiceId(null);
    }
  }, [values.sampleTypeId]);

  useEffect(() => {
    if (values.sampleTypeId && selectedGroupId) {
      fetchAnalysisService({ sampleTypeId: values.sampleTypeId, groupId: selectedGroupId })
        .then((res) => setAnalysisServices(res.data || []))
        .catch(console.error);
      setSelectedServiceId(null);
    }
  }, [selectedGroupId, values.sampleTypeId]);

  const handleAddIndicator = () => {
    if (!selectedServiceId) return;
    const exists = selectedIndicators.some((i) => i.id === selectedServiceId);
    if (exists) return;
    const indicator = analysisServices.find((s) => s.id === selectedServiceId);
    if (indicator) {
      setSelectedIndicators((prev) => [...prev, indicator]);
    }
  };

  const handleRemoveIndicator = (id: number) => {
    setSelectedIndicators((prev) => prev.filter((i) => i.id !== id));
  };

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
          <MainCard
            title={type === 'edit' ? 'Cập nhật template' : 'Tạo mới template'}
            modal
            darkTitle
            content={false}
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90%',
              maxWidth: 800,
              height: '70vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <form onSubmit={formik.handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ px: 2, pt: 2 }}>
                <Tab label="Thông tin" />
                <Tab label="Danh sách chỉ tiêu" />
              </Tabs>
              <Divider />

              {tab === 0 && (
                <CardContent sx={{ flex: 1, overflowY: 'auto' }}>
                  <FormInputCommon
                    label="Tên"
                    name="name"
                    type="text"
                    value={values.name}
                    onChange={handleChange}
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                    placeholder="Nhập tên mẫu"
                    onClear={() => setFieldValue('name', '')}
                  />
                  <FormInputCommon
                    label="Loại mẫu"
                    name="sampleTypeId"
                    type="autocomplete"
                    value={values.sampleTypeId}
                    options={sampleTypes.map((s) => ({ label: s.name, value: s.id }))}
                    onChange={(e: any) => setFieldValue('sampleTypeId', e.target.value || null)}
                    onClear={() => {
                      setFieldValue('sampleTypeId', null);
                      setSelectedGroupId(null);
                      setSelectedServiceId(null);
                      setAnalysisCategories([]);
                      setAnalysisServices([]);
                    }}
                    placeholder="Chọn loại mẫu"
                  />
                  <FormInputCommon
                    label="Mô tả"
                    name="description"
                    type="text"
                    value={values.description}
                    onChange={handleChange}
                    placeholder="Nhập mô tả"
                    onClear={() => setFieldValue('description', '')}
                  />
                </CardContent>
              )}

              {tab === 1 && (
                <CardContent sx={{ flex: 1, overflowY: 'auto' }}>
                  <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <FormInputCommon
                        label="Nhóm chỉ tiêu"
                        name="analysisCategory"
                        type="autocomplete"
                        value={selectedGroupId}
                        options={analysisCategories.map((g) => ({ label: g.name, value: g.id }))}
                        onChange={(e: any) => setSelectedGroupId(e.target.value || null)}
                        onClear={() => {
                          setSelectedGroupId(null);
                          setAnalysisServices([]);
                        }}
                        placeholder="Chọn nhóm chỉ tiêu"
                        disabled={!values.sampleTypeId}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <FormInputCommon
                        label="Chỉ tiêu"
                        name="analysisService"
                        type="autocomplete"
                        value={selectedServiceId}
                        options={analysisServices.map((s) => ({ label: s.name, value: s.id }))}
                        onChange={(e: any) => setSelectedServiceId(e.target.value || null)}
                        onClear={() => setSelectedServiceId(null)}
                        placeholder="Chọn chỉ tiêu"
                        disabled={!selectedGroupId}
                      />
                    </Grid>
                  </Grid>

                  <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                    <Button variant="contained" color="success" onClick={handleAddIndicator}>
                      Thêm
                    </Button>
                    <Button variant="contained">Thêm tất cả</Button>
                  </Stack>

                  <Grid container spacing={2} sx={{ mb: 1 }}>
                    <Grid item xs={6}>
                      <Typography fontWeight={600}># Chỉ tiêu</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography fontWeight={600}>Loại</Typography>
                    </Grid>
                    {selectedIndicators.map((item, index) => (
                      <>
                        <Grid item xs={6}>
                          {index + 1}. {item.name}
                        </Grid>
                        <Grid item xs={6}>
                          <Stack direction="row" spacing={1}>
                            <Typography sx={{ bgcolor: 'green', px: 1, color: '#fff', borderRadius: 1 }} fontSize={13}>
                              {item.typeName || 'hiện trường'}
                            </Typography>
                            <IconButton size="small" color="error" onClick={() => handleRemoveIndicator(item.id)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </Grid>
                      </>
                    ))}
                  </Grid>
                </CardContent>
              )}

              <Divider />
              <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ px: 2.5, py: 2 }}>
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
    </Box>
  );
}
