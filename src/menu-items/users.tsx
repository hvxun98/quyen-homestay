// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { Location } from 'iconsax-react';

// types
import { NavItemType } from 'types/menu';

// icons
const icons = {
  location: Location
};

// ==============================|| MENU ITEMS - WIDGETS ||============================== //

const users: NavItemType = {
  id: 'group-users',
  title: <FormattedMessage id="Users" />,
  icon: icons.location,
  type: 'group',
  children: [
    {
      id: 'Users',
      title: <FormattedMessage id="Users Management" />,
      type: 'item',
      url: '/admin/users',
      icon: icons.location
    }
  ]
};

export default users;
