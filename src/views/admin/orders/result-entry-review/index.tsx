'use client';

import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Select,
  MenuItem,
  FormControl,
  Typography,
  Box,
  Button,
  IconButton,
  Checkbox,
  SelectChangeEvent
} from '@mui/material';
import {
  NavigateBefore,
  Save,
  Edit,
  CheckCircle
} from '@mui/icons-material';

// Types
interface RequestDetail {
  approve: boolean;
  result: string | null;
  prefix?: string;
  resultAnalysisServiceId: number;
  resultAnalysisServiceName: string;
  resultAnalysisServiceParentId: number;
  resultAssignBatchExtractAnalysisServiceId: number;
  resultAssignId: number;
  subContractorId?: number | null;
  unit?: string;
  method?: string;
  analysisMethodId?: number;
  subSampleCode?: string;
  description?: string;
}

interface RequestData {
  clientLocationSampleId: number;
  clientLocationSampleName: string;
  requestCode: string;
  requestDetailList: RequestDetail[];
  requestId: number;
  sampleTypeId: number;
}

interface BatchResultItem {
  resultAssignId: string;
  subSampleCode: string;
  prefix: string;
  result: string;
  analysisMethodId: number;
  subContractorId: number | null;
  approve: boolean;
  description: string;
}

// Mock data
const mockData: RequestData[] = [
  {
    "clientLocationSampleId": 14,
    "clientLocationSampleName": "Mẫu 2",
    "requestCode": "02A2504.744: 2",
    "requestDetailList": [
      {
        "approve": false,
        "result": null,
        "resultAnalysisServiceId": 2,
        "resultAnalysisServiceName": "Carbon monoxide (CO) - HT",
        "resultAnalysisServiceParentId": 0,
        "resultAssignBatchExtractAnalysisServiceId": 83,
        "resultAssignId": 119,
        "subContractorId": 1,
        "unit": "mg/Nm³",
        "analysisMethodId": 1,
        "subSampleCode": "HD-HTK1"
      },
      {
        "approve": false,
        "result": null,
        "resultAnalysisServiceId": 2,
        "resultAnalysisServiceName": "Nitơ oxit (NOx) (tính theo NO₂) - HT",
        "resultAnalysisServiceParentId": 1,
        "resultAssignBatchExtractAnalysisServiceId": 83,
        "resultAssignId": 120,
        "subContractorId": 1,
        "unit": "mg/Nm³",
        "analysisMethodId": 1,
        "subSampleCode": "HD-HTK1"
      },
      {
        "approve": false,
        "result": null,
        "resultAnalysisServiceId": 2,
        "resultAnalysisServiceName": "Antimon và hợp chất, tính theo Sb",
        "resultAnalysisServiceParentId": 2,
        "resultAssignBatchExtractAnalysisServiceId": 83,
        "resultAssignId": 121,
        "subContractorId": 1,
        "unit": "mg/Nm³",
        "analysisMethodId": 2,
        "subSampleCode": "US EPA 29",
        "method": "VIMCERTS 079"
      },
      {
        "approve": false,
        "result": null,
        "resultAnalysisServiceId": 6,
        "resultAnalysisServiceName": "Bụi tổng (PM)",
        "resultAnalysisServiceParentId": 0,
        "resultAssignBatchExtractAnalysisServiceId": 84,
        "resultAssignId": 122,
        "unit": "mg/Nm³",
        "analysisMethodId": 3,
        "subSampleCode": "US EPA 05",
        "method": "VIMCERTS 079"
      },
      {
        "approve": false,
        "result": null,
        "resultAnalysisServiceId": 6,
        "resultAnalysisServiceName": "Cadimi và hợp chất, tính theo Cd",
        "resultAnalysisServiceParentId": 1,
        "resultAssignBatchExtractAnalysisServiceId": 84,
        "resultAssignId": 123,
        "unit": "mg/Nm³",
        "analysisMethodId": 2,
        "subSampleCode": "US EPA 29",
        "method": "VIMCERTS 079"
      },
      {
        "approve": false,
        "result": null,
        "resultAnalysisServiceId": 6,
        "resultAnalysisServiceName": "Tổng các hợp chất hữu cơ bay hơi, VOCs",
        "resultAnalysisServiceParentId": 2,
        "resultAssignBatchExtractAnalysisServiceId": 84,
        "resultAssignId": 124,
        "unit": "mg/Nm³",
        "analysisMethodId": 4,
        "subSampleCode": "CEN/TS 13649:2014"
      },
      {
        "approve": false,
        "result": null,
        "resultAnalysisServiceId": 6,
        "resultAnalysisServiceName": "Tổng Dioxin/ Furan",
        "resultAnalysisServiceParentId": 3,
        "resultAssignBatchExtractAnalysisServiceId": 84,
        "resultAssignId": 125,
        "unit": "ng-TEQ/Nm³",
        "analysisMethodId": 5,
        "subSampleCode": "US-EPA Method 23",
        "method": "VIMCERTS 229 - Từ"
      }
    ],
    "requestId": 52,
    "sampleTypeId": 19
  },
  {
    "clientLocationSampleId": 14,
    "clientLocationSampleName": "Mẫu 2",
    "requestCode": "02S2504.254: 1245",
    "requestDetailList": [
      {
        "approve": false,
        "result": null,
        "resultAnalysisServiceId": 2,
        "resultAnalysisServiceName": "pH - Không đổ ngắm chiết",
        "resultAnalysisServiceParentId": 0,
        "resultAssignBatchExtractAnalysisServiceId": 83,
        "resultAssignId": 126,
        "subContractorId": 1,
        "unit": "-",
        "analysisMethodId": 6,
        "subSampleCode": "US EPA 9045D+ US"
      }
    ],
    "requestId": 53,
    "sampleTypeId": 11
  },
  {
    "clientLocationSampleId": 14,
    "clientLocationSampleName": "Mẫu 2",
    "requestCode": "02S2504.255: 3",
    "requestDetailList": [
      {
        "approve": false,
        "result": null,
        "resultAnalysisServiceId": 2,
        "resultAnalysisServiceName": "Diazinon- HC BVTV photpho hữu cơ",
        "resultAnalysisServiceParentId": 0,
        "resultAssignBatchExtractAnalysisServiceId": 83,
        "resultAssignId": 127,
        "subContractorId": 1,
        "unit": "mg/kg đất khô",
        "analysisMethodId": 7,
        "subSampleCode": "US EPA 3540C+US"
      }
    ],
    "requestId": 54,
    "sampleTypeId": 16
  },
  {
    "clientLocationSampleId": 14,
    "clientLocationSampleName": "Mẫu 2",
    "requestCode": "02W2504.0618: 1A",
    "requestDetailList": [
      {
        "approve": false,
        "result": null,
        "resultAnalysisServiceId": 2,
        "resultAnalysisServiceName": "Enec 2",
        "resultAnalysisServiceParentId": 0,
        "resultAssignBatchExtractAnalysisServiceId": 83,
        "resultAssignId": 128,
        "subContractorId": 1,
        "unit": "Enec handico",
        "analysisMethodId": 8,
        "method": "VILAS"
      },
      {
        "approve": false,
        "prefix": "Enec 2.0",
        "result": "",
        "resultAnalysisServiceId": 2,
        "resultAnalysisServiceName": "Lần 1",
        "resultAnalysisServiceParentId": 1,
        "resultAssignBatchExtractAnalysisServiceId": 83,
        "resultAssignId": 129,
        "subContractorId": 1,
        "analysisMethodId": 8,
        "method": "VILAS"
      },
      {
        "approve": false,
        "prefix": "Enec 2.1",
        "result": null,
        "resultAnalysisServiceId": 2,
        "resultAnalysisServiceName": "Lần 2",
        "resultAnalysisServiceParentId": 2,
        "resultAssignBatchExtractAnalysisServiceId": 83,
        "resultAssignId": 130,
        "subContractorId": 1,
        "analysisMethodId": 8,
        "method": "VILAS"
      }
    ],
    "requestId": 55,
    "sampleTypeId": 20
  }
];

// Mock dropdown options
const mockSubSamples = [
  { value: 'HD-HTK1', label: 'HD-HTK1' },
  { value: 'US EPA 05', label: 'US EPA 05' },
  { value: 'US EPA 29', label: 'US EPA 29' },
  { value: 'CEN/TS 13649:2014', label: 'CEN/TS 13649:2014' },
  { value: 'US-EPA Method 23', label: 'US-EPA Method 23' },
  { value: 'US EPA 9045D+ US', label: 'US EPA 9045D+ US' },
  { value: 'US EPA 3540C+US', label: 'US EPA 3540C+US' }
];

const mockMethods = [
  { value: 'VILAS', label: 'VILAS' },
  { value: 'VIMCERTS 079', label: 'VIMCERTS 079' },
  { value: 'VIMCERTS 229 - Từ', label: 'VIMCERTS 229 - Từ' }
];

const ResultEntryReview: React.FC = () => {
  const [data, setData] = useState<RequestData[]>(mockData);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingNotes, setEditingNotes] = useState<{ [key: string]: boolean }>({});
  const [notes, setNotes] = useState<{ [key: string]: string }>({});

  // Cài đặt phân trang
  const itemsPerPage = 2; // Số lượng nhóm request trên mỗi trang
  const totalPages = Math.ceil(data.length / itemsPerPage);

  // Lấy dữ liệu của trang hiện tại
  const getCurrentPageData = (): RequestData[] => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  // Xử lý chuyển đổi trạng thái duyệt
  const handleApprovalToggle = (requestId: number, resultAssignId: number) => {
    setData(prevData =>
      prevData.map(request =>
        request.requestId === requestId
          ? {
            ...request,
            requestDetailList: request.requestDetailList.map(detail =>
              detail.resultAssignId === resultAssignId
                ? { ...detail, approve: !detail.approve }
                : detail
            )
          }
          : request
      )
    );
  };

  // Xử lý thay đổi input
  const handleInputChange = (requestId: number, resultAssignId: number, field: string, value: any) => {
    setData(prevData =>
      prevData.map(request =>
        request.requestId === requestId
          ? {
            ...request,
            requestDetailList: request.requestDetailList.map(detail =>
              detail.resultAssignId === resultAssignId
                ? { ...detail, [field]: value }
                : detail
            )
          }
          : request
      )
    );
  };

  // Xử lý chỉnh sửa ghi chú
  const handleToggleNoteEdit = (requestId: number, resultAssignId: number) => {
    const key = `${requestId}-${resultAssignId}`;
    setEditingNotes(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleNoteChange = (requestId: number, resultAssignId: number, value: string) => {
    const key = `${requestId}-${resultAssignId}`;
    setNotes(prev => ({
      ...prev,
      [key]: value
    }));
    handleInputChange(requestId, resultAssignId, 'description', value);
  };

  // Duyệt tất cả
  const handleApproveAll = () => {
    setData(prevData =>
      prevData.map(request => ({
        ...request,
        requestDetailList: request.requestDetailList.map(detail => ({
          ...detail,
          approve: true
        }))
      }))
    );
  };

  // Không duyệt tất cả
  const handleDisapproveAll = () => {
    setData(prevData =>
      prevData.map(request => ({
        ...request,
        requestDetailList: request.requestDetailList.map(detail => ({
          ...detail,
          approve: false
        }))
      }))
    );
  };

  // Duyệt trang hiện tại
  const handleApprovePage = () => {
    const currentPageData = getCurrentPageData();
    const currentPageIds = currentPageData.map(r => r.requestId);

    setData(prevData =>
      prevData.map(request => ({
        ...request,
        requestDetailList: currentPageIds.includes(request.requestId)
          ? request.requestDetailList.map(detail => ({
            ...detail,
            approve: true
          }))
          : request.requestDetailList
      }))
    );
  };

  // Không duyệt trang hiện tại
  const handleDisapprovePage = () => {
    const currentPageData = getCurrentPageData();
    const currentPageIds = currentPageData.map(r => r.requestId);

    setData(prevData =>
      prevData.map(request => ({
        ...request,
        requestDetailList: currentPageIds.includes(request.requestId)
          ? request.requestDetailList.map(detail => ({
            ...detail,
            approve: false
          }))
          : request.requestDetailList
      }))
    );
  };

  // Lưu dữ liệu
  const handleSave = () => {
    const batchResultAnalysisServiceApprove: BatchResultItem[] = data.flatMap(request =>
      request.requestDetailList.map(detail => ({
        resultAssignId: detail.resultAssignId.toString(),
        subSampleCode: detail.subSampleCode || '',
        prefix: detail.prefix || '',
        result: detail.result || '',
        analysisMethodId: detail.analysisMethodId || 1,
        subContractorId: detail.subContractorId || null,
        approve: detail.approve,
        description: detail.description || notes[`${request.requestId}-${detail.resultAssignId}`] || ''
      }))
    );

    console.log('Request data:', { batchResultAnalysisServiceApprove });
    alert('Đã lưu dữ liệu! (Xem console để kiểm tra request)');
  };

  const handleSaveAndExit = () => {
    handleSave();
    alert('Đã lưu và thoát!');
  };

  // Render nhóm request
  const renderRequestGroup = (request: RequestData) => {
    const rows = [];
    let itemCounter = 1;

    // Header row
    rows.push(
      <TableRow key={`header-${request.requestId}`} sx={{ backgroundColor: '#e3f2fd' }}>
        <TableCell colSpan={9} sx={{ py: 1, px: 2, fontWeight: 'bold', fontSize: '0.875rem' }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
            {request.requestCode}
          </Typography>
        </TableCell>
      </TableRow>
    );

    // Detail rows
    request.requestDetailList.forEach((detail) => {
      const isSubItem = detail.resultAnalysisServiceName.includes('Lần');
      const noteKey = `${request.requestId}-${detail.resultAssignId}`;

      rows.push(
        <TableRow
          key={`${request.requestId}-${detail.resultAssignId}`}
          sx={{
            '&:hover': { backgroundColor: '#f8f9fa' },
            backgroundColor: detail.approve ? '#e8f5e8' : 'white',
            borderBottom: '1px solid #e0e0e0'
          }}
        >
          <TableCell sx={{ py: 1, px: 2, width: 40 }}>
            <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
              {isSubItem ? '' : itemCounter++}
            </Typography>
          </TableCell>

          <TableCell sx={{ py: 1, px: 2, minWidth: 250 }}>
            <Typography
              variant="body2"
              sx={{
                fontSize: '0.875rem',
                lineHeight: 1.4,
                pl: isSubItem ? 2 : 0
              }}
            >
              {detail.resultAnalysisServiceName}
            </Typography>
          </TableCell>

          <TableCell sx={{ py: 1, px: 2, width: 100 }}>
            <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
              {detail.unit || '-'}
            </Typography>
          </TableCell>

          <TableCell sx={{ py: 1, px: 2, width: 80 }}>
            <TextField
              size="small"
              placeholder="Mã mẫu phụ"
              value=""
              sx={{
                '& .MuiInputBase-input': {
                  fontSize: '0.875rem',
                  padding: '6px 8px'
                }
              }}
            />
          </TableCell>

          <TableCell sx={{ py: 1, px: 2, width: 200 }}>
            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
              <TextField
                size="small"
                placeholder="tiền tố"
                value={detail.prefix || ''}
                onChange={(e) => handleInputChange(request.requestId, detail.resultAssignId, 'prefix', e.target.value)}
                sx={{
                  width: 90,
                  '& .MuiInputBase-input': {
                    fontSize: '0.875rem',
                    padding: '6px 8px',
                    textAlign: 'center'
                  }
                }}
              />
              <TextField
                size="small"
                placeholder="kết quả"
                value={detail.result === null ? '' : detail.result}
                onChange={(e) => handleInputChange(request.requestId, detail.resultAssignId, 'result', e.target.value)}
                sx={{
                  width: 90,
                  '& .MuiInputBase-input': {
                    fontSize: '0.875rem',
                    padding: '6px 8px',
                    textAlign: 'center'
                  }
                }}
              />
            </Box>
          </TableCell>

          <TableCell sx={{ py: 1, px: 2, width: 180 }}>
            <FormControl size="small" fullWidth>
              <Select
                value={detail.subSampleCode || mockSubSamples[0].value}
                onChange={(e: SelectChangeEvent) =>
                  handleInputChange(request.requestId, detail.resultAssignId, 'subSampleCode', e.target.value)
                }
                sx={{ fontSize: '0.875rem' }}
              >
                {mockSubSamples.map(option => (
                  <MenuItem key={option.value} value={option.value} sx={{ fontSize: '0.875rem' }}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </TableCell>

          <TableCell sx={{ py: 1, px: 2, width: 180 }}>
            <FormControl size="small" fullWidth>
              <Select
                value={detail.method || 'VILAS'}
                onChange={(e: SelectChangeEvent) =>
                  handleInputChange(request.requestId, detail.resultAssignId, 'method', e.target.value)
                }
                sx={{ fontSize: '0.875rem' }}
              >
                {mockMethods.map(option => (
                  <MenuItem key={option.value} value={option.value} sx={{ fontSize: '0.875rem' }}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </TableCell>

          <TableCell sx={{ py: 1, px: 2, width: 120 }}>
            <Button
              variant={detail.approve ? "contained" : "outlined"}
              color={detail.approve ? "primary" : "inherit"}
              size="small"
              onClick={() => handleApprovalToggle(request.requestId, detail.resultAssignId)}
              sx={{
                fontSize: '0.75rem',
                py: 0.5,
                px: 1.5,
                textTransform: 'none',
                minWidth: 80,
                backgroundColor: detail.approve ? '#2196f3' : 'transparent',
                color: detail.approve ? 'white' : '#666',
                borderColor: '#ccc',
                '&:hover': {
                  backgroundColor: detail.approve ? '#1976d2' : '#f5f5f5'
                }
              }}
            >
              {detail.approve ? 'Duyệt' : 'Không duyệt'}
            </Button>
          </TableCell>

          <TableCell sx={{ py: 1, px: 2, width: 60 }}>
            <IconButton
              size="small"
              onClick={() => handleToggleNoteEdit(request.requestId, detail.resultAssignId)}
              sx={{
                border: '1px solid #ccc',
                borderRadius: 1,
                p: 0.5,
                '&:hover': { backgroundColor: '#f5f5f5' }
              }}
            >
              <Edit sx={{ fontSize: 16 }} />
            </IconButton>
          </TableCell>
        </TableRow>
      );

      // Hiển thị tag đặc biệt cho các dòng Enec
      if (detail.prefix && detail.prefix.startsWith('Enec')) {
        rows.push(
          <TableRow key={`tag-${request.requestId}-${detail.resultAssignId}`}>
            <TableCell colSpan={5} sx={{ py: 0, px: 2 }}></TableCell>
            <TableCell colSpan={4} sx={{ py: 0.5, px: 2 }}>
              <Box sx={{
                backgroundColor: '#c8e6c9',
                px: 2,
                py: 0.5,
                borderRadius: 1,
                display: 'inline-block'
              }}>
                <Typography variant="caption" sx={{ color: '#2e7d32' }}>
                  {detail.prefix}
                </Typography>
              </Box>
            </TableCell>
          </TableRow>
        );
      }

      // Dòng nhập ghi chú
      if (editingNotes[noteKey]) {
        rows.push(
          <TableRow key={`note-${request.requestId}-${detail.resultAssignId}`}>
            <TableCell sx={{ py: 1, px: 2 }}></TableCell>
            <TableCell colSpan={8} sx={{ py: 1, px: 2 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Nhập ghi chú..."
                value={notes[noteKey] || ''}
                onChange={(e) => handleNoteChange(request.requestId, detail.resultAssignId, e.target.value)}
                onBlur={() => handleToggleNoteEdit(request.requestId, detail.resultAssignId)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleToggleNoteEdit(request.requestId, detail.resultAssignId);
                  }
                }}
                autoFocus
                sx={{
                  backgroundColor: '#f5f5f5',
                  '& .MuiInputBase-input': {
                    fontSize: '0.875rem',
                    padding: '8px 12px'
                  }
                }}
              />
            </TableCell>
          </TableRow>
        );
      }
    });

    return rows;
  };

  return (
    <Box sx={{ p: 2, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 'normal' }}>
        Nhập/duyệt kết quả thử nghiệm
      </Typography>

      {/* Thanh nút chức năng */}
      <Box sx={{
        display: 'flex',
        gap: 1,
        mb: 2,
        backgroundColor: 'white',
        p: 1,
        borderRadius: 1,
        border: '1px solid #e0e0e0'
      }}>
        <IconButton size="small" sx={{ border: '1px solid #ccc', borderRadius: 1 }}>
          <NavigateBefore />
        </IconButton>
        <Button
          variant="contained"
          size="small"
          onClick={handleSaveAndExit}
          sx={{
            backgroundColor: '#2196f3',
            textTransform: 'none',
            '&:hover': { backgroundColor: '#1976d2' }
          }}
        >
          Lưu & thoát
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={handleSave}
          sx={{ textTransform: 'none' }}
        >
          Lưu
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={handleApprovePage}
          sx={{ textTransform: 'none' }}
        >
          Duyệt trang
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={handleDisapprovePage}
          sx={{ textTransform: 'none' }}
        >
          Không duyệt trang
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={handleApproveAll}
          sx={{ textTransform: 'none' }}
        >
          Duyệt tất cả
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={handleDisapproveAll}
          sx={{ textTransform: 'none' }}
        >
          Không duyệt tất cả
        </Button>
      </Box>

      {/* Phân trang */}
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 2 }}>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Box
            key={page}
            onClick={() => setCurrentPage(page)}
            sx={{
              backgroundColor: currentPage === page ? '#2196f3' : 'white',
              color: currentPage === page ? 'white' : 'black',
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              cursor: 'pointer',
              border: currentPage === page ? 'none' : '1px solid #ccc',
              '&:hover': {
                backgroundColor: currentPage === page ? '#1976d2' : '#f5f5f5'
              }
            }}
          >
            <Typography variant="body2">{page}</Typography>
          </Box>
        ))}
        <Typography variant="body2" sx={{ mx: 1 }}>»</Typography>
        <Typography variant="body2" sx={{ color: '#666' }}>
          Trang {currentPage} / {totalPages}
        </Typography>
      </Box>

      {/* Bảng chính */}
      <TableContainer component={Paper} sx={{ boxShadow: 1 }}>
        <Table size="small" sx={{ minWidth: 1200 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', py: 1.5, px: 2, width: 40 }}>
                #
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', py: 1.5, px: 2, minWidth: 250 }}>
                Chỉ tiêu
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', py: 1.5, px: 2, width: 100 }}>
                Đơn vị
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', py: 1.5, px: 2, width: 80 }}>
                Mã mẫu phụ
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', py: 1.5, px: 2, width: 200 }}>
                Kết quả
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', py: 1.5, px: 2, width: 180 }}>
                Phương pháp
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', py: 1.5, px: 2, width: 180 }}>
                Thầu phụ
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', py: 1.5, px: 2, width: 120 }}>

              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', py: 1.5, px: 2, width: 60 }}>

              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getCurrentPageData().map((request) => renderRequestGroup(request))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ResultEntryReview;