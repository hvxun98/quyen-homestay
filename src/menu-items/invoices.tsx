// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { Bill, House2, Building, MoneyRecive } from 'iconsax-react';

// types
import { NavItemType } from 'types/menu';

// icons

// ==============================|| MENU ITEMS - SETTINGS ||============================== //

const invoices: NavItemType = {
  id: 'managerment',
  title: <FormattedMessage id="manager" defaultMessage="Quản lý" />,
  type: 'group',
  children: [
    {
      id: 'check-available',
      title: <FormattedMessage id="check-available" defaultMessage="Quản lý hoá đơn trọ" />,
      type: 'item',
      url: '/invoices',
      icon: Bill
    },
    {
      id: 'check-available',
      title: <FormattedMessage id="check-available" defaultMessage="Quản lý nhà" />,
      type: 'item',
      url: '/houses',
      icon: House2
    },
    {
      id: 'check-available',
      title: <FormattedMessage id="check-available" defaultMessage="Quản lý phòng" />,
      type: 'item',
      url: '/rooms',
      icon: Building
    },
    {
      id: 'check-available',
      title: <FormattedMessage id="check-available" defaultMessage="Quản lý thu nhập chi phí" />,
      type: 'item',
      url: '/houses',
      icon: MoneyRecive
    }
  ]
};

export default invoices;
