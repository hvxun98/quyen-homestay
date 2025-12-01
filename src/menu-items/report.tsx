// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { CalendarSearch } from 'iconsax-react';

// types
import { NavItemType } from 'types/menu';

// ==============================|| MENU ITEMS - WIDGETS ||============================== //

const report: NavItemType = {
  id: 'group-customers',
  title: <FormattedMessage id="report" defaultMessage="Báo cáo" />,
  icon: CalendarSearch,
  type: 'group',
  children: [
    {
      id: 'Báo cáo doanh thu theo tháng',
      title: <FormattedMessage id="Báo cáo doanh thu theo tháng" defaultMessage="Báo cáo doanh thu theo tháng" />,
      type: 'item',
      url: '/admin/reports/monthly',
      icon: CalendarSearch
    }
  ]
};

export default report;
