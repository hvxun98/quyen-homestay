'use client';

import { Box, Button, Grid, Menu, MenuItem, Stack, TextField, Typography } from '@mui/material';
import DeleteConfirmModal from 'components/modal/delete-modal/DeleteConfirmModal';
import { Column, CommonTable } from 'components/table/CommonTable';
import { ROUTES } from 'constants/routes';
import { useFormik } from 'formik';
import { Add, HambergerMenu, SearchNormal1 } from 'iconsax-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { statusOptions, useOrders } from './components/ordermodal-action/OrderFieldConfigs';
import OrderModalAction from './components/ordermodal-action/OrderModalAction';
import MoreVertIcon from '@mui/icons-material/MoreVert';

export default function OrderView() {
  const router = useRouter();

  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState({ name: '', status: 1 });
  const { data, total, loading, reload } = useOrders(pageNum, pageSize, filters);

  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [openModal, setOpenModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [actionAnchor, setActionAnchor] = useState<null | HTMLElement>(null);

  const formik = useFormik({
    initialValues: { name: '', status: 1 },
    onSubmit: ({ name, status }) => {
      setPageNum(1);
      setFilters({ name, status });
    }
  });

  const columns: Column<any>[] = [
    { label: <FormattedMessage id="order.name" defaultMessage="Tên đơn hàng" />, field: 'name' },
    { label: <FormattedMessage id="order.id" defaultMessage="Mã đơn hàng" />, field: 'id' },
    {
      label: <FormattedMessage id="order.status" defaultMessage="Trạng thái" />,
      render: (row) => (
        <Typography fontWeight="bold" color={row.status === 1 ? 'blue' : 'gray'}>
          {row.status === 1 ? 'Hoạt động' : 'Bị xóa'}
        </Typography>
      )
    },
    {
      label: "",
      width: 120,
      render: (row) => (
        <Stack direction="row" spacing={1}>
          <Button
            variant='outlined'
            onClick={(e) => {
              setActionAnchor(e.currentTarget);
              setSelectedRow(row);
            }}
          >
            <MoreVertIcon />
          </Button>
          {/* <Button
            variant="outlined"
            size="small"
            endIcon={<HambergerMenu />}
            onClick={(e) => {
              setActionAnchor(e.currentTarget);
              setSelectedRow(row);
            }}
          >
            <FormattedMessage id="function" defaultMessage="Chức năng" />
          </Button> */}
          {/* <IconButton
            size="small"
            onClick={(e) => {
              setActionAnchor(e.currentTarget);
              setSelectedRow(row);
            }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton> */}
        </Stack>
      )
    }
  ];

  const actionMenu = [
    {
      value: 'standards',
      label: <FormattedMessage id="standards" defaultMessage="Quy chuẩn" />,
      route: ROUTES.SETTING_REGULATION
    },
    {
      value: 'sample-separation',
      label: <FormattedMessage id="sample-separation" defaultMessage="Bóc tách" />,
      route: (id: number) => ROUTES.ORDER_SAMPLE_SEPARATION(id)
    },
    {
      value: 'quotation',
      label: <FormattedMessage id="quotation" defaultMessage="Báo giá" />,
      route: (id: number) => ROUTES.QUOTATIONS(id)
    },
    {
      value: 'pre-quotation',
      label: <FormattedMessage id="pre-quotation" defaultMessage="Báo giá trước bóc tách" />,
      route: (id: number) => ROUTES.ORDER_PRE_QUOTATION(id)
    },
    {
      value: 'debt',
      label: <FormattedMessage id="debt" defaultMessage="Công nợ" />,
      route: (id: number) => ROUTES.ORDER_DEBT(id)
    },
    {
      value: 'monitoring-staff',
      label: <FormattedMessage id="monitoring-staff" defaultMessage="Nhân sự quan trắc" />,
      route: (id: number) => ROUTES.ORDER_MONITORING_STAFF(id)
    },
    {
      value: 'materials-chemicals',
      label: <FormattedMessage id="materials-chemicals" defaultMessage="Vật tư - hóa chất" />,
      route: (id: number) => ROUTES.ORDER_MATERIALS_CHEMICALS(id)
    },
    {
      value: 'preservation',
      label: <FormattedMessage id="preservation" defaultMessage="Bảo quản" />,
      route: (id: number) => ROUTES.ORDER_PRESERVATION(id)
    },
    {
      value: 'assignment-analysis',
      label: <FormattedMessage id="assignment-analysis" defaultMessage="Phân công/kết quả phân tích" />,
      route: (id: number) => ROUTES.ORDER_ASSIGNMENT_ANALYSIS(id)
    },
    {
      value: 'test-results',
      label: <FormattedMessage id="test-results" defaultMessage="Nhập/duyệt kết quả thử nghiệm" />,
      route: (id: number) => ROUTES.ORDER_TEST_RESULTS(id)
    },
    {
      value: 'field-comparison',
      label: <FormattedMessage id="field-comparison" defaultMessage="Đối chiếu hiện trường" />,
      route: (id: number) => ROUTES.ORDER_FIELD_COMPARISON(id)
    },
    {
      value: 'request',
      label: <FormattedMessage id="request" defaultMessage="Yêu cầu" />,
      route: (id: number) => ROUTES.ORDER_REQUEST(id)
    },
    {
      value: 'attachments',
      label: <FormattedMessage id="attachments" defaultMessage="File đính kèm" />,
      route: (id: number) => ROUTES.ORDER_ATTACHMENTS(id)
    },
    {
      value: 'field-data',
      label: <FormattedMessage id="field-data" defaultMessage="Dữ liệu hiện trường" />,
      route: (id: number) => ROUTES.ORDER_FIELD_DATA(id)
    },
    {
      value: 'reset-result-type',
      label: <FormattedMessage id="reset-result-type" defaultMessage="Đặt lại loại phiếu" />,
      route: (id: number) => ROUTES.ORDER_RESET_RESULT_TYPE(id)
    },
    {
      value: 'copy',
      label: <FormattedMessage id="copy" defaultMessage="Sao chép" />
    },
    {
      value: 'edit',
      label: <FormattedMessage id="edit" defaultMessage="Sửa đơn hàng" />,
      onClick: () => setOpenModal(true)
    },
    {
      value: 'delete',
      label: <FormattedMessage id="delete" defaultMessage="Xóa" />,
      color: 'error.main',
      onClick: () => setDeleteModal(true)
    }
  ];

  return (
    <Box sx={{ pt: 2, pb: 1 }}>
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item>
            <Stack spacing={1}>
              <Typography fontWeight="bold">
                <FormattedMessage id="status" defaultMessage="Trạng thái" />
              </Typography>
              <TextField
                select
                name="status"
                value={formik.values.status}
                onChange={formik.handleChange}
                size="small"
                sx={{ height: 40, width: 220, '& .MuiInputBase-root': { height: 40 }, background: 'white' }}
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          </Grid>
          <Grid item>
            <Stack spacing={1}>
              <Typography fontWeight="bold">
                <FormattedMessage id="search.order" defaultMessage="Đơn hàng" />
              </Typography>
              <TextField
                sx={{ height: 40, width: 220, '& .MuiInputBase-root': { height: 40 }, background: 'white' }}
                name="name"
                onChange={formik.handleChange}
                value={formik.values.name}
                placeholder="Nhập tên hoặc mã đơn hàng"
                size="small"
                type="search"
              />
            </Stack>
          </Grid>
          <Grid item alignSelf="flex-end">
            <Button type="submit" variant="contained" startIcon={<SearchNormal1 />} sx={{ height: 40 }}>
              <FormattedMessage id="search" defaultMessage="Tìm kiếm" />
            </Button>
          </Grid>
          <Grid item alignSelf="flex-end">
            <Button
              variant="contained"
              startIcon={<Add />}
              sx={{ height: 40, color: 'white' }}
              onClick={() => {
                setSelectedRow(null);
                setOpenModal(true);
              }}
            >
              <FormattedMessage id="order.add" defaultMessage="Thêm đơn hàng" />
            </Button>
          </Grid>
        </Grid>
      </form>

      <CommonTable
        columns={columns}
        data={data}
        totalItems={total}
        pageNum={pageNum}
        pageSize={pageSize}
        onPageChange={setPageNum}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPageNum(1);
        }}
        getRowKey={(row, index) => `${row.id}-${index}`}
        scroll={{ y: 600 }}
        loading={loading}
      />

      <Menu anchorEl={actionAnchor} open={Boolean(actionAnchor)} onClose={() => setActionAnchor(null)}>
        {actionMenu.map((item, idx) => (
          <MenuItem
            key={item.value ?? idx}
            onClick={() => {
              setActionAnchor(null);
              if (item.route) {
                const route = typeof item.route === 'function' ? item.route(selectedRow?.id) : item.route;
                router.push(route);
              } else if (item.onClick) {
                item.onClick();
              } else {
                console.log('Chưa xử lý hành động:', item.value);
              }
            }}

            sx={{ color: item.color }}
          >
            {item.label}
          </MenuItem>
        ))}
      </Menu>

      {openModal && (
        <OrderModalAction
          type={selectedRow ? 'edit' : 'create'}
          open={openModal}
          initialData={selectedRow}
          onClose={() => setOpenModal(false)}
          onSuccess={reload}
        />
      )}
      <DeleteConfirmModal open={deleteModal} onConfirm={() => setDeleteModal(false)} onClose={() => setDeleteModal(false)} />
    </Box>
  );
}
