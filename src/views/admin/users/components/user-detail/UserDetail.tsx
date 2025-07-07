import { ReactNode, SyntheticEvent, useState } from 'react';
// material-ui
import { Box } from '@mui/system';
import { Tab, Tabs } from '@mui/material';

// components import
import Information from './tabs/infomation/Information';
import AccessTime from './tabs/access-time/AccessTime';
import DeviceHistory from './tabs/device-history/DeviceHistory';
import RoleManagement from './tabs/role/RoleManagement';

interface TabPanelProps {
  children?: ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other}>
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`
  };
}

// ==============================|| EXPANDING TABLE - USER DETAILS ||============================== //
type ExpandingUserDetail = {
  data: any;
};

export default function ExpandingUserDetail({ data }: ExpandingUserDetail) {
  const [value, setValue] = useState(0);

  const handleChange = (event: SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example" sx={{ px: 3 }}>
          <Tab label="Thông tin" {...a11yProps(0)} />
          <Tab label="Phân quyền" {...a11yProps(1)} />
          <Tab label="Thời gian truy cập" {...a11yProps(2)} />
          <Tab label="Lịch sử thiết bị" {...a11yProps(4)} />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <Information data={data} />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <RoleManagement data={data} />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <AccessTime />
      </TabPanel>
      <TabPanel value={value} index={3}>
        <DeviceHistory />
      </TabPanel>
    </Box>
  );
}
