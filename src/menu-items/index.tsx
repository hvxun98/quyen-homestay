// project-imports
// import applications from './applications';
// import widget from './widget';
// import formsTables from './forms-tables';
// import samplePage from './sample-page';
// import chartsMap from './charts-map';
// import support from './support';
// import pages from './pages';
import report from './report';
import orders from './orders';
import invoices from './invoices';
import roomsDiagram from './roomsDiagram';

// types
import { NavItemType } from 'types/menu';

// ==============================|| MENU ITEMS ||============================== //

const menuItems: { items: NavItemType[] } = {
  items: [roomsDiagram, orders, invoices, report]
};

export default menuItems;
