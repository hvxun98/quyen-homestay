import { Box, Grid, Typography } from '@mui/material';
import RoomCard from 'components/cards/statistics/RoomCard';
import Empty from 'components/Empty';
import React from 'react';
import { ColorProps } from 'types/extended';

interface HouseItemProps {
  name: string;
  totalRooms: number;
  rooms: any;
  type?: ColorProps;
  showMore?: boolean;
  onAction?: (roomId: string, status: string) => void;
}

function HouseItem({ name, totalRooms, type, showMore, rooms, onAction = () => {} }: HouseItemProps) {
  return (
    <Box sx={{ pt: 3 }}>
      <Typography variant="h5">
        {name} {`(${totalRooms})`}
      </Typography>

      <Grid container spacing={2} sx={{ pt: 2 }}>
        {rooms?.length > 0 ? (
          rooms.map((item: any, i: number) => (
            <Grid item xs={3} key={i}>
              <RoomCard
                title={item?.name}
                color={type}
                showMore={showMore}
                onAction={(status) => onAction(item?._id, status)}
                isDirty={item?.status?.includes('dirty')}
              />
            </Grid>
          ))
        ) : (
          <Empty />
        )}
      </Grid>
    </Box>
  );
}

export default HouseItem;
