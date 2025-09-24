'use client';

import { Box, Button, Stack } from '@mui/material';
import { Column, CommonTable } from 'components/table/CommonTable';
import { Add, Edit, Trash } from 'iconsax-react';
import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import HouseActionModal from './HouseAction';
import DeleteConfirmModal from 'components/modal/delete-modal/DeleteConfirmModal';

import { getHouses, deleteHouse } from 'services/houses'; // ✅ dùng service
import { notifySuccess } from 'utils/notify'; // ✅ toast thành công

function HouseView() {
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);

  const [openAction, setOpenAction] = useState(false);
  const [isDeleteModal, setIsDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [houses, setHouses] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedHouse, setSelectedHouse] = useState<any | null>(null);

  const getAllHouses = async () => {
    setLoading(true);
    try {
      // ⚠️ service getHouses nhận pageNum/pageSize
      const res = await getHouses({ pageNum, pageSize });
      setHouses(res.items || []);
      setTotal(res.total || 0);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      setHouses([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllHouses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNum, pageSize]);

  const onConfirmDelete = async () => {
    if (!selectedHouse?._id) return;
    setDeleting(true);
    try {
      await deleteHouse(selectedHouse._id);
      notifySuccess('Xoá nhà thành công');
      setIsDeleteModal(false);
      setSelectedHouse(null);
      // refresh list
      // nếu sau xoá trang hiện tại rỗng, có thể lùi pageNum (optional)
      getAllHouses();
    } finally {
      setDeleting(false);
    }
  };

  const columns: Column<any>[] = [
    { label: <FormattedMessage id="Tên" defaultMessage="Tên" />, field: 'code' },
    { label: <FormattedMessage id="Địa chỉ" defaultMessage="Địa chỉ" />, field: 'address' },
    { label: <FormattedMessage id="Số tầng" defaultMessage="Số tầng" />, field: 'numOfFloors' },
    { label: <FormattedMessage id="Số phòng" defaultMessage="Số phòng" />, field: 'numOfRooms' },
    {
      label: <FormattedMessage id="Giá thuê" defaultMessage="Giá thuê" />,
      field: 'price',
      render: (row) => new Intl.NumberFormat('vi-VN').format(row.price) + ' VND'
    },
    {
      label: <FormattedMessage id="Tác vụ" defaultMessage="Tác vụ" />,
      render: (row) => (
        <Stack flexDirection="row" gap={1}>
          <Button
            color="primary"
            variant="contained"
            onClick={() => {
              setSelectedHouse(row);
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
              setSelectedHouse(row);
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
      <Button color="primary" variant="contained" onClick={() => setOpenAction(true)} startIcon={<Add />}>
        Thêm nhà
      </Button>

      <Box sx={{ py: 2 }}>
        <CommonTable
          columns={columns}
          data={houses}
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

      <HouseActionModal
        open={openAction}
        onClose={() => {
          setOpenAction(false);
          setSelectedHouse(null);
        }}
        onSuccess={() => getAllHouses()}
        initialData={selectedHouse || undefined}
      />

      <DeleteConfirmModal
        title="Xoá nhà"
        description={
          <span>
            Bạn có chắc chắn muốn xoá nhà <strong>{selectedHouse?.code}</strong> không ?
          </span>
        }
        open={isDeleteModal}
        onConfirm={onConfirmDelete}
        onClose={() => setIsDeleteModal(false)}
        loading={deleting}
      />
    </Box>
  );
}

export default HouseView;
