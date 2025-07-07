// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { TaskSquare } from 'iconsax-react';

// types
import { ROUTES } from 'constants/routes';
import { NavItemType } from 'types/menu';

// icons
const icons = {
  request: TaskSquare
};

// ==============================|| MENU ITEMS - SETTINGS ||============================== //

const request: NavItemType = {
  id: 'group-request',
  title: <FormattedMessage id="request" />,
  icon: icons.request,
  type: 'group',
  children: [
    {
      id: 'analysis-requests',
      title: <FormattedMessage id="analysis-requests" />,
      type: 'item',
      url: ROUTES.ANALYSIS_REQUESTS,
      icon: icons.request,
    },
    {
      id: 'scan-requests',
      title: <FormattedMessage id="scan-requests" />,
      type: 'item',
      url: ROUTES.SCAN_REQUESTS,
      icon: icons.request,
    }
  ]
};

export default request;
