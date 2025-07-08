'use client';
import { Box, Stack, Tab, Tabs } from '@mui/material';
import MainCard from 'components/MainCard';
import { Broom } from 'iconsax-react';
import React, { ReactNode, SyntheticEvent, useState } from 'react';
import HouseItem from '../../../../components/rooms/HouseItem';

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

function RoomLayoutSimple() {
  const [value, setValue] = useState(0);

  const handleChange = (event: SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <MainCard content={false}>
        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={value} onChange={handleChange} aria-label="basic tabs example" sx={{ px: 3 }}>
              <Tab label={`Trống (${0})`} {...a11yProps(0)} />
              <Tab label={`Đã đặt (${0})`} {...a11yProps(1)} />
              <Tab label={`Đang ở (${0})`} {...a11yProps(2)} />
              <Tab
                label={
                  <Stack alignItems="center" flexDirection="row" gap={1}>
                    {`Bẩn (${0})`} <Broom size="16" />
                  </Stack>
                }
                {...a11yProps(3)}
              />
            </Tabs>
          </Box>
          <Box sx={{ px: 3, pb: 3 }}>
            <TabPanel value={value} index={0}>
              <HouseItem
                name="690 Lạc Long Quân"
                totalRooms={4}
                rooms={[
                  {
                    name: 'Std 201 LLQ',
                    status: 1
                  }
                ]}
                type="success"
              />
            </TabPanel>
            <TabPanel value={value} index={1}>
              <HouseItem
                name="880 Bạch Đằng"
                totalRooms={4}
                rooms={[
                  {
                    name: 'Std 201 LLQ',
                    status: 1
                  }
                ]}
                type="info"
              />
            </TabPanel>
            <TabPanel value={value} index={2}>
              <HouseItem
                name="880 Bạch Đằng"
                totalRooms={4}
                rooms={[
                  {
                    name: 'Std 201 LLQ',
                    status: 1
                  }
                ]}
                type="error"
              />
            </TabPanel>
            <TabPanel value={value} index={3}>
              <HouseItem
                name="880 Bạch Đằng"
                totalRooms={4}
                rooms={[
                  {
                    name: 'Std 201 LLQ',
                    status: 1
                  }
                ]}
                type="secondary"
              />
            </TabPanel>
          </Box>
        </Box>
      </MainCard>
    </Box>
  );
}

export default RoomLayoutSimple;
