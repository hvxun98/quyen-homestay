// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { House } from 'iconsax-react';
import BedroomParentIcon from '@mui/icons-material/BedroomParent';

// types
import { NavItemType } from 'types/menu';

// ==============================|| MENU ITEMS - WIDGETS ||============================== //

const orders: NavItemType = {
  id: 'group-orders',
  title: <FormattedMessage id="orders-room" defaultMessage="Quản lý đặt phòng" />,
  icon: House,
  type: 'group',
  children: [
    {
      id: 'Kiểm tra phòng trống',
      title: <FormattedMessage id="Kiểm tra phòng trống" defaultMessage="Kiểm tra phòng trống" />,
      type: 'item',
      url: '/admin/orders/check-available',
      icon: House
    },
    {
      id: 'Danh sách đặt phòng',
      title: <FormattedMessage id="Danh sách đặt phòng" defaultMessage="Danh sách đặt phòng" />,
      type: 'item',
      url: '/admin/orders/list',
      icon: BedroomParentIcon
    }
  ]
};

export default orders;
