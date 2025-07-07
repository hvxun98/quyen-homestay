// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { UserTag } from 'iconsax-react';

// types
import { NavItemType } from 'types/menu';

// icons
const icons = {
  users: UserTag
};

// ==============================|| MENU ITEMS - WIDGETS ||============================== //

const users: NavItemType = {
  id: 'group-user',
  title: <FormattedMessage id="users" />,
  icon: icons.users,
  type: 'group',
  children: [
    {
      id: 'users',
      title: <FormattedMessage id="Users Management" />,
      type: 'item',
      url: '/admin/users',
      icon: icons.users
    }
  ]
};

export default users;
