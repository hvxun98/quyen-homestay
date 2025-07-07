import React from 'react';

// material-ui
import { Box } from '@mui/material';

// project-imports
import BasicTable from 'sections/tables/react-table/BasicTable';

function DeviceHistory() {
  return (
    <Box sx={{ pt: 2, pb: 1 }}>
      <BasicTable title="Lịch sử hoạt động" />
    </Box>
  );
}

export default DeviceHistory;
