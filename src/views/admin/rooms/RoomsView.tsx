'use client';

import React, { useEffect, useState } from 'react';
import { Box, Button, FormControl, Grid, MenuItem, Select, Stack } from '@mui/material';
import { Column, CommonTable } from 'components/table/CommonTable';
import { Add, Edit, SearchNormal, Trash } from 'iconsax-react';
import { FormattedMessage } from 'react-intl';
import DeleteConfirmModal from 'components/modal/delete-modal/DeleteConfirmModal';
import RoomActionModal from './RoomAction';
import { INPUT_BASER_STYLE } from 'constants/style';

import { getRooms, deleteRoom } from 'services/rooms';
import { getHouses } from 'services/houses';
import { notifySuccess } from 'utils/notify';

function RoomsView() {
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);

  const [openAction, setOpenAction] = useState(false);
  const [isDeleteModal, setIsDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [rooms, setRooms] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [houses, setHouses] = useState<any[]>([]);
  const [houseId, setHouseId] = useState<string>('');

  const [selectedRoom, setSelectedRoom] = useState<any | null>(null);

  // load dropdown cơ sở
  useEffect(() => {
    (async () => {
      try {
        const res = await getHouses({ pageNum: 1, pageSize: 100 });
        setHouses(res.items || []);
        if (!houseId && res.items?.length) setHouseId(res.items[0]._id);
      } catch {
        setHouses([]);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await getRooms({ pageNum, pageSize, houseId });
      setRooms(res.items || []);
      setTotal(res.total || 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (houseId) fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNum, pageSize, houseId]);

  const onConfirmDelete = async () => {
    if (!selectedRoom?._id) return;
    setDeleting(true);
    try {
      await deleteRoom(selectedRoom._id);
      notifySuccess('Xoá phòng thành công');
      setIsDeleteModal(false);
      setSelectedRoom(null);
      fetchList();
    } finally {
      setDeleting(false);
    }
  };

  const columns: Column<any>[] = [
    { label: <FormattedMessage id="Mã" defaultMessage="Mã" />, field: 'code' },
    { label: <FormattedMessage id="Tên phòng" defaultMessage="Tên phòng" />, field: 'name' },
    { label: <FormattedMessage id="Loại phòng" defaultMessage="Loại phòng" />, field: 'type' },
    {
      label: <FormattedMessage id="Tác vụ" defaultMessage="Tác vụ" />,
      render: (row) => (
        <Stack direction="row" gap={1}>
          <Button
            color="primary"
            variant="contained"
            onClick={() => {
              setSelectedRoom(row);
              setOpenAction(true);
            }}
            startIcon={<Edit />}
          >
            Sửa
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              setSelectedRoom(row);
              setIsDeleteModal(true);
            }}
            startIcon={<Trash />}
          >
            Xoá
          </Button>
        </Stack>
      ),
      width: 200
    }
  ];

  return (
    <Box sx={{ pt: 2 }}>
      <Grid container spacing={2} alignItems="center">
        {/* Cơ sở */}
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <FormControl fullWidth>
            <Select value={houseId} onChange={(e) => setHouseId(String(e.target.value))} sx={INPUT_BASER_STYLE}>
              {houses.map((h) => (
                <MenuItem key={h._id} value={h._id}>
                  {h.code || h.name || h.address}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Nút */}
        <Grid item>
          <Stack direction="row" gap={2}>
            <Button color="primary" variant="contained" onClick={fetchList} startIcon={<SearchNormal />}>
              Tìm kiếm
            </Button>
            <Button
              color="primary"
              variant="contained"
              onClick={() => {
                setSelectedRoom(null);
                setOpenAction(true);
              }}
              startIcon={<Add />}
            >
              Thêm phòng
            </Button>
          </Stack>
        </Grid>
      </Grid>

      <Box sx={{ py: 2 }}>
        <CommonTable
          columns={columns}
          data={rooms}
          totalItems={total}
          pageNum={pageNum}
          pageSize={pageSize}
          onPageChange={setPageNum}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPageNum(1);
          }}
          getRowKey={(row, index) => `${row._id || row.code}-${index}`}
          scroll={{ y: 600 }}
          loading={loading}
        />
      </Box>

      <RoomActionModal
        open={openAction}
        onClose={() => {
          setOpenAction(false);
          setSelectedRoom(null);
        }}
        onSuccess={() => fetchList()}
        initialData={selectedRoom || undefined}
      />

      <DeleteConfirmModal
        title="Xoá phòng"
        description={`Bạn có chắc chắn muốn xoá phòng ${selectedRoom?.code || ''}?`}
        open={isDeleteModal}
        loading={deleting}
        onConfirm={onConfirmDelete}
        onClose={() => setIsDeleteModal(false)}
      />
    </Box>
  );
}

export default RoomsView;
