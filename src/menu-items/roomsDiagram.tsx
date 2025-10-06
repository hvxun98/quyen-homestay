// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { UserTag, AlignHorizontally, Box1 } from 'iconsax-react';

// types
import { NavItemType } from 'types/menu';

// icons
const icons = {
  users: UserTag
};

// ==============================|| MENU ITEMS - WIDGETS ||============================== //

const roomsDiagram: NavItemType = {
  id: 'group-user',
  title: <FormattedMessage id="rooms diagram" defaultMessage="Sơ đồ phòng" />,
  icon: icons.users,
  type: 'group',
  children: [
    {
      id: 'Sơ đồ phòng',
      title: <FormattedMessage id="Time line" defaultMessage="Time line" />,
      type: 'item',
      url: '/admin/room-layout/timeline',
      icon: AlignHorizontally
    },
    {
      id: 'Sơ đồ phòng',
      title: <FormattedMessage id="normal" defaultMessage="Đơn giản" />,
      type: 'item',
      url: '/admin/room-layout/simple',
      icon: Box1,
      breadcrumbs: false
    }
  ]
};

export default roomsDiagram;
