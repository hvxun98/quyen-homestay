// project-imports
// import applications from './applications';
// import widget from './widget';
// import formsTables from './forms-tables';
// import samplePage from './sample-page';
// import chartsMap from './charts-map';
// import support from './support';
// import pages from './pages';
import brands from './brands';
import customers from './customers';
import orders from './orders';
import request from './request';
import setting from './setting';
import users from './users';

// types
import { NavItemType } from 'types/menu';

// ==============================|| MENU ITEMS ||============================== //

const menuItems: { items: NavItemType[] } = {
  items: [users, orders, customers, setting, request, brands]
};

export default menuItems;
