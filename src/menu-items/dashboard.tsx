// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { Home3 } from 'iconsax-react';

// type
import { NavItemType } from 'types/menu';

const loadingMenu: NavItemType = {
  id: 'group-dashboard-loading',
  title: <FormattedMessage id="dashboard" />,
  type: 'group',
  children: [
    {
      id: 'analytics1',
      title: <FormattedMessage id="analytics1" defaultMessage="Tổng quan" />,
      type: 'item',
      url: '/dashboard/analytics',
      icon: Home3
    }
  ]
};

// ==============================|| MENU ITEMS - API ||============================== //

export function MenuFromAPI() {
  return loadingMenu;
}
