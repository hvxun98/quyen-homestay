// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { Profile2User } from 'iconsax-react';

// types
import { NavItemType } from 'types/menu';

// icons
const icons = {
  customer: Profile2User
};

// ==============================|| MENU ITEMS - WIDGETS ||============================== //

const customers: NavItemType = {
  id: 'group-customers',
  title: <FormattedMessage id="customers" />,
  icon: icons.customer,
  type: 'group',
  children: [
    {
      id: 'customers',
      title: <FormattedMessage id="customers" />,
      type: 'item',
      url: '/customers',
      icon: icons.customer,
      children: [
        {
          id: 'contacts',
          title: <FormattedMessage id="contacts" />,
          type: 'item',
          url: '/customers/:customerId/contacts',
          icon: icons.customer
        },
        {
          id: 'locations',
          title: <FormattedMessage id="locations" />,
          type: 'item',
          url: '/customers/:customerId/locations',
          icon: icons.customer,
          children: [
            {
              id: 'monitoring-schedule',
              title: <FormattedMessage id="monitoring-schedule" />,
              type: 'item',
              url: '/customers/:customerId/locations/:locationId/monitoring-schedule',
              icon: icons.customer
            },
            {
              id: 'monitoring-location',
              title: <FormattedMessage id="monitoring-location" />,
              type: 'item',
              url: '/customers/:customerId/locations/:locationId/monitoring-location',
              icon: icons.customer,

            }
          ]
        },
        {
          id: 'contracts',
          title: <FormattedMessage id="contracts" />,
          type: 'item',
          url: '/customers/:customerId/contracts',
          icon: icons.customer
        }
      ]
    }
  ]
};

export default customers;
