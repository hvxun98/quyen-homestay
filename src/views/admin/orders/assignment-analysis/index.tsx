'use client';

import AddIcon from '@mui/icons-material/Add';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PrintIcon from '@mui/icons-material/Print';
import {
  Backdrop,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import FormInputCommon from 'components/field/FormInputCommon';
import dayjs, { Dayjs } from 'dayjs';
import { useFormik } from 'formik';
import { useParams } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import { fetchCompanyEmployeeList, getAssignmentAnalysis } from 'services/orders';
import { objectToQueryString } from 'utils/function';
import * as Yup from 'yup';

// Types
interface Employee {
  id: number;
  name: string;
  login?: string;
}

interface AnalysisService {
  analyst: number;
  hiddenTimeMonitoring: boolean;
  order: number;
  prefix: string;
  result: string;
  resultAnalysisServiceId: number;
  resultAnalysisServiceName: string;
  resultAnalysisServiceParentId: number;
  resultAssignBatchExtractAnalysisServiceId: number;
  resultAssignId: number;
  subContractorId: number;
  typeSample: boolean;
  unit?: string;
  isNew?: boolean;
  id?: number;
  children?: AnalysisService[]; // Sub-analyses for this service
  isExpanded?: boolean; // To track expand/collapse state
  parentId?: number; // Reference to parent service
  isChild?: boolean; // Flag to identify child rows
}

interface AssignmentData {
  assignResultId: number;
  batchResultAnalysisServiceDtoList: AnalysisService[];
  clientLocationSampleId: number;
  clientLocationSampleName: string;
  envCondition: string;
  latitude: string;
  longitude: string;
  monitoringDate: string;
  requestCode: string;
  resultDeliveryDate: string;
  sampleCode: string;
  sampleReceiptDate: string;
  sampleTypeId: number;
  sampleTypeName: string;
  sampleWeight: string;
  upHeightPrint: string;
}

interface FormValues {
  sampleCode: string;
  sampler: string;
  envCondition: string;
  sampleWeight: string;
  latitude: string;
  longitude: string;
  upHeightPrint: string;
  monitoringDate: Dayjs | null;
  sampleStatus: string;
  dateSample2: Dayjs | null;
  resultDeliveryDate: Dayjs | null;
  dateSample3: Dayjs | null;
  sampleReceiptDate: string;
  codeInserted: string;
  requestCode: string;
  beforeImage: File | null;
  afterImage: File | null;
  currentLocation: string;
  currentSampleType: string;
  batchResultAnalysisServiceDtoList: AnalysisService[];
}

interface AssignmentAnalysisProps {
  orderId?: string | number;
  getAssignmentAnalysis: (orderId: number, params: string) => Promise<{ data: AssignmentData }>;
  fetchCompanyEmployeeList: (params: { page: number; size: number }) => Promise<{ data: { content: Employee[] } }>;
  objectToQueryString: (obj: Record<string, any>) => string;
}

const AssignmentAnalysis: React.FC<AssignmentAnalysisProps> = () => {
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [assignmentData, setAssignmentData] = useState<AssignmentData | null>(null);

  // Form validation schema
  const validationSchema = Yup.object({
    sampleCode: Yup.string().required('Bạn chưa nhập mã mẫu'),
    monitoringDate: Yup.date().required('Bạn chưa chọn ngày lấy mẫu'),
    resultDeliveryDate: Yup.date().required('Bạn chưa chọn ngày trả kết quả')
  });

  // Process services data to group children under parents
  const processServicesData = (services: AnalysisService[]): AnalysisService[] => {
    // Group services by their parent ID
    const servicesByParentId = new Map<number, AnalysisService[]>();
    const allServices: AnalysisService[] = [];

    // First, separate parent and child services
    services.forEach((service) => {
      const processedService = {
        ...service,
        id: service.resultAnalysisServiceId,
        isNew: false,
        unit: service.unit || 'mg/L',
        children: [],
        isExpanded: false,
        isChild: false
      };

      // Check if this service has a parent
      if (service.resultAnalysisServiceParentId && service.resultAnalysisServiceParentId > 0) {
        // This is a child service
        processedService.isChild = true;
        processedService.parentId = service.resultAnalysisServiceParentId;

        // Group by parent ID
        if (!servicesByParentId.has(service.resultAnalysisServiceParentId)) {
          servicesByParentId.set(service.resultAnalysisServiceParentId, []);
        }
        servicesByParentId.get(service.resultAnalysisServiceParentId)!.push(processedService);
      } else {
        // This is a parent service (resultAnalysisServiceParentId is 0 or null)
        allServices.push(processedService);
      }
    });

    // Now check if any service that was marked as parent in resultAnalysisServiceParentId
    // but doesn't exist as a standalone service needs to be created
    servicesByParentId.forEach((children, parentId) => {
      // Find if this parent exists in our services
      let parentService = allServices.find(s => s.resultAnalysisServiceId === parentId);

      if (!parentService) {
        // Parent doesn't exist as a standalone record, but we have children referencing it
        // Use the first child's data to create a parent
        const firstChild = children[0];
        parentService = {
          ...firstChild,
          id: parentId,
          resultAnalysisServiceId: parentId,
          resultAnalysisServiceParentId: 0,
          isChild: false,
          children: [],
          isExpanded: false,
          prefix: '',
          result: '',
          // Keep the same name from children
          resultAnalysisServiceName: firstChild.resultAnalysisServiceName
        };
        allServices.push(parentService);
      }

      // Assign children to parent
      parentService.children = children;
    });

    // Sort by order
    allServices.sort((a, b) => (a.order || 0) - (b.order || 0));

    return allServices;
  };

  const formik = useFormik<FormValues>({
    initialValues: {
      sampleCode: '',
      sampler: '',
      envCondition: '',
      sampleWeight: '',
      latitude: '',
      longitude: '',
      upHeightPrint: '',
      monitoringDate: dayjs(),
      sampleStatus: '',
      dateSample2: null,
      resultDeliveryDate: null,
      dateSample3: null,
      sampleReceiptDate: '',
      codeInserted: '',
      requestCode: '',
      beforeImage: null,
      afterImage: null,
      currentLocation: '1A',
      currentSampleType: 'Nước thải sinh hoạt',
      batchResultAnalysisServiceDtoList: []
    },
    validationSchema,
    onSubmit: async (values) => {
      console.log('Submitting values:', values);
      // Handle form submission
    }
  });

  const { orderId } = useParams()
  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = {
          sampleType: 11,
          clientLocationSampleId: 14
        };
        setLoading(true);
        const [empResult, assignmentResult] = await Promise.all([
          fetchCompanyEmployeeList({ page: 1, size: 1000000 }),
          orderId ? getAssignmentAnalysis(Number(orderId), objectToQueryString(params)) : Promise.resolve(null)
        ]);

        setEmployees(empResult.data.content);

        if (assignmentResult?.data) {
          setAssignmentData(assignmentResult.data);

          const newValues: FormValues = {
            sampleCode: assignmentResult.data.sampleCode || '',
            sampler: '',
            envCondition: assignmentResult.data.envCondition || '',
            sampleWeight: assignmentResult.data.sampleWeight || '',
            latitude: assignmentResult.data.latitude || '',
            longitude: assignmentResult.data.longitude || '',
            upHeightPrint: assignmentResult.data.upHeightPrint || '',
            monitoringDate: assignmentResult.data.monitoringDate ? dayjs(assignmentResult.data.monitoringDate) : dayjs(),
            sampleStatus: '',
            dateSample2: null,
            resultDeliveryDate: assignmentResult.data.resultDeliveryDate ? dayjs(assignmentResult.data.resultDeliveryDate) : null,
            dateSample3: null,
            sampleReceiptDate: assignmentResult.data.sampleReceiptDate || '',
            codeInserted: '',
            requestCode: assignmentResult.data.requestCode || '',
            beforeImage: null,
            afterImage: null,
            currentLocation: assignmentResult.data.clientLocationSampleName || '1A',
            currentSampleType: assignmentResult.data.sampleTypeName || 'Nước thải sinh hoạt',
            batchResultAnalysisServiceDtoList: processServicesData(assignmentResult.data.batchResultAnalysisServiceDtoList)
          };

          formik.setValues(newValues);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [orderId]);

  const handleAddRow = () => {
    const newRow: AnalysisService = {
      id: Date.now(),
      analyst: 0,
      hiddenTimeMonitoring: false,
      order: formik.values.batchResultAnalysisServiceDtoList.length + 1,
      prefix: '',
      result: '',
      resultAnalysisServiceId: Date.now(),
      resultAnalysisServiceName: '',
      resultAnalysisServiceParentId: 0,
      resultAssignBatchExtractAnalysisServiceId: 0,
      resultAssignId: 0,
      subContractorId: 1,
      typeSample: false,
      unit: 'mg/L',
      isNew: true,
      children: [],
      isExpanded: false,
      isChild: false
    };

    formik.setFieldValue('batchResultAnalysisServiceDtoList', [
      ...formik.values.batchResultAnalysisServiceDtoList,
      newRow
    ]);
  };

  const handleAddSubRow = (parentIndex: number) => {
    const parentService = formik.values.batchResultAnalysisServiceDtoList[parentIndex];
    const newSubRow: AnalysisService = {
      id: Date.now(),
      analyst: parentService.analyst, // Inherit from parent
      hiddenTimeMonitoring: parentService.hiddenTimeMonitoring,
      order: (parentService.children?.length || 0) + 1,
      prefix: '',
      result: '',
      resultAnalysisServiceId: Date.now(),
      resultAnalysisServiceName: `Lần ${(parentService.children?.length || 0) + 1}`,
      resultAnalysisServiceParentId: parentService.resultAnalysisServiceId,
      resultAssignBatchExtractAnalysisServiceId: 0,
      resultAssignId: 0,
      subContractorId: parentService.subContractorId,
      typeSample: parentService.typeSample,
      unit: parentService.unit,
      isNew: true,
      isChild: true,
      parentId: parentService.resultAnalysisServiceId
    };

    const updatedList = [...formik.values.batchResultAnalysisServiceDtoList];
    if (!updatedList[parentIndex].children) {
      updatedList[parentIndex].children = [];
    }
    updatedList[parentIndex].children!.push(newSubRow);
    updatedList[parentIndex].isExpanded = true;

    formik.setFieldValue('batchResultAnalysisServiceDtoList', updatedList);
  };

  const toggleExpand = (index: number) => {
    const updatedList = [...formik.values.batchResultAnalysisServiceDtoList];
    updatedList[index].isExpanded = !updatedList[index].isExpanded;
    formik.setFieldValue('batchResultAnalysisServiceDtoList', updatedList);
  };

  const handleDeleteRow = (index: number, parentIndex?: number) => {
    if (parentIndex !== undefined) {
      // Delete child row
      const updatedList = [...formik.values.batchResultAnalysisServiceDtoList];
      updatedList[parentIndex].children = updatedList[parentIndex].children?.filter((_, i) => i !== index);
      formik.setFieldValue('batchResultAnalysisServiceDtoList', updatedList);
    } else {
      // Delete parent row (and all its children)
      const newList = formik.values.batchResultAnalysisServiceDtoList.filter((_, i) => i !== index);
      formik.setFieldValue('batchResultAnalysisServiceDtoList', newList);
    }
  };

  const handleServiceChange = (index: number, field: keyof AnalysisService, value: any, parentIndex?: number) => {
    const updatedList = [...formik.values.batchResultAnalysisServiceDtoList];

    if (parentIndex !== undefined) {
      // Update child row
      if (updatedList[parentIndex].children && updatedList[parentIndex].children![index]) {
        updatedList[parentIndex].children![index] = {
          ...updatedList[parentIndex].children![index],
          [field]: value
        };
      }
    } else {
      // Update parent row
      updatedList[index] = { ...updatedList[index], [field]: value };

      // If updating certain fields, apply to all children
      if (['analyst', 'unit', 'subContractorId'].includes(field) && updatedList[index].children) {
        updatedList[index].children = updatedList[index].children!.map(child => ({
          ...child,
          [field]: value
        }));
      }
    }

    formik.setFieldValue('batchResultAnalysisServiceDtoList', updatedList);
  };

  const employeeOptions = useMemo(() =>
    employees.map(emp => ({
      label: emp.login || emp.name,
      value: emp.id
    })), [employees]
  );

  if (loading) {
    return (
      <Backdrop open={loading} sx={{ zIndex: 9999 }}>
        <CircularProgress color="inherit" />
      </Backdrop>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Phần công/kết quả phân tích
          </Typography>

          {/* Header Section */}
          <Box sx={{ bgcolor: '#e8f5e9', p: 2, mb: 3, borderRadius: 1 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={1}>
                <Typography fontWeight="bold">Vị trí</Typography>
              </Grid>
              <Grid item xs={3}>
                <Select
                  size="small"
                  fullWidth
                  value={formik.values.currentLocation}
                  onChange={(e) => formik.setFieldValue('currentLocation', e.target.value)}
                >
                  <MenuItem value="1A">1A</MenuItem>
                  <MenuItem value="1B">1B</MenuItem>
                  <MenuItem value="2A">2A</MenuItem>
                </Select>
              </Grid>
              <Grid item xs={8}>
                <Typography>
                  <strong>Loại mẫu:</strong> {formik.values.currentSampleType}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  * Phần mềm sẽ tự động lưu kết quả khi bạn thay đổi vị trí
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Mã hóa mẫu: 02W2504.0618
          </Typography>

          {/* Form Fields */}
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormInputCommon
                type="text"
                label="Mã mẫu của khách"
                name="sampleCode"
                value={formik.values.sampleCode}
                onChange={(e: any) => formik.setFieldValue('sampleCode', e?.target?.value ?? '')}
                onBlur={formik.handleBlur}
                error={formik.touched.sampleCode && Boolean(formik.errors.sampleCode)}
                helperText={formik.touched.sampleCode && formik.errors.sampleCode}
                onClear={() => formik.setFieldValue('sampleCode', '')}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormInputCommon
                type="autocomplete"
                label="Người lấy mẫu"
                name="sampler"
                value={formik.values.sampler}
                options={employeeOptions}
                onChange={(e: any) => formik.setFieldValue('sampler', e?.target?.value ?? '')}
                placeholder="Chọn người lấy mẫu"
                onClear={() => formik.setFieldValue('sampler', '')}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormInputCommon
                type="text"
                label="Tình trạng, đặc điểm mẫu"
                name="envCondition"
                value={formik.values.envCondition}
                onChange={(e: any) => formik.setFieldValue('envCondition', e?.target?.value ?? '')}
                onClear={() => formik.setFieldValue('envCondition', '')}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormInputCommon
                type="text"
                label="Lượng mẫu"
                name="sampleWeight"
                value={formik.values.sampleWeight}
                onChange={(e: any) => formik.setFieldValue('sampleWeight', e?.target?.value ?? '')}
                placeholder="Khối lượng mẫu"
                onClear={() => formik.setFieldValue('sampleWeight', '')}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormInputCommon
                type="text"
                label="Vĩ độ (X)"
                name="latitude"
                value={formik.values.latitude}
                onChange={(e: any) => formik.setFieldValue('latitude', e?.target?.value ?? '')}
                onClear={() => formik.setFieldValue('latitude', '')}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormInputCommon
                type="text"
                label="Kinh độ (Y)"
                name="longitude"
                value={formik.values.longitude}
                onChange={(e: any) => formik.setFieldValue('longitude', e?.target?.value ?? '')}
                onClear={() => formik.setFieldValue('longitude', '')}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormInputCommon
                type="text"
                label="Tầng chiều cao động in"
                name="upHeightPrint"
                value={formik.values.upHeightPrint}
                onChange={(e: any) => formik.setFieldValue('upHeightPrint', e?.target?.value ?? '')}
                onClear={() => formik.setFieldValue('upHeightPrint', '')}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormInputCommon
                type="date"
                label="Ngày lấy mẫu"
                name="monitoringDate"
                value={formik.values.monitoringDate}
                onChange={(date) => formik.setFieldValue('monitoringDate', date)}
                error={formik.touched.monitoringDate && Boolean(formik.errors.monitoringDate)}
                helperText={formik.touched.monitoringDate && formik.errors.monitoringDate}
                isRequired
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormInputCommon
                type="autocomplete"
                label="Điều kiện môi trường"
                name="sampleStatus"
                value={formik.values.sampleStatus}
                options={[
                  { label: 'Điều kiện môi trường', value: '' }
                ]}
                onChange={(e: any) => formik.setFieldValue('sampleStatus', e?.target?.value ?? '')}
                placeholder="Chọn điều kiện"
                onClear={() => formik.setFieldValue('sampleStatus', '')}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormInputCommon
                type="date"
                label="Ngày lấy mẫu (lần 2)"
                name="dateSample2"
                value={formik.values.dateSample2}
                onChange={(date) => formik.setFieldValue('dateSample2', date)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormInputCommon
                type="date"
                label="Ngày trả kết quả"
                name="resultDeliveryDate"
                value={formik.values.resultDeliveryDate}
                onChange={(date) => formik.setFieldValue('resultDeliveryDate', date)}
                error={formik.touched.resultDeliveryDate && Boolean(formik.errors.resultDeliveryDate)}
                helperText={formik.touched.resultDeliveryDate && formik.errors.resultDeliveryDate}
                isRequired
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormInputCommon
                type="date"
                label="Ngày lấy mẫu (lần 3)"
                name="dateSample3"
                value={formik.values.dateSample3}
                onChange={(date) => formik.setFieldValue('dateSample3', date)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormInputCommon
                type="text"
                label="Ngày nhận mẫu"
                name="sampleReceiptDate"
                value={formik.values.sampleReceiptDate}
                onChange={(e: any) => formik.setFieldValue('sampleReceiptDate', e?.target?.value ?? '')}
                placeholder="ngày/tháng/năm giờ:phút"
                onClear={() => formik.setFieldValue('sampleReceiptDate', '')}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormInputCommon
                type="text"
                label="Số phiếu chèn"
                name="codeInserted"
                value={formik.values.codeInserted}
                onChange={(e: any) => formik.setFieldValue('codeInserted', e?.target?.value ?? '')}
                onClear={() => formik.setFieldValue('codeInserted', '')}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography fontWeight="bold" fontSize={14}>
                    Ảnh trước thử nghiệm
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Button
                    variant="outlined"
                    size="small"
                    component="label"
                    startIcon={<CloudUploadIcon />}
                  >
                    Choose File
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          formik.setFieldValue('beforeImage', e.target.files[0]);
                        }
                      }}
                    />
                  </Button>
                  {formik.values.beforeImage && (
                    <Typography variant="caption" sx={{ ml: 1 }}>
                      {formik.values.beforeImage.name}
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} md={6}>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography fontWeight="bold" fontSize={14}>
                    Ảnh sau thử nghiệm
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Button
                    variant="outlined"
                    size="small"
                    component="label"
                    startIcon={<CloudUploadIcon />}
                  >
                    Choose File
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          formik.setFieldValue('afterImage', e.target.files[0]);
                        }
                      }}
                    />
                  </Button>
                  {formik.values.afterImage && (
                    <Typography variant="caption" sx={{ ml: 1 }}>
                      {formik.values.afterImage.name}
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          {/* Analysis Table */}
          <Box sx={{ mt: 4 }}>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell width={50}>#</TableCell>
                    <TableCell width={120}>Chỉ tiêu</TableCell>
                    <TableCell width={120}>Đơn vị</TableCell>
                    <TableCell width={100}>Mã mẫu phụ</TableCell>
                    <TableCell width={100}>Kết quả</TableCell>
                    <TableCell width={50} align="center">TT</TableCell>
                    <TableCell width={50} align="center">
                      <Checkbox />
                    </TableCell>
                    <TableCell>Ẩn lần quan trắc</TableCell>
                    <TableCell>Loại</TableCell>
                    <TableCell>Người phân tích</TableCell>
                    <TableCell>Thầu phụ</TableCell>
                    <TableCell width={50}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formik.values.batchResultAnalysisServiceDtoList.map((row, index) => (
                    <React.Fragment key={row.id}>
                      {/* Parent Row */}
                      <TableRow>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<AddIcon />}
                              onClick={() => handleAddSubRow(index)}
                              sx={{ minWidth: '120px', p: '2px 8px' }}
                            >
                              {row.resultAnalysisServiceName || `Ensc ${index + 1}`}
                            </Button>
                            {row.children && row.children.length > 0 && (
                              <IconButton
                                size="small"
                                onClick={() => toggleExpand(index)}
                                sx={{ p: 0.5 }}
                              >
                                {row.isExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                              </IconButton>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            value={row.unit || 'mg/L'}
                            onChange={(e) => handleServiceChange(index, 'unit', e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            placeholder="tiền tố"
                            value={row.prefix}
                            onChange={(e) => handleServiceChange(index, 'prefix', e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            placeholder="kết quả"
                            value={row.result}
                            onChange={(e) => handleServiceChange(index, 'result', e.target.value)}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <TextField
                            size="small"
                            type="number"
                            value={row.order}
                            onChange={(e) => handleServiceChange(index, 'order', parseInt(e.target.value))}
                            sx={{ width: 50 }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Checkbox
                            checked={row.typeSample}
                            onChange={(e) => handleServiceChange(index, 'typeSample', e.target.checked)}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              bgcolor: row.hiddenTimeMonitoring ? '#ffcdd2' : '#c8e6c9',
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                              display: 'inline-block'
                            }}
                          >
                            {row.hiddenTimeMonitoring ? 'HTM' : 'HT'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Select
                            size="small"
                            value="Trần Trung Kiên"
                            fullWidth
                          >
                            <MenuItem value="Trần Trung Kiên">Trần Trung Kiên</MenuItem>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            size="small"
                            value={row.analyst}
                            onChange={(e) => handleServiceChange(index, 'analyst', e.target.value)}
                            fullWidth
                          >
                            <MenuItem value={0}>Chọn người phân tích</MenuItem>
                            {employees.map(emp => (
                              <MenuItem key={emp.id} value={emp.id}>
                                {emp.login || emp.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            size="small"
                            value="VILAS"
                            fullWidth
                          >
                            <MenuItem value="VILAS">VILAS</MenuItem>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteRow(index)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>

                      {/* Child Rows */}
                      {row.isExpanded && row.children?.map((childRow, childIndex) => (
                        <TableRow key={childRow.id} sx={{ bgcolor: '#f5f5f5' }}>
                          <TableCell></TableCell>
                          <TableCell sx={{ pl: 4 }}>
                            <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                              — {childRow.resultAnalysisServiceName}
                            </Typography>
                          </TableCell>
                          <TableCell></TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              placeholder="tiền tố"
                              value={childRow.prefix}
                              onChange={(e) => handleServiceChange(childIndex, 'prefix', e.target.value, index)}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              placeholder="kết quả"
                              value={childRow.result}
                              onChange={(e) => handleServiceChange(childIndex, 'result', e.target.value, index)}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <TextField
                              size="small"
                              type="number"
                              value={childRow.order}
                              onChange={(e) => handleServiceChange(childIndex, 'order', parseInt(e.target.value), index)}
                              sx={{ width: 50 }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Checkbox
                              checked={childRow.typeSample}
                              onChange={(e) => handleServiceChange(childIndex, 'typeSample', e.target.checked, index)}
                            />
                          </TableCell>
                          <TableCell colSpan={4}></TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteRow(childIndex, index)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </React.Fragment>
                  ))}
                  <TableRow>
                    <TableCell>{formik.values.batchResultAnalysisServiceDtoList.length + 1}</TableCell>
                    <TableCell colSpan={11}>
                      <Button
                        startIcon={<AddIcon />}
                        onClick={handleAddRow}
                        color="primary"
                      >
                        Thêm dòng
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Action Buttons */}
          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <Button variant="contained" color="primary" onClick={() => formik.handleSubmit()}>
              Lưu & thoát
            </Button>
            <Button variant="outlined">Lưu</Button>
            <Button variant="outlined" startIcon={<PrintIcon />}>
              In ấn
            </Button>
          </Stack>

          {/* Footer Info */}
          <Box sx={{ mt: 3, p: 2, bgcolor: '#e3f2fd', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Sử dụng 'Người phân tích' mặc định cho các chỉ tiêu chưa có
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sử dụng phương pháp mặc định trong cài đặt
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </LocalizationProvider>
  );
};

export default AssignmentAnalysis;