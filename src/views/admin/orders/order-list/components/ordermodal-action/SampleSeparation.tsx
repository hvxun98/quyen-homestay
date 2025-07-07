'use client';

import {
  Box,
  Button,
  Checkbox,
  FormControl,
  Grid,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';

const SampleSeparation: React.FC = () => {
  const [rows, setRows] = useState<{ id: number; chiTieu: string; soLanLayMau: number; loai: string }[]>([]);

  const handleAddRow = () => {
    setRows([...rows, { id: rows.length + 1, chiTieu: '', soLanLayMau: 1, loai: '' }]);
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h5" gutterBottom>
        <FormattedMessage id="table.breakdownTable" defaultMessage="Bảng bóc tách" />
      </Typography>

      <Box sx={{ backgroundColor: '#e8f5e9', padding: 2, borderRadius: 1 }}>
        <Grid container spacing={2}>
          <Grid xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography sx={{ width: '30%' }}>
                <FormattedMessage id="label.sampleLocation" defaultMessage="Vị trí/tên mẫu" />
              </Typography>
              <FormControl fullWidth>
                <Select defaultValue="NB1/21">
                  <MenuItem value="NB1/21">NB1/21</MenuItem>
                  <MenuItem value="NB2/22">NB2/22</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Grid>
          <Grid xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography sx={{ width: '30%' }}>
                <FormattedMessage id="label.sampleType" defaultMessage="Loại mẫu" />
              </Typography>
              <FormControl fullWidth>
                <Select defaultValue="wasteSludge">
                  <MenuItem value="wasteSludge">Bùn thải</MenuItem>
                  <MenuItem value="wastewater">Nước thải</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={2} sx={{ marginTop: 2 }}>
        {[
          { id: 'label.customerSampleCode', defaultMsg: 'Mã mẫu của khách' },
          { id: 'label.sampleCondition', defaultMsg: 'Tình trạng, đặc điểm mẫu' },
          { id: 'label.sampleAmount', defaultMsg: 'Lượng mẫu' },
          { id: 'label.environmentCondition', defaultMsg: 'Điều kiện môi trường' },
          { id: 'label.latitude', defaultMsg: 'Vĩ độ (X)' },
          { id: 'label.longitude', defaultMsg: 'Kinh độ (Y)' }
        ].map((field, index) => (
          <Grid xs={12} md={6} key={field.id}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography sx={{ width: '30%' }}>
                <FormattedMessage id={field.id} defaultMessage={field.defaultMsg} />
              </Typography>
              <TextField fullWidth />
            </Box>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 2 }}>
        <Checkbox />
        <Typography>
          <FormattedMessage id="label.sampleQAQC" defaultMessage="Mẫu QA/QC" />
        </Typography>
        <Checkbox sx={{ marginLeft: 3 }} />
        <Typography>
          <FormattedMessage id="label.duplicateSample" defaultMessage="Mẫu lặp" />
        </Typography>
      </Box>

      <TableContainer component={Paper} sx={{ marginTop: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>
                <FormattedMessage id="table.indicator" defaultMessage="Chỉ tiêu" />
              </TableCell>
              <TableCell>
                <FormattedMessage id="table.sampleTimes" defaultMessage="Số lần lấy mẫu" />
              </TableCell>
              <TableCell>
                <FormattedMessage id="table.type" defaultMessage="Loại" />
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.id}</TableCell>
                <TableCell>
                  <TextField value={row.chiTieu} fullWidth />
                </TableCell>
                <TableCell>
                  <TextField type="number" value={row.soLanLayMau} fullWidth />
                </TableCell>
                <TableCell>
                  <TextField value={row.loai} fullWidth />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', marginTop: 2, gap: 2 }}>
        <Button variant="contained" color="primary" onClick={handleAddRow}>
          <FormattedMessage id="button.add" defaultMessage="Thêm" />
        </Button>
        <Button variant="contained" color="secondary">
          <FormattedMessage id="button.addAll" defaultMessage="Thêm tất cả" />
        </Button>
        <Button variant="contained" color="error">
          <FormattedMessage id="button.newIndicator" defaultMessage="Chỉ tiêu mới" />
        </Button>
      </Box>

      <Box sx={{ marginTop: 3, display: 'flex', gap: 2 }}>
        <Button variant="outlined">
          <FormattedMessage id="button.back" defaultMessage="Quay lại" />
        </Button>
        <Button variant="contained" color="primary">
          <FormattedMessage id="button.createRequest" defaultMessage="Tạo yêu cầu" />
        </Button>
      </Box>
    </Box>
  );
};

export default SampleSeparation;
