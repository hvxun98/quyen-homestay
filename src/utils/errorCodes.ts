// Liệt kê toàn bộ mã lỗi & thông điệp mặc định
export const ERROR_CODES = {
  VERIFY_TENANCY_ERROR_001: 'Invalid Company name',
  DEPARTMENT_NOT_FOUND: 'Department not found',
  CONTAINER_TYPE_NOT_FOUND: 'Dụng cụ lấy mẫu not found',
  SAMPLE_TYPE_NOT_FOUND: 'Loại mẫu not found',
  SAMPLE_TYPE_NOT_EMPTY: 'Bắt buộc truyền loại mẫu',
  ANALYSIS_SERVICE_EXISTS: 'Có tiêu chí đã tồn tại',
  ANALYSIS_SERVICES_NOT_FOUND: 'Các chỉ tiêu không tồn tại',
  ANALYSIS_SERVICES_MEMBER_NOT_FOUND: 'Các chỉ tiêu input chứa id không tồn tại',
  EXTRACTION_TEMPLATE_NOT_FOUND: 'Không tìm thấy mẫu bóc tách',
  EXTRACTION_TEMPLATE_ANALYSIS_SERVICE_NOT_EMPTY: 'Bắt buộc truyền ít nhất chỉ tiêu',
  EXISTS_EXTRACTION_TEMPLATE_ANALYSIS_SERVICE_INVALID: 'Có chỉ tiêu không tồn tại',
  CLIENT_NOT_FOUND: 'Client not found',
  CLIENT_REQUEST_MONITORING_NOT_FOUND: 'Client request monitoring not found',
  CLIENT_LOCATION_NOT_FOUND: 'Client location not found',
  CLIENT_LOCATION_SAMPLE_NOT_FOUND: 'Client location sample not found',
  VERIFY_TENANCY_ERROR_002: 'Company name already exists',
  NO_USER_BY_KEY_001: 'No user was found for this activation key',
  PROVINCE_NOT_FOUND: 'City is not exist',
  DUPLICATE_COMPANY: 'Company already exist',
  DUPLICATE_EMAIL: 'Email already exist',
  DUPLICATE_USER: 'Company already exist',
  DATE_INVALID: 'Date invalid',
  BATCHES_NOT_FOUND: 'Các đơn hàng không tồn tại',
  BATCHES_MEMBER_NOT_FOUND: 'Các đơn hàng input chứa id không tồn tại',
  ANALYSIS_METHODS_NOT_FOUND: 'Các phương pháp ptich không tồn tại',
  ANALYSIS_METHODS_MEMBER_NOT_FOUND: 'Các phương pháp ptich input chứa id không tồn tại',
  SUB_CONTRACTOR_NOT_FOUND: 'Các thầu phụ không tồn tại',
  SUB_CONTRACTOR_MEMBER_NOT_FOUND: 'Các thầu phụ input chứa id không tồn tại',
  MISSING_ORIGIN: 'X-FORWARDED-FOR missing',
  // thêm một số mã chung
  UNKNOWN_ERROR: 'Something went wrong',
  NETWORK_ERROR: 'Network error',
  SUCCESS: 'Success'
} as const;

export type ErrorCode = keyof typeof ERROR_CODES;
