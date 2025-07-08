import { Box, Grid, Typography } from '@mui/material';
import RoomCard from 'components/cards/statistics/RoomCard';
import React from 'react';
import { ColorProps } from 'types/extended';

interface HouseItemProps {
  name: string;
  totalRooms: number;
  rooms: any;
  type?: ColorProps;
  showMore?: boolean;
}

function HouseItem({ name, totalRooms, type, showMore, rooms }: HouseItemProps) {
  return (
    <Box sx={{ pt: 3 }}>
      <Typography variant="h5">
        {name} {`(${totalRooms})`}
      </Typography>

      <Grid container spacing={2} sx={{ pt: 2 }}>
        {Array(7)
          .fill(1)
          .map((item, i) => (
            <Grid item xs={3} key={i}>
              <RoomCard title={`Phòng ${i}`} color={type} showMore={showMore} />
            </Grid>
          ))}
      </Grid>
    </Box>
  );
}

export default HouseItem;
