'use client';

import { Box, Button, Grid, Stack, TextField, Typography, Autocomplete, IconButton, Menu, MenuItem } from '@mui/material';
import { Add, SearchNormal1 } from 'iconsax-react';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { Column, CommonTable } from 'components/table/CommonTable';
import DeleteConfirmModal from 'components/modal/delete-modal/DeleteConfirmModal';
import SampleBreakdownTemplateModalAction from './SampleBreakdownTemplateModalAction';
import { deleteSampleTemplate, getSampleTemplates, getSampleTypes } from 'services/setting';
import { sampleTypeProps } from 'types/setting';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const inputStyles = { width: 200, height: 40, '& .MuiInputBase-root': { height: 40 }, background: 'white' };
const labelStyles = { fontWeight: 'bold' };

const SampleBreakdownTemplatesView = () => {
  const [data, setData] = useState<any[]>([]);
  const [sampleTypes, setSampleTypes] = useState<sampleTypeProps[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [isDeleteModal, setIsDeleteModal] = useState(false);
  const [isEditTemplate, setIsEditTemplate] = useState(false);
  const [reload, setReload] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const formik = useFormik({
    initialValues: {
      sampleTypeId: '',
      name: ''
    },
    onSubmit: () => fetchData()
  });

  const handleDelete = async () => {
    try {
      await deleteSampleTemplate(selectedRow?.id);
      setIsDeleteModal(false);
      setReload(!reload);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getSampleTemplates({
        ...formik.values,
        sampleTypeId: formik.values.sampleTypeId || undefined,
        page: pageNum,
        size: pageSize
      });
      setData(res.data.content || []);
      setTotalItems(res.data.total || 0);
    } catch (err) {
      console.error('Fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNum, pageSize, reload]);

  useEffect(() => {
    const fetchSampleTypes = async () => {
      try {
        const res = await getSampleTypes();
        setSampleTypes(res.data);
      } catch (err) {
        console.error('Failed to fetch sample types', err);
      }
    };
    fetchSampleTypes();
  }, []);

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, row: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => setAnchorEl(null);

  const menuItems = [
    {
      label: 'Sửa template',
      action: () => {
        setIsEditTemplate(true);
        handleMenuClose();
      }
    },
    {
      label: 'Xóa',
      action: () => {
        setIsDeleteModal(true);
        handleMenuClose();
      },
      color: 'error.main'
    }
  ];

  const columns: Column<any>[] = [
    {
      label: 'Tên',
      field: 'name',
      render: (row) => <Typography color="primary">{row.name}</Typography>
    },
    {
      label: 'Loại mẫu',
      field: 'sampleTypeId',
      render: (row) => {
        const sampleType = sampleTypes.find((type) => type.id === row.sampleTypeId);
        return sampleType?.name || '—';
      }
    },
    { label: 'Mô tả', field: 'description' },
    {
      label: 'Hành động',
      render: (row) => (
        <IconButton onClick={(e) => handleMenuOpen(e, row)}>
          <MoreVertIcon />
        </IconButton>
      )
    }
  ];

  return (
    <Box sx={{ pt: 2 }}>
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item>
            <Stack spacing={1}>
              <Typography sx={labelStyles}>Loại mẫu</Typography>
              <Autocomplete
                options={[{ id: '', name: 'Tất cả' }, ...sampleTypes]}
                getOptionLabel={(option) => option.name}
                onChange={(_, value) => formik.setFieldValue('sampleTypeId', value?.id || '')}
                value={[{ id: '', name: 'Tất cả' }, ...sampleTypes].find((opt) => opt.id === formik.values.sampleTypeId) || null}
                renderInput={(params) => <TextField {...params} placeholder="Loại mẫu" sx={inputStyles} size="small" />}
              />
            </Stack>
          </Grid>
          <Grid item>
            <Stack spacing={1}>
              <Typography sx={labelStyles}>Tên template</Typography>
              <TextField
                name="name"
                placeholder="Tìm template..."
                size="small"
                value={formik.values.name}
                onChange={formik.handleChange}
                sx={inputStyles}
              />
            </Stack>
          </Grid>
          <Grid item alignSelf="flex-end">
            <Button type="submit" variant="contained" sx={{ height: 40 }} startIcon={<SearchNormal1 />}>
              Tìm kiếm
            </Button>
          </Grid>
          <Grid item display="flex" alignItems="flex-end">
            <SampleBreakdownTemplateModalAction
              type="create"
              buttonProps={{ startIcon: <Add />, variant: 'contained', children: 'Thêm', sx: { height: 40 } }}
              reload={reload}
              setReload={setReload}
            />
          </Grid>
        </Grid>
      </form>

      <CommonTable
        data={data}
        columns={columns}
        totalItems={totalItems}
        pageNum={pageNum}
        pageSize={pageSize}
        onPageChange={setPageNum}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPageNum(1);
        }}
        getRowKey={(row) => row.id}
        loading={loading}
        scroll={{ y: 600 }}
      />

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        {menuItems.map((item, index) => (
          <MenuItem key={index} onClick={item.action} sx={{ color: item.color || undefined }}>
            {item.label}
          </MenuItem>
        ))}
      </Menu>

      {selectedRow && isEditTemplate && (
        <SampleBreakdownTemplateModalAction
          type="edit"
          initialData={selectedRow}
          onClose={() => setIsEditTemplate(false)}
          reload={reload}
          setReload={setReload}
        />
      )}

      <DeleteConfirmModal open={isDeleteModal} onConfirm={handleDelete} onClose={() => setIsDeleteModal(false)} />
    </Box>
  );
};

export default SampleBreakdownTemplatesView;
