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

const brands: NavItemType = {
  id: 'group-brands',
  title: <FormattedMessage id="Brands" />,
  icon: icons.location,
  type: 'group',
  children: [
    {
      id: 'Brands',
      title: <FormattedMessage id="Brands Management" />,
      type: 'item',
      url: '/admin/brands',
      icon: icons.location
    }
  ]
};

export default brands;
