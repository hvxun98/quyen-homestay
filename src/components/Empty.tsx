import { Stack, Typography } from '@mui/material';
import { Box1 } from 'iconsax-react';
import React from 'react';

interface EmptyProps {
  title?: string | React.ReactNode;
}

function Empty({ title = 'Không có dữ liệu' }: EmptyProps) {
  return (
    <Stack width={'100%'} justifyContent="center" alignItems="center">
      <Box1 style={{ fontSize: 60, marginBottom: 2 }} />
      <Typography variant="body1">{title}</Typography>
    </Stack>
  );
}

export default Empty;
