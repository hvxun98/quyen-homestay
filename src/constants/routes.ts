export const ROUTES = {
  // ==== Trang chính, auth ====
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',

  // ==== Khách hàng ====
  CUSTOMERS: '/customers',
  CUSTOMER_DETAIL: (id: number) => `/dashboard/customers/${id}`,
  CUSTOMER_CONTACTS: (id: number) => `/customers/${id}/contacts`,
  CUSTOMER_LOCATION: (id: number) => `/customers/${id}/locations`,
  CUSTOMER_LOCATION_MONITORING_SCHEDULE: (id: number, locationId: number) => `/customers/${id}/locations/${locationId}/monitoring-schedule`,
  CUSTOMER_LOCATION_MONITORING: (id: number, locationId: number) => `/customers/${id}/locations/${locationId}/monitoring-location`,
  CUSTOMER_CONTRACTS: (id: number) => `/customers/${id}/contracts`,

  // ==== Đơn hàng ====
  ORDERS: '/orders',
  ORDER_DETAIL: (id: number) => `/orders/${id}`, // Chi tiết đơn hàng
  QUOTATIONS: (id: number) => `/orders/${id}/quotations`, // Danh sách báo giá của đơn hàng
  QUOTATION_DETAIL: (id: number, quotationId: number) => `/orders/${id}/quotations/${quotationId}/detail`, // Chi tiết báo giá

  // ==== Các chức năng chi tiết của đơn hàng ====
  ORDER_SAMPLE_SEPARATION: (id: number) => `/orders/${id}/sample-breakdown-templates`, // Bóc tách mẫu
  ORDER_PRE_QUOTATION: (id: number) => `/orders/${id}/pre-quotations`, // Báo giá trước bóc tách
  ORDER_DEBT: (id: number) => `/orders/${id}/debt`, // Công nợ của đơn hàng
  ORDER_MONITORING_STAFF: (id: number) => `/orders/${id}/monitoring-staff`, // Nhân sự quan trắc
  ORDER_MATERIALS_CHEMICALS: (id: number) => `/orders/${id}/materials`, // Vật tư - Hóa chất
  ORDER_PRESERVATION: (id: number) => `/orders/${id}/preservation`, // Bảo quản mẫu
  ORDER_ASSIGNMENT_ANALYSIS: (id: number) => `/orders/${id}/assignment-analysis`, // Phân công / Kết quả phân tích
  ORDER_TEST_RESULTS: (id: number) => `/orders/${id}/result-entry-review`, // Nhập / Duyệt kết quả thử nghiệm
  ORDER_FIELD_COMPARISON: (id: number) => `/orders/${id}/field-comparison`, // Đối chiếu hiện trường
  ORDER_REQUEST: (id: number) => `/orders/${id}/requests`, // Yêu cầu liên quan đơn hàng
  ORDER_ATTACHMENTS: (id: number) => `/orders/${id}/attachments`, // File đính kèm
  ORDER_FIELD_DATA: (id: number) => `/orders/${id}/field-data`, // Dữ liệu hiện trường
  ORDER_RESET_RESULT_TYPE: (id: number) => `/orders/${id}/reset-result-type`, // Đặt lại loại phiếu kết quả

  // ==== Loại mẫu & Template ====
  SAMPLE_TYPES: '/setting/sample-types', // Loại mẫu
  SAMPLE_BREAKDOWN_TEMPLATES: '/setting/sample-breakdown-templates', // Template cho bóc tách

  // ==== Cài đặt hệ thống (Settings) ====
  SETTING: '/setting',
  SETTING_NORM_TABLE: '/setting/norm-table', // Bảng định mức
  SETTING_PRICE_TABLE: '/setting/price-table', // Bảng giá
  SETTING_PRESERVATION: '/setting/preservation', // Bảo quản
  SETTING_TEST_REPORT: '/setting/test-report', // Biên bản thử nghiệm
  SETTING_FORMULA: '/setting/formula', // Công thức
  SETTING_STANDARD_COLUMNS: '/setting/standard-columns', // Cột quy chuẩn
  SETTING_ANALYSIS_CRITERIA: '/setting/analysis-criteria', // Chỉ tiêu phân tích
  SETTING_SUB_CRITERIA: '/setting/sub-criteria', // Chỉ tiêu phụ
  SETTING_EQUIPMENT_LIST: '/setting/equipment-list', // Danh sách thiết bị
  SETTING_RESET_PASSWORD: '/setting/reset-password', // Đặt lại mật khẩu
  SETTING_STANDARD_UNIT: '/setting/standard-unit', // Đơn vị hiệu chuẩn
  SETTING_CHEMICAL: '/setting/chemical', // Hóa chất

  SETTING_SAMPLE_TOOL_TYPE: '/setting/sample-tool-type', // Loại dụng cụ lấy mẫu
  SETTING_PLAN_TYPE: '/setting/plan-type', // Loại kế hoạch
  SETTING_TEMPLATE_TYPE: '/setting/template-type', // Loại template (nếu có)
  SETTING_EQUIPMENT_CODE: '/setting/equipment-code', // Mã thiết bị
  SETTING_PRIORITY_LEVEL: '/setting/priority-level', // Mức ưu tiên
  SETTING_INDUSTRY: '/setting/industry', // Ngành công nghiệp
  SETTING_SUPPLIER: '/setting/supplier', // Nhà cung cấp
  SETTING_MANUFACTURER: '/setting/manufacturer', // Nhà sản xuất
  SETTING_EMPLOYEE: '/setting/employee', // Nhân viên

  SETTING_ENVIRONMENTAL_GROUP: '/setting/environmental-group', // Nhóm chỉ tiêu môi trường lao động
  SETTING_ANALYSIS_GROUP: '/setting/analysis-group', // Nhóm chỉ tiêu phân tích
  SETTING_SAMPLE_TOOL_GROUP: '/setting/sample-tool-group', // Nhóm dụng cụ lấy mẫu
  SETTING_ANALYSIS_TOOL_GROUP: '/setting/analysis-tool-group', // Nhóm dụng cụ phân tích

  SETTING_BRANCH: '/setting/branch', // Chi nhánh / Phòng ban
  SETTING_ANALYSIS_METHOD: '/setting/analysis-method', // Phương pháp phân tích
  SETTING_REGULATION: '/setting/regulation', // Quy chuẩn

  SETTING_TEMPLATE_BREAKDOWN: '/setting/template-breakdown', // Template cho bóc tách
  SETTING_TEMPLATE_TEST: '/setting/template-test', // Template mẫu thử nghiệm

  SETTING_SUBCONTRACTOR: '/setting/subcontractor', // Thầu phụ
  SETTING_COMPANY_INFO: '/setting/company-info', // Thông tin công ty

  //yêu cầu
  ANALYSIS_REQUESTS: '/request/analysis-requests',
  SCAN_REQUESTS: '/request/scan-request'
};
