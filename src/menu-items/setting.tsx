// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { Setting } from 'iconsax-react';

// types
import { ROUTES } from 'constants/routes';
import { NavItemType } from 'types/menu';

// icons
const icons = {
  setting: Setting
};

// ==============================|| MENU ITEMS - SETTINGS ||============================== //

const setting: NavItemType = {
  id: 'group-setting',
  title: <FormattedMessage id="Setting" />,
  icon: icons.setting,
  type: 'group',
  children: [
    {
      id: 'Setting',
      title: <FormattedMessage id="Setting" />,
      type: 'item',
      url: ROUTES.SETTING,
      icon: icons.setting,
      children: [
        // Bảng định mức
        { id: 'normTable', title: <FormattedMessage id="normTable" />, type: 'item', url: ROUTES.SETTING_NORM_TABLE },

        // Bảng giá
        { id: 'priceTable', title: <FormattedMessage id="priceTable" />, type: 'item', url: ROUTES.SETTING_PRICE_TABLE },

        // Bảo quản
        { id: 'preservation', title: <FormattedMessage id="preservation" />, type: 'item', url: ROUTES.SETTING_PRESERVATION },

        // Biên bản thử nghiệm
        { id: 'testReport', title: <FormattedMessage id="testReport" />, type: 'item', url: ROUTES.SETTING_TEST_REPORT },

        // Công thức
        { id: 'formula', title: <FormattedMessage id="formula" />, type: 'item', url: ROUTES.SETTING_FORMULA },

        // Cột quy chuẩn
        { id: 'standardColumns', title: <FormattedMessage id="standardColumns" />, type: 'item', url: ROUTES.SETTING_STANDARD_COLUMNS },

        // Chỉ tiêu phân tích
        { id: 'analysisCriteria', title: <FormattedMessage id="analysisCriteria" />, type: 'item', url: ROUTES.SETTING_ANALYSIS_CRITERIA },

        // Chỉ tiêu phụ
        { id: 'subCriteria', title: <FormattedMessage id="subCriteria" />, type: 'item', url: ROUTES.SETTING_SUB_CRITERIA },

        // Danh sách thiết bị
        { id: 'equipmentList', title: <FormattedMessage id="equipmentList" />, type: 'item', url: ROUTES.SETTING_EQUIPMENT_LIST },

        // Đặt lại mật khẩu
        { id: 'resetPassword', title: <FormattedMessage id="resetPassword" />, type: 'item', url: ROUTES.SETTING_RESET_PASSWORD },

        // Đơn vị hiệu chuẩn
        { id: 'standardUnit', title: <FormattedMessage id="standardUnit" />, type: 'item', url: ROUTES.SETTING_STANDARD_UNIT },

        // Hóa chất
        { id: 'chemical', title: <FormattedMessage id="chemical" />, type: 'item', url: ROUTES.SETTING_CHEMICAL },

        // Loại dụng cụ lấy mẫu
        { id: 'sampleToolType', title: <FormattedMessage id="sampleToolType" />, type: 'item', url: ROUTES.SETTING_SAMPLE_TOOL_TYPE },

        // Loại kế hoạch
        { id: 'planType', title: <FormattedMessage id="planType" />, type: 'item', url: ROUTES.SETTING_PLAN_TYPE },

        // Loại mẫu
        { id: 'sampleTypes', title: <FormattedMessage id="sampleTypes" />, type: 'item', url: ROUTES.SAMPLE_TYPES },

        // Mã thiết bị
        { id: 'equipmentCode', title: <FormattedMessage id="equipmentCode" />, type: 'item', url: ROUTES.SETTING_EQUIPMENT_CODE },

        // Mức ưu tiên của yêu cầu
        { id: 'priorityLevel', title: <FormattedMessage id="priorityLevel" />, type: 'item', url: ROUTES.SETTING_PRIORITY_LEVEL },

        // Ngành công nghiệp
        { id: 'industry', title: <FormattedMessage id="industry" />, type: 'item', url: ROUTES.SETTING_INDUSTRY },

        // Nhà cung cấp
        { id: 'supplier', title: <FormattedMessage id="supplier" />, type: 'item', url: ROUTES.SETTING_SUPPLIER },

        // Nhà sản xuất
        { id: 'manufacturer', title: <FormattedMessage id="manufacturer" />, type: 'item', url: ROUTES.SETTING_MANUFACTURER },

        // Nhân viên
        { id: 'employee', title: <FormattedMessage id="employee" />, type: 'item', url: ROUTES.SETTING_EMPLOYEE },

        // Nhóm chỉ tiêu môi trường lao động
        {
          id: 'environmentalGroup',
          title: <FormattedMessage id="environmentalGroup" />,
          type: 'item',
          url: ROUTES.SETTING_ENVIRONMENTAL_GROUP
        },

        // Nhóm chỉ tiêu phân tích
        { id: 'analysisGroup', title: <FormattedMessage id="analysisGroup" />, type: 'item', url: ROUTES.SETTING_ANALYSIS_GROUP },

        // Nhóm dụng cụ lấy mẫu
        { id: 'sampleToolGroup', title: <FormattedMessage id="sampleToolGroup" />, type: 'item', url: ROUTES.SETTING_SAMPLE_TOOL_GROUP },

        // Nhóm dụng cụ phân tích
        {
          id: 'analysisToolGroup',
          title: <FormattedMessage id="analysisToolGroup" />,
          type: 'item',
          url: ROUTES.SETTING_ANALYSIS_TOOL_GROUP
        },

        // Phòng ban/Chi nhánh
        { id: 'branch', title: <FormattedMessage id="branch" />, type: 'item', url: ROUTES.SETTING_BRANCH },

        // Phương pháp phân tích
        { id: 'analysisMethod', title: <FormattedMessage id="analysisMethod" />, type: 'item', url: ROUTES.SETTING_ANALYSIS_METHOD },

        // Quy chuẩn
        { id: 'regulation', title: <FormattedMessage id="regulation" />, type: 'item', url: ROUTES.SETTING_REGULATION },

        // Template cho bóc tách
        {
          id: 'templateBreakdown',
          title: <FormattedMessage id="templateBreakdown" />,
          type: 'item',
          url: ROUTES.SETTING_TEMPLATE_BREAKDOWN
        },

        // Template mẫu thử nghiệm
        { id: 'templateTest', title: <FormattedMessage id="templateTest" />, type: 'item', url: ROUTES.SETTING_TEMPLATE_TEST },

        // Thầu phụ
        { id: 'subcontractor', title: <FormattedMessage id="subcontractor" />, type: 'item', url: ROUTES.SETTING_SUBCONTRACTOR },

        // Thông tin công ty
        { id: 'companyInfo', title: <FormattedMessage id="companyInfo" />, type: 'item', url: ROUTES.SETTING_COMPANY_INFO }
      ]
    }
  ]
};

export default setting;
