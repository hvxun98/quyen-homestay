'use client';
import { Box, Grid, TextField, Typography } from '@mui/material';
import SimpleDialog from 'components/SimpleDialog';
import { Column, CommonTable } from 'components/table/CommonTable';
import { Add } from 'iconsax-react';
import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { getBrands } from 'services/users';
import { BrandProps } from 'types/brands';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { createBrand } from 'services/brands';
import { INPUT_BASER_STYLE } from 'constants/style';

function BrandsView() {
  const [brands, setBrands] = useState<BrandProps[]>([]);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const validationSchema = Yup.object({
    name: Yup.string().required('Vui lòng nhập tên chi nhánh')
  });

  const formik = useFormik({
    initialValues: {
      name: '',
      description: ''
    },
    validationSchema,
    onSubmit: (values) => {
      console.log(values);
    }
  });

  useEffect(() => {
    getAllBrand();
  }, []);

  const getAllBrand = async () => {
    setLoading(true);
    const res = await getBrands();
    setBrands(res.data);
    setLoading(false);
  };

  const handleAddBrand = async (next: any) => {
    try {
      setLoadingSubmit(true);
      await createBrand({
        brandName: formik.values.name,
        description: formik.values.description
      });
      await getAllBrand();
      formik.resetForm();
      next();
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingSubmit(false);
    }
  };

  const columns: Column<BrandProps>[] = [
    { label: <FormattedMessage id="order.name" defaultMessage="Tên đơn hàng" />, field: 'brandName' },
    { label: <FormattedMessage id="order.id" defaultMessage="Mã đơn hàng" />, field: 'id' }
  ];

  return (
    <Box sx={{ pt: 2 }}>
      <SimpleDialog
        title="Thêm mới chi nhánh"
        content={
          <Box sx={{ width: 500 }}>
            <form onSubmit={formik.handleSubmit}>
              <Grid container gap={2}>
                <Grid item xs={12}>
                  <Typography sx={{ fontWeight: 'bold' }}>
                    <FormattedMessage id="brand.name" defaultMessage="Tên chi nhánh" />
                  </Typography>
                </Grid>
                <Grid item xs={12} sx={{ display: 'flex' }} alignItems="center" gap={2}>
                  <TextField
                    name="name"
                    placeholder="Nhập tên chi nhánh"
                    fullWidth
                    sx={INPUT_BASER_STYLE}
                    value={formik.values.name}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    helperText={formik.touched.name && (formik.errors.name as string)}
                    onChange={formik.handleChange}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography sx={{ fontWeight: 'bold' }}>
                    <FormattedMessage id="brand.description" defaultMessage="Ghi chú" />
                  </Typography>
                </Grid>

                <Grid item xs={12} sx={{ display: 'flex' }} alignItems="center" gap={2}>
                  <TextField
                    name="description"
                    placeholder="Nhập tên chi nhánh"
                    fullWidth
                    sx={INPUT_BASER_STYLE}
                    value={formik.values.description}
                    onChange={formik.handleChange}
                  />
                </Grid>
              </Grid>
            </form>
          </Box>
        }
        buttonProps={{ startIcon: <Add />, variant: 'contained', children: <FormattedMessage id="order.add" defaultMessage="Thêm mới" /> }}
        onAccept={async (next) => {
          const errors = await formik.validateForm();
          formik.setTouched({ name: true, description: true });

          if (Object.keys(errors).length === 0) {
            await handleAddBrand(next);
          }
        }}
        loadingSubmit={loadingSubmit}
      />

      <Box sx={{ py: 2 }}>
        <CommonTable
          columns={columns}
          data={brands}
          totalItems={brands?.length}
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
      </Box>
    </Box>
  );
}

export default BrandsView;
