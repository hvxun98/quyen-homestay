// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { House2, MoneyRecive } from 'iconsax-react';
import BathroomIcon from '@mui/icons-material/Bathroom';

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
      id: 'Quản lý nhà',
      title: <FormattedMessage id="Quản lý nhà" defaultMessage="Quản lý nhà" />,
      type: 'item',
      url: '/admin/houses',
      icon: House2
    },
    {
      id: 'Quản lý phòng',
      title: <FormattedMessage id="Quản lý phòng" defaultMessage="Quản lý phòng" />,
      type: 'item',
      url: '/admin/rooms',
      icon: BathroomIcon
    },
    {
      id: 'Quản lý thu nhập chi phí',
      title: <FormattedMessage id="Quản lý thu nhập chi phí" defaultMessage="Quản lý thu nhập chi phí" />,
      type: 'item',
      url: '/admin/income-and-cost',
      icon: MoneyRecive
    }
  ]
};

export default invoices;
