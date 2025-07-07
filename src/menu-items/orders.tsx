// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { ShoppingCart } from 'iconsax-react';

// types
import { NavItemType } from 'types/menu';

// icons
const icons = {
  order: ShoppingCart
};

// ==============================|| MENU ITEMS - WIDGETS ||============================== //

const orders: NavItemType = {
  id: 'group-orders',
  title: <FormattedMessage id="orders" />,
  icon: icons.order,
  type: 'group',
  children: [
    {
      id: 'orders',
      title: <FormattedMessage id="orders" />,
      type: 'item',
      url: '/orders',
      icon: icons.order,
      children: [
        {
          id: 'sample-separation',
          title: <FormattedMessage id="sample-separation" />,
          type: 'item',
          url: '/orders/sample-separation',
          icon: icons.order
        },
        {
          id: 'quotations',
          title: <FormattedMessage id="quotations" />,
          type: 'item',
          url: '/orders/:orderId/quotations',
          icon: icons.order,
          children: [
            {
              id: 'quotation-detail',
              title: <FormattedMessage id="quotation-detail" />,
              type: 'item',
              url: '/orders/:orderId/quotations/:[quoteId]/detail',
              icon: icons.order
            }
          ]
        },
        {
          id: 'assignment-analysis',
          title: <FormattedMessage id="assignment-analysis" />,
          type: 'item',
          url: '/orders/:orderId/assignment-analysis',
          icon: icons.order
        },
        {
          id: 'result-entry-review',
          title: <FormattedMessage id="result-entry-review" />,
          type: 'item',
          url: '/orders/:orderId/result-entry-review',
          icon: icons.order
        },
      ]
    }
  ]
};

export default orders;
