'use client';

import { Box, Button, IconButton, TextField } from '@mui/material';
import { Add, CloseCircle, Edit2 } from 'iconsax-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import DeleteConfirmModal from 'components/modal/delete-modal/DeleteConfirmModal';
import { Column, CommonTable } from 'components/table/CommonTable';
import { ROUTES } from 'constants/routes';
import DashboardLayout from 'layout/DashboardLayout';
import { addMonitoringSchedule, deleteMonitoringSchedule, fetchMonitoringSchedules } from 'services/customers';
import { MonitoringSchedule } from 'types/customer';
import AuthGuard from 'utils/route-guard/AuthGuard';

function MonitoringScheduleView() {
  const { locationId, customerId } = useParams();

  const [schedules, setSchedules] = useState<MonitoringSchedule[]>([]);
  const [selectedRow, setSelectedRow] = useState<MonitoringSchedule | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isDelete, setIsDelete] = useState(false);
  const [reload, setReload] = useState(false);

  const getSchedules = async () => {
    try {
      const res = await fetchMonitoringSchedules(Number(locationId), {
        page: 1
      });
      setSchedules(res.data);
    } catch (err) {
      console.error('Failed to fetch monitoring schedules', err);
    }
  };

  useEffect(() => {
    getSchedules();
  }, [reload]);

  const handleAdd = () => {
    setSchedules([
      ...schedules,
      {
        id: 0,
        clientLocationId: Number(locationId),
        processDay: 1,
        processMonth: 1,
        processYear: new Date().getFullYear()
      }
    ]);
    setEditingIndex(schedules.length);
  };

  const handleRemove = (index: number) => {
    setSchedules(schedules.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: 'processDay' | 'processMonth' | 'processYear', value: string) => {
    const updated = [...schedules];
    updated[index][field] = Number(value);
    setSchedules(updated);
  };

  const handleSave = async () => {
    const payload = schedules.map((item) => ({
      processDay: item.processDay,
      processMonth: item.processMonth,
      processYear: item.processYear
    }));

    try {
      await addMonitoringSchedule(Number(locationId), payload);
      setReload(!reload);
      setEditingIndex(null);
    } catch (error) {
      console.error('Failed to save schedules', error);
    }
  };

  const handleDelete = async () => {
    await deleteMonitoringSchedule(selectedRow?.id);
    setIsDelete(false);
    setReload(!reload);
  };

  const columns: Column<MonitoringSchedule>[] = [
    { label: 'Đợt', render: (_, index) => `Đợt ${index + 1}` },
    {
      label: 'Ngày quan trắc',
      render: (row, index) => (
        <TextField
          type="number"
          value={row.processDay || ''}
          onChange={(e) => handleChange(index, 'processDay', e.target.value)}
          size="small"
          disabled={editingIndex !== index}
        />
      )
    },
    {
      label: 'Tháng quan trắc',
      render: (row, index) => (
        <TextField
          type="number"
          value={row.processMonth || ''}
          onChange={(e) => handleChange(index, 'processMonth', e.target.value)}
          size="small"
          disabled={editingIndex !== index}
        />
      )
    },
    {
      label: 'Năm quan trắc',
      render: (row, index) => (
        <TextField
          type="number"
          value={row.processYear || ''}
          onChange={(e) => handleChange(index, 'processYear', e.target.value)}
          size="small"
          disabled={editingIndex !== index}
        />
      )
    },
    {
      label: 'Hành động',
      render: (_, index) => (
        <Box>
          <IconButton color="primary" onClick={() => setEditingIndex(index)}>
            <Edit2 size={18} />
          </IconButton>
          <IconButton color="error" onClick={() => handleRemove(index)}>
            <CloseCircle />
          </IconButton>
        </Box>
      )
    }
  ];

  return (
    <AuthGuard>
      <DashboardLayout backHref={ROUTES.CUSTOMER_LOCATION(Number(customerId))}>
        <Box sx={{ pt: 2, pb: 1 }}>
          <Button variant="contained" startIcon={<Add />} onClick={handleAdd} sx={{ mb: 2 }}>
            Thêm đợt quan trắc
          </Button>

          <Button variant="outlined" onClick={handleSave} sx={{ mb: 2, ml: 2 }}>
            Lưu tất cả đợt quan trắc
          </Button>

          <CommonTable
            columns={columns}
            data={schedules}
            totalItems={schedules.length}
            pageNum={1}
            pageSize={schedules.length}
            onPageChange={() => {}}
            onPageSizeChange={() => {}}
            getRowKey={(row, index) => `${row.id || 'new'}-${index}`}
            scroll={{ y: 600 }}
            loading={false}
          />

          <DeleteConfirmModal open={isDelete} onConfirm={handleDelete} onClose={() => setIsDelete(false)} />
        </Box>
      </DashboardLayout>
    </AuthGuard>
  );
}

export default MonitoringScheduleView;
