// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { House, Home3, AddSquare } from 'iconsax-react';

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
      id: 'check-available',
      title: <FormattedMessage id="check-available" defaultMessage="Kiểm tra phòng trống" />,
      type: 'item',
      url: '/check-available',
      icon: House
    },
    {
      id: 'orders',
      title: <FormattedMessage id="orders" defaultMessage="Danh sách đặt phòng" />,
      type: 'item',
      url: '/orders',
      icon: Home3
    },
    {
      id: 'create',
      title: <FormattedMessage id="create" defaultMessage="Đặt phòng" />,
      type: 'item',
      url: '/create',
      icon: AddSquare
    }
  ]
};

export default orders;
