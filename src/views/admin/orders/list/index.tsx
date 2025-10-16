'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, FormControl, Grid, MenuItem, Select, TextField, Stack } from '@mui/material';
import { Column, CommonTable } from 'components/table/CommonTable';
import { Add, Edit, SearchNormal1, Trash } from 'iconsax-react';
import { FormattedMessage } from 'react-intl';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import ActionBookingModal from './OrderAction';
import DeleteConfirmModal from 'components/modal/delete-modal/DeleteConfirmModal';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { INPUT_BASER_STYLE } from 'constants/style';

// Services (bạn đã có axios fetcher)
import { getHouses } from 'services/houses';
import { getRoomOptions } from 'services/rooms';
import { getBookings } from 'services/bookings';
import { RoomGroup } from 'types/room';

// ---- Types khớp API ---------------------------------------------------------

type HouseOption = { _id: string; code: string; address?: string };

function toYMD(d: Dayjs | null) {
  return d ? d.format('YYYY-MM-DD') : '';
}

export default function Orders() {
  // ---- State ---------------------------------------------------------------
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [openAction, setOpenAction] = useState(false);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [isDeleteModal, setIsDeleteModal] = useState(false);

  const [houses, setHouses] = useState<HouseOption[]>([]);
  const [housesLoading, setHousesLoading] = useState(false);
  const [roomGroups, setRoomGroups] = useState<RoomGroup[]>([]);

  // booking đang được sửa (undefined = tạo mới)
  const [editingBooking, setEditingBooking] = useState<any | undefined>(undefined);

  // mở modal để sửa booking
  function handleEdit(row: any) {
    setEditingBooking(row);
    setOpenAction(true);
  }

  useEffect(() => {
    (async () => {
      try {
        const res = await getRoomOptions();
        const items: RoomGroup[] = (res?.items ?? []).map((g: any) => ({
          houseId: String(g.houseId ?? g._id),
          houseLabel: g.houseLabel,
          rooms: (g.rooms ?? []).map((r: any) => ({ _id: String(r._id), label: r.label ?? r.name ?? r.code }))
        }));
        setRoomGroups(items);
      } catch (e) {
        console.error(e);
        setRoomGroups([]);
      }
    })();
  }, []);

  // ---- Form filter ---------------------------------------------------------
  const validationSchema = Yup.object({
    houseId: Yup.string().required('Chọn cơ sở')
  });

  const formik = useFormik({
    initialValues: {
      houseId: '', // sẽ set sau khi fetch houses
      customerName: '',
      fromDate: dayjs().startOf('month'),
      toDate: dayjs().endOf('month')
    },
    validationSchema,
    onSubmit: () => {
      setPageNum(1);
      fetchBookingsList(1, pageSize);
    }
  });

  const selectedHouseLabel = useMemo(() => {
    const found = houses.find((h) => h._id === formik.values.houseId);
    // Bạn có thể ghép thêm địa chỉ: `${found?.code} — ${found?.address}`
    return found?.code ?? '';
  }, [houses, formik.values.houseId]);

  // ---- Columns hiển thị ----------------------------------------------------
  const columns: Column<any>[] = [
    { label: <FormattedMessage id="Mã" defaultMessage="Mã" />, field: 'orderCode' },
    { label: <FormattedMessage id="Tên" defaultMessage="Tên" />, field: 'customerName' },
    {
      label: <FormattedMessage id="Phòng" defaultMessage="Phòng" />,
      field: 'roomId',
      render: (row: any) => {
        if (!row) return '';
        if (row.roomLabel) return row.roomLabel;
        const rid = row.roomId;
        if (!rid) return '';
        if (typeof rid === 'object') {
          return rid.name ?? rid.label ?? rid.code ?? String(rid._id ?? '');
        }
        return String(rid);
      }
    },
    {
      label: <FormattedMessage id="Checkin - Checkout" defaultMessage="Checkin - Checkout" />,
      render: (r) => {
        const ci = dayjs(r.checkIn).format('HH:mm DD/MM/YYYY');
        const co = dayjs(r.checkOut).format('HH:mm DD/MM/YYYY');
        return `${ci} - ${co}`;
      }
    },
    {
      label: <FormattedMessage id="Ngày tạo" defaultMessage="Ngày tạo" />,
      render: (r) => dayjs(r.createdAt).format('HH:mm DD/MM/YYYY')
    },
    {
      label: <FormattedMessage id="Giá" defaultMessage="Giá" />,
      render: (r) => r.price.toLocaleString('vi-VN') + ' VND'
    },
    {
      label: <FormattedMessage id="Trạng thái" defaultMessage="Trạng thái" />,
      render: (r) => (r.status === 'success' ? 'Thành công' : r.status === 'cancelled' ? 'Huỷ' : 'Đang xử lý')
    },
    {
      label: <FormattedMessage id="Tác vụ" defaultMessage="Tác vụ" />,
      render: (r) => (
        <Stack flexDirection="row" gap={1}>
          <Button color="primary" variant="contained" startIcon={<Edit />} onClick={() => handleEdit(r)}>
            Sửa
          </Button>
          <Button color="error" variant="contained" startIcon={<Trash />} onClick={() => setIsDeleteModal(true)}>
            Huỷ
          </Button>
        </Stack>
      )
    }
  ];

  // ---- Fetch houses (response {items,total,page,size}) ---------------------
  async function fetchHouses() {
    try {
      setHousesLoading(true);
      const res = await getHouses({ pageNum: 1, pageSize: 100 }); // tuỳ bạn phân trang
      // res shape: { items: [...], total, page, size }
      const items = res?.items ?? [];
      const opts: HouseOption[] = items.map((h: any) => ({
        _id: h._id,
        code: h.code,
        address: h.address
      }));
      setHouses(opts);

      // set houseId mặc định lần đầu & load bookings
      if (!formik.values.houseId && opts[0]?._id) {
        formik.setFieldValue('houseId', opts[0]._id, false);
        await fetchBookingsList(1, pageSize, opts[0]._id);
      }
    } catch (e) {
      console.error(e);
      setHouses([]);
    } finally {
      setHousesLoading(false);
    }
  }
  useEffect(() => {
    fetchHouses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Fetch list bookings -------------------------------------------------
  async function fetchBookingsList(page = pageNum, size = pageSize, houseIdOverride?: string) {
    try {
      setLoading(true);
      const res = await getBookings({
        houseId: houseIdOverride ?? (formik.values.houseId || undefined),
        q: formik.values.customerName?.trim() || undefined,
        from: formik.values.fromDate ? toYMD(formik.values.fromDate) : undefined,
        to: formik.values.toDate ? toYMD(formik.values.toDate) : undefined,
        dateField: 'createdAt',
        pageNum: page,
        pageSize: size,
        sort: '-createdAt'
      });

      const data = res?.data ?? res?.rows ?? res ?? [];
      const meta = res?.meta ?? {};
      setRows(data);
      setTotal(meta.total ?? (Array.isArray(data) ? data.length : 0));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // ---- Render --------------------------------------------------------------
  return (
    <Box sx={{ pt: 2 }}>
      {/* Filter */}
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={2} alignItems="center">
          {/* Cơ sở (houses từ API: items) */}
          <Grid item xs={12} sm={6} md={6} xl={2}>
            <FormControl fullWidth>
              <Select
                sx={INPUT_BASER_STYLE}
                name="houseId"
                value={formik.values.houseId}
                onChange={(e) => {
                  formik.handleChange(e);
                  setPageNum(1);
                  fetchBookingsList(1, pageSize, String(e.target.value));
                }}
                disabled={housesLoading || houses.length === 0}
                displayEmpty
              >
                {houses.map((h) => (
                  <MenuItem key={h._id} value={h._id}>
                    {h.code /* hoặc `${h.code} — ${h.address}` */}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Tên khách */}
          <Grid item xs={12} sm={6} md={6} xl={2}>
            <TextField
              sx={INPUT_BASER_STYLE}
              fullWidth
              name="customerName"
              placeholder="Tên khách hàng"
              value={formik.values.customerName}
              onChange={formik.handleChange}
            />
          </Grid>

          {/* Từ ngày */}
          <Grid item xs={12} sm={6} md={6} xl={2}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DesktopDatePicker
                sx={INPUT_BASER_STYLE}
                value={formik.values.fromDate}
                onChange={(val) => formik.setFieldValue('fromDate', val)}
                label="Từ ngày"
              />
            </LocalizationProvider>
          </Grid>

          {/* Đến ngày */}
          <Grid item xs={12} sm={6} md={6} xl={2}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DesktopDatePicker
                sx={INPUT_BASER_STYLE}
                value={formik.values.toDate}
                onChange={(val) => formik.setFieldValue('toDate', val)}
                label="Đến ngày"
              />
            </LocalizationProvider>
          </Grid>

          {/* Nút */}
          <Grid item>
            <Stack flexDirection="row" gap={2}>
              <Button type="submit" variant="contained" startIcon={<SearchNormal1 />}>
                Tìm kiếm
              </Button>
              <Button
                color="primary"
                variant="contained"
                onClick={() => {
                  setOpenAction(true);
                  setEditingBooking(undefined);
                }}
                startIcon={<Add />}
                disabled={!formik.values.houseId}
              >
                Đặt phòng
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </form>

      {/* Bảng */}
      <Box sx={{ py: 2 }}>
        <CommonTable
          columns={columns}
          data={rows}
          totalItems={total}
          pageNum={pageNum}
          pageSize={pageSize}
          onPageChange={(p) => {
            setPageNum(p);
            fetchBookingsList(p, pageSize);
          }}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPageNum(1);
            fetchBookingsList(1, size);
          }}
          getRowKey={(row) => row.id}
          scroll={{ y: 600 }}
          loading={loading}
        />
      </Box>

      {/* Modal tạo đơn */}
      {roomGroups?.length > 0 && (
        <ActionBookingModal
          open={openAction}
          booking={editingBooking}
          onClose={() => setOpenAction(false)}
          roomGroups={roomGroups}
          onCreated={() => {
            setOpenAction(false);
            fetchBookingsList(1, pageSize);
          }}
        />
      )}

      {/* Modal confirm huỷ (TODO: ghép DELETE /api/bookings/[id]) */}
      <DeleteConfirmModal
        title="Hủy đặt phòng"
        description={`Bạn có chắc chắn muốn hủy đặt phòng tại ${selectedHouseLabel} không?`}
        open={isDeleteModal}
        onConfirm={() => setIsDeleteModal(false)}
        onClose={() => setIsDeleteModal(false)}
      />
    </Box>
  );
}
