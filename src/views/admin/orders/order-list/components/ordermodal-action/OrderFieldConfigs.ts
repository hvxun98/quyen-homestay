export interface FieldConfig {
  name: string;
  labelId: string;
  defaultMessage: string;
  type: 'text' | 'select' | 'checkbox' | 'radio' | 'date';
  options?: Array<string | { label: string; value: any }>;
  defaultValue?: string | boolean | null;
  placeholder?: string;
  required?: boolean;
}

export const statusOptions: { label: string; value: number }[] = [
  { label: 'Tất cả', value: 1 },
  { label: 'Bị xóa', value: 2 }
];

export const orderTypeOptions = [
  { label: 'Mẫu gửi', value: '1' },
  { label: 'Quan trắc MT', value: '2' },
  { label: 'Môi trường lao động', value: '3' }
] as const;

const resultFormatOptions: { label: string; value: number }[] = [
  { label: 'Bưu điện', value: 1 },
  { label: 'Fax', value: 2 },
  { label: 'Email', value: 3 },
  { label: 'Đến nhận', value: 4 }
];

export const formFields: FieldConfig[] = [
  { name: 'name', labelId: 'name', defaultMessage: 'Tên', type: 'text', placeholder: 'Nhập tên', defaultValue: '' },
  {
    name: 'clientId',
    labelId: 'customer',
    defaultMessage: 'Khách hàng',
    type: 'select',
    options: [],
    placeholder: 'Chọn khách hàng',
    defaultValue: null,
    required: true
  },

  {
    name: 'clientContactId',
    labelId: 'contact',
    defaultMessage: 'Liên lạc',
    type: 'select',
    placeholder: 'Chọn liên lạc',
    defaultValue: null,
    required: true
  },
  {
    name: 'clientLocationId',
    labelId: 'location',
    defaultMessage: 'Địa điểm',
    type: 'select',
    placeholder: 'Nhập địa điểm',
    defaultValue: null
  },

  {
    name: 'clientContractId',
    labelId: 'contract',
    defaultMessage: 'Hợp đồng',
    type: 'select',
    placeholder: 'Nhập hợp đồng',
    defaultValue: null
  },
  {
    name: 'sampleReceiptDate',
    labelId: 'receiveSampleDate',
    defaultMessage: 'Ngày nhận mẫu',
    type: 'date',
    defaultValue: null,
    required: true
  },

  { name: 'monitoringDate', labelId: 'sampleDate', defaultMessage: 'Ngày quan trắc', type: 'date', defaultValue: null, required: true },
  { name: 'sampleDisposalDate', labelId: 'cancelSampleDate', defaultMessage: 'Ngày hủy mẫu', type: 'date', defaultValue: null },

  {
    name: 'resultDeliveryDate',
    labelId: 'resultDate',
    defaultMessage: 'Ngày trả kết quả',
    type: 'date',
    defaultValue: null,
    required: true
  },
  { name: 'analysisDate', labelId: 'analysisDate', defaultMessage: 'Ngày phân tích', type: 'date', defaultValue: null },

  {
    name: 'internalResultDeliveryDate',
    labelId: 'returnInternalDate',
    defaultMessage: 'Ngày trả kết quả nội bộ',
    type: 'date',
    defaultValue: null
  },
  {
    name: 'unitRequestMonitoring',
    labelId: 'monitoringUnit',
    defaultMessage: 'Đơn vị yêu cầu quan trắc',
    type: 'select',
    options: [],
    placeholder: 'Chọn đơn vị',
    defaultValue: ''
  },

  {
    name: 'actualResultDeliveryDate',
    labelId: 'returnFinalDate',
    defaultMessage: 'Ngày trả kết quả thực tế',
    type: 'date',
    defaultValue: null
  },
  {
    name: 'monitoringSupervisor',
    labelId: 'monitoringStaff',
    defaultMessage: 'Phụ trách quan trắc',
    type: 'select',
    options: [],
    placeholder: 'Chọn nhân sự',
    defaultValue: ''
  },

  {
    name: 'displayTimeMonitoring',
    labelId: 'showMonitoringTime',
    defaultMessage: 'Hiển thị giờ quan trắc',
    type: 'checkbox',
    defaultValue: false
  },
  {
    name: 'qaQcOfficer',
    labelId: 'qaQcStaff',
    defaultMessage: 'Cán bộ QA/QC',
    type: 'select',
    options: [],
    placeholder: 'Chọn nhân sự',
    defaultValue: ''
  },

  {
    name: 'salesManager',
    labelId: 'responsibleStaff',
    defaultMessage: 'Phụ trách kinh doanh',
    type: 'select',
    options: [],
    placeholder: 'Chọn nhân sự',
    defaultValue: ''
  },
  {
    name: 'originalTestReportLink',
    labelId: 'labReportLink',
    defaultMessage: 'Link biên bản thử nghiệm gốc',
    type: 'text',
    placeholder: 'Đường dẫn...',
    defaultValue: ''
  },

  {
    name: 'resultApprovalOfficer',
    labelId: 'signingStaff',
    defaultMessage: 'Người ký phiếu kết quả',
    type: 'select',
    options: [],
    placeholder: 'Chọn nhân sự',
    defaultValue: ''
  },
  {
    name: 'samplingRecordLink',
    labelId: 'samplingRecordLink',
    defaultMessage: 'Link biên bản lấy mẫu',
    type: 'text',
    placeholder: 'Đường dẫn...',
    defaultValue: ''
  },

  {
    name: 'departmentId',
    labelId: 'department',
    defaultMessage: 'Phòng ban/Chi nhánh',
    type: 'select',
    options: [],
    placeholder: 'Chọn phòng ban/chi nhánh',
    defaultValue: ''
  },
  {
    name: 'resultCertificateLink',
    labelId: 'resultReportLink',
    defaultMessage: 'Link phiếu kết quả',
    type: 'text',
    placeholder: 'Đường dẫn...',
    defaultValue: ''
  },

  { name: 'description', labelId: 'description', defaultMessage: 'Mô tả', type: 'text', placeholder: 'Nhập mô tả...', defaultValue: '' },
  {
    name: 'enResultCertificateNumber',
    labelId: 'reportNumberEN',
    defaultMessage: 'Số phiếu kết quả Tiếng Anh',
    type: 'text',
    placeholder: 'Nhập số phiếu...',
    defaultValue: ''
  },

  {
    name: 'finalReportLink',
    labelId: 'finalReportLink',
    defaultMessage: 'Link báo cáo hoàn thiện',
    type: 'text',
    placeholder: 'Đường dẫn báo cáo...',
    defaultValue: ''
  },
  {
    name: 'vnResultCertificateNumber',
    labelId: 'reportNumberVN',
    defaultMessage: 'Số phiếu kết quả Tiếng Việt',
    type: 'text',
    placeholder: 'Nhập số phiếu...',
    defaultValue: ''
  },

  { name: 'hideAllRequests', labelId: 'hideRequests', defaultMessage: 'Ẩn tất cả yêu cầu', type: 'checkbox', defaultValue: false },
  {
    name: 'resultDeliveryMethod',
    labelId: 'resultFormat',
    defaultMessage: 'Hình thức trả kết quả',
    type: 'select',
    options: resultFormatOptions,
    placeholder: 'Chọn hình thức',
    defaultValue: ''
  }
];

export const compareFields: FieldConfig[] = Array.from({ length: 5 }, (_, i) => ({
  name: `compare${i + 1}`,
  labelId: `compare${i + 1}`,
  defaultMessage: `Đơn hàng ${i + 1}`,
  type: 'select',
  options: [],
  defaultValue: ''
}));

import { useCallback, useEffect, useState } from 'react';
import { fetchOrders } from 'services/orders';
import { OrderProps } from 'types/orders';

export function useOrders(pageNum: number, pageSize: number, filters: { name: string; status: number }) {
  const [data, setData] = useState<OrderProps[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const getOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchOrders({ ...filters, page: pageNum, size: pageSize });
      setData(res.data.content);
      setTotal(res.data.total);
    } finally {
      setLoading(false);
    }
  }, [filters, pageNum, pageSize]);

  useEffect(() => {
    void getOrders();
  }, [getOrders]);

  return { data, total, loading, reload: getOrders };
}
