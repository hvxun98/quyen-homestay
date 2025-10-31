'use client';
import { Box, Stack, Tab, Tabs } from '@mui/material';
import MainCard from 'components/MainCard';
import { Broom } from 'iconsax-react';
import React, { ReactNode, SyntheticEvent, useEffect, useState } from 'react';
import HouseItem from '../../../../components/rooms/HouseItem';
import { getRoomStats, getRoomsByStatus, updateRoomStatus } from 'services/rooms';
import Empty from 'components/Empty';

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
  const [roomStats, setRoomStats] = useState({
    total: 0,
    available: 0,
    booked: 0,
    occupied: 0,
    dirty: 0
  });
  const [roomData, setRoomData] = useState({
    availableRooms: [],
    bookedRooms: [],
    occupiedRooms: [],
    dirtyRooms: []
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (event: SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const fetchRoomStats = async () => {
    try {
      const data = await getRoomStats(); // Gọi API thống kê phòng
      setRoomStats(data);
    } catch (error) {
      console.error('Error fetching room stats', error);
    }
  };

  const fetchRooms = async (status: string) => {
    try {
      setLoading(true);
      const data = await getRoomsByStatus(status); // Gọi API lấy danh sách phòng theo trạng thái
      if (status === 'available') {
        setRoomData((prev) => ({ ...prev, availableRooms: data.houses }));
      } else if (status === 'booked') {
        setRoomData((prev) => ({ ...prev, bookedRooms: data.houses }));
      } else if (status === 'occupied') {
        setRoomData((prev) => ({ ...prev, occupiedRooms: data.houses }));
      } else if (status === 'dirty') {
        setRoomData((prev) => ({ ...prev, dirtyRooms: data.houses }));
      }
    } catch (error) {
      console.error('Error fetching rooms', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomStats(); // Lấy thống kê phòng
    fetchRooms('available'); // Lấy danh sách phòng trống khi lần đầu render
  }, []);

  useEffect(() => {
    // Fetch data khi chuyển tab
    const statusMap = ['available', 'booked', 'occupied', 'dirty'];
    fetchRooms(statusMap[value]);
  }, [value]);

  const handleAction = async (roomId: string, currentStatus: string) => {
    try {
      setLoading(true);
      await updateRoomStatus(roomId, currentStatus);
      // Sau khi thay đổi trạng thái, gọi lại API để làm mới dữ liệu
      fetchRooms(value === 0 ? 'available' : value === 1 ? 'booked' : value === 2 ? 'occupied' : 'dirty');
      fetchRoomStats();
    } catch (error) {
      console.error('Error changing room status:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <MainCard content={false} loading={loading} sx={{ minHeight: '300px' }}>
        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={value} onChange={handleChange} aria-label="basic tabs example" sx={{ px: 3 }}>
              <Tab label={`Trống (${roomStats?.available})`} {...a11yProps(0)} />
              <Tab label={`Đã đặt (${roomStats?.booked})`} {...a11yProps(1)} />
              <Tab label={`Đang ở (${roomStats?.occupied})`} {...a11yProps(2)} />
              <Tab
                label={
                  <Stack alignItems="center" flexDirection="row" gap={1}>
                    {`Bẩn (${roomStats?.dirty})`} <Broom size="16" />
                  </Stack>
                }
                {...a11yProps(3)}
              />
            </Tabs>
          </Box>
          <Box sx={{ px: 3, pb: 3 }}>
            <TabPanel value={value} index={0}>
              {roomData?.availableRooms?.length === 0 ? (
                <Box sx={{ textAlign: 'center', color: 'gray', paddingTop: 2 }}>
                  <Empty />
                </Box>
              ) : (
                roomData?.availableRooms?.map((house: any) => (
                  <HouseItem
                    key={house?.houseId}
                    name={house?.houseCode || house?.address}
                    totalRooms={house?.count}
                    rooms={house?.rooms}
                    type="success"
                    onAction={handleAction}
                  />
                ))
              )}
            </TabPanel>
            <TabPanel value={value} index={1}>
              {roomData?.bookedRooms?.length === 0 ? (
                <Box sx={{ textAlign: 'center', color: 'gray', paddingTop: 2 }}>
                  {' '}
                  <Empty />
                </Box>
              ) : (
                roomData?.bookedRooms?.map((house: any) => (
                  <HouseItem
                    key={house?.houseId}
                    name={house?.houseCode}
                    totalRooms={house?.count}
                    rooms={house?.rooms}
                    type="info"
                    onAction={handleAction}
                  />
                ))
              )}
            </TabPanel>
            <TabPanel value={value} index={2}>
              {roomData?.occupiedRooms?.length === 0 ? (
                <Box sx={{ textAlign: 'center', color: 'gray', paddingTop: 2 }}>
                  {' '}
                  <Empty />
                </Box>
              ) : (
                roomData?.occupiedRooms?.map((house: any) => (
                  <HouseItem
                    key={house?.houseId}
                    name={house?.houseCode}
                    totalRooms={house?.count}
                    rooms={house?.rooms}
                    type="error"
                    onAction={handleAction}
                  />
                ))
              )}
            </TabPanel>
            <TabPanel value={value} index={3}>
              {roomData?.dirtyRooms?.length === 0 ? (
                <Box sx={{ textAlign: 'center', color: 'gray', paddingTop: 2 }}>
                  {' '}
                  <Empty />
                </Box>
              ) : (
                roomData?.dirtyRooms?.map((house: any) => (
                  <HouseItem
                    key={house?.houseId}
                    name={house?.houseCode}
                    totalRooms={house?.count}
                    rooms={house?.rooms}
                    type="secondary"
                    onAction={handleAction}
                  />
                ))
              )}
            </TabPanel>
          </Box>
        </Box>
      </MainCard>
    </Box>
  );
}

export default RoomLayoutSimple;
