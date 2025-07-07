'use client';

import { useEffect, useState } from 'react';

// material-ui
import Fade from '@mui/material/Fade';
import Modal from '@mui/material/Modal';
import Stack from '@mui/material/Stack';
import Button, { ButtonProps } from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Backdrop from '@mui/material/Backdrop';
import CardContent from '@mui/material/CardContent';
import { Box, FormControl, FormHelperText, Grid, IconButton, InputAdornment, MenuItem, Select, TextField, Typography } from '@mui/material';

// third-party
import { Add, Eye, EyeSlash } from 'iconsax-react';
import * as Yup from 'yup';
import { useFormik } from 'formik';

// project-imports
import MainCard from 'components/MainCard';
import { countriesPhoneNumber } from 'constants/countries';
import { copyUser, createUser, updateUser } from 'services/users';
import LoadingButton from 'components/@extended/LoadingButton';
import { notifySuccess, notifyWarning } from 'utils/notify';
import { useAppDispatch, useAppSelector } from 'store/hook';
import { ProvinceProps } from 'types/province';
import { fetchProvinces } from 'services/metadata';
import { setStateProvinces } from 'store/slices/app';
import DatePickerCustom from 'components/DatePickerStandard';
import { INPUT_BASER_STYLE } from 'constants/style';

// ==============================|| MODAL - TRANSITIONS ||============================== //

interface UserActionModalProps {
  type: 'create' | 'edit' | 'copy';
  buttonProps?: ButtonProps;
  data?: any;
  onFormSubmit?: (value?: any) => void;
}

const inputStyles = { width: '100%', height: 40, m: 0, fontSize: 16 };
const labelStyles = { width: '100%', height: 40, m: 0, fontSize: 14, pt: 2, whiteSpace: 'no-wrap' };

export default function UserActionModal({ type, data, buttonProps, onFormSubmit = Function }: UserActionModalProps) {
  const [open, setOpen] = useState(false);
  const dispatch = useAppDispatch();
  const provinces = useAppSelector((state) => state.app.provinces);
  const [loading, setLoading] = useState<boolean>(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    formik.resetForm();
  };

  useEffect(() => {
    const getProvince = async () => {
      const res = await fetchProvinces();

      dispatch(setStateProvinces(res));
    };
    getProvince();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validationSchema = Yup.object({
    name: Yup.string().required('Vui lòng nhập tên người dùng'),
    login: Yup.string().required('Vui lòng nhập tên đăng nhập'),
    password: type === 'create' ? Yup.string().min(6, 'Mật khẩu ít nhất 6 ký tự').required('Mật khẩu là bắt buộc') : Yup.string(),
    confirmPassword:
      type === 'create'
        ? Yup.string()
            .oneOf([Yup.ref('password')], 'Mật khẩu không khớp')
            .required('Vui lòng xác nhận mật khẩu')
        : Yup.string(),
    // role: Yup.number().required('Vui lòng chọn vai trò'),
    // branch: Yup.number().required('Vui lòng chọn chi nhánh'),
    // country: Yup.number().required('Vui lòng chọn quốc gia'),
    phone: Yup.string().matches(/^\d+$/, 'Số điện thoại không hợp lệ').required('Vui lòng nhập số điện thoại'),

    email: Yup.string().email('Email không hợp lệ').required('Vui lòng nhập email'),
    address: Yup.string().required('Vui lòng nhập địa chỉ'),
    // area: Yup.number().required('Vui lòng chọn khu vực'),
    // px: Yup.number().required('Vui lòng chọn phường xã'),
    birthday: Yup.date().required('Vui lòng chọn ngày sinh')
  });

  const formik = useFormik({
    initialValues: {
      name: type === 'edit' && data ? `${data.firstName || ''} ${data.lastName || ''}` : '',
      login: data?.login || '',
      password: '',
      confirmPassword: '',
      country: countriesPhoneNumber[0].phone,
      phone: data?.phone || '',
      showPassword: false,
      showConfirmPassword: false,
      email: data?.email || '',
      address: data?.address || '',
      area: data?.area || undefined,
      birthday: data?.birthday || undefined,
      note: data?.note || ''
    },
    validationSchema,
    onSubmit: (values) => {
      console.log(values);
      handleSubmitForm(values);
    }
  });
  const { handleChange } = formik;

  const handleSubmitForm = async (values: any) => {
    const { name, login, password, phone, email, birthday, address, area, note } = values;
    switch (type) {
      case 'create':
        try {
          setLoading(true);
          await createUser({
            login: login,
            firtName: name?.split(' ')[0],
            lastName: name?.split(' ')?.slice(1).join(' '),
            password: password,
            phone: phone,
            email: email,
            birthday: birthday,
            address: address,
            deliveryArea: area,
            note: note
          });
          setOpen(false);
          formik.resetForm();
          onFormSubmit();
          notifySuccess('Thực hiện thành công');
        } catch (errMessage) {
          notifyWarning((errMessage as string) || 'Something went wrong');
        } finally {
          setLoading(false);
        }
        break;
      case 'edit':
        try {
          setLoading(true);
          await updateUser({
            id: data?.id,
            login: login,
            firtName: name?.split(' ')[0],
            lastName: name?.split(' ')?.slice(1).join(' '),
            password: password,
            phone: phone,
            email: email,
            birthday: birthday,
            address: address,
            deliveryArea: area,
            note: note
          });
          setOpen(false);
          formik.resetForm();
          onFormSubmit();
          notifySuccess('Thực hiện thành công');
        } catch (errMessage) {
          notifyWarning((errMessage as string) || 'Something went wrong');
        } finally {
          setLoading(false);
        }
        break;

      case 'copy':
        try {
          setLoading(true);
          await copyUser({
            login: login,
            firtName: name?.split(' ')[0],
            lastName: name?.split(' ')?.slice(1).join(' '),
            password: password,
            phone: phone,
            email: email,
            birthday: birthday,
            address: address,
            deliveryArea: area,
            note: note
          });
          setOpen(false);
          formik.resetForm();
          onFormSubmit();
          notifySuccess('Thực hiện thành công');
        } catch (errMessage) {
          notifyWarning((errMessage as string) || 'Something went wrong');
        } finally {
          setLoading(false);
        }
        break;
      default:
        break;
    }
  };

  const renderTitle = () => {
    switch (type) {
      case 'create':
        return 'Thêm người dùng';
      case 'edit':
        return 'Cập nhật người dùng';
      case 'copy':
        return 'Sao chép người dùng';
      default:
        break;
    }
  };

  return (
    <Box>
      {buttonProps ? (
        <Button {...buttonProps} onClick={handleOpen}></Button>
      ) : (
        <Button onClick={handleOpen} startIcon={<Add />} variant="contained">
          Thêm mới
        </Button>
      )}

      <Modal
        open={open}
        onClose={handleClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500
          }
        }}
      >
        <Fade in={open}>
          <MainCard title={renderTitle()} modal darkTitle content={false} sx={{ width: 'auto' }}>
            <form onSubmit={formik.handleSubmit}>
              <CardContent>
                <Grid container spacing={[2, 4]}>
                  {/*------------- left ----------------*/}
                  <Grid item xs={12} md={6}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} md={3}>
                        <Typography sx={{ fontWeight: 'bold', ...labelStyles }}>Tên người dùng</Typography>
                      </Grid>
                      <Grid item xs={12} md={9}>
                        <TextField
                          error={formik.touched.name && Boolean(formik.errors.name)}
                          helperText={formik.touched.name && formik.errors.name}
                          name="name"
                          value={formik.values.name}
                          placeholder="Nhập tên người dùng"
                          InputProps={{ sx: inputStyles }}
                          fullWidth
                          onChange={handleChange}
                        />
                      </Grid>

                      <Grid item xs={12} md={3}>
                        <Typography sx={{ fontWeight: 'bold', ...labelStyles }}>Tên đăng nhập</Typography>
                      </Grid>
                      <Grid item xs={12} md={9}>
                        <TextField
                          name="login"
                          placeholder="Nhập tên đăng nhập"
                          InputProps={{ sx: inputStyles }}
                          fullWidth
                          value={formik.values.login}
                          error={formik.touched.login && Boolean(formik.errors.login)}
                          helperText={formik.touched.login && (formik.errors.login as string)}
                          onChange={handleChange}
                        />
                      </Grid>

                      <Grid item xs={12} md={3}>
                        <Typography sx={{ fontWeight: 'bold', ...labelStyles }}>Mật khẩu</Typography>
                      </Grid>

                      <Grid item xs={12} md={9}>
                        <TextField
                          name="password"
                          sx={inputStyles}
                          fullWidth
                          value={formik.values.password}
                          placeholder="Nhập mật khẩu"
                          error={formik.touched.password && Boolean(formik.errors.password)}
                          helperText={formik.touched.password && formik.errors.password}
                          InputProps={{
                            sx: inputStyles,
                            type: !formik.values.showPassword ? 'password' : 'text',
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton onClick={() => formik.setFieldValue('showPassword', !formik.values.showPassword)}>
                                  {formik.values.showPassword ? <Eye /> : <EyeSlash />}
                                </IconButton>
                              </InputAdornment>
                            )
                          }}
                          onChange={handleChange}
                        />
                      </Grid>

                      <Grid item xs={12} md={3}>
                        <Typography sx={{ fontWeight: 'bold', ...labelStyles }}>Nhập lại mật khẩu</Typography>
                      </Grid>
                      <Grid item xs={12} md={9}>
                        <TextField
                          sx={inputStyles}
                          fullWidth
                          value={formik.values.confirmPassword}
                          name="confirmPassword"
                          placeholder="Nhập lại mật khẩu"
                          error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                          helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                          InputProps={{
                            sx: inputStyles,
                            type: !formik.values.showConfirmPassword ? 'password' : 'text',
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton onClick={() => formik.setFieldValue('showConfirmPassword', !formik.values.showConfirmPassword)}>
                                  {formik.values.showConfirmPassword ? <Eye /> : <EyeSlash />}
                                </IconButton>
                              </InputAdornment>
                            )
                          }}
                          onChange={handleChange}
                        />
                      </Grid>

                      {/* <Grid item xs={12} md={3}>
                        <Typography sx={{ fontWeight: 'bold', ...labelStyles }}>Vai trò</Typography>
                      </Grid>
                      <Grid item xs={12} md={9}>
                        <FormControl fullWidth error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}>
                          <Select displayEmpty sx={inputStyles}  name="role" onChange={handleChange}>
                            <MenuItem value={1}>One</MenuItem>
                            <MenuItem value={10}>Ten</MenuItem>
                            <MenuItem value={20}>Twenty</MenuItem>
                            <MenuItem value={30}>Thirty</MenuItem>
                          </Select>
                          {formik.touched.role && formik.errors.role && <FormHelperText>{formik.errors.role}</FormHelperText>}
                        </FormControl>
                      </Grid> */}

                      {/* <Grid item xs={12} md={3}>
                        <Typography sx={{ fontWeight: 'bold', ...labelStyles }}>Chi nhánh</Typography>
                      </Grid>
                      <Grid item xs={12} md={9}>
                        <FormControl fullWidth error={formik.touched.branch && Boolean(formik.errors.branch)}>
                          <Autocomplete
                            id="branch"
                            options={branches}
                            getOptionLabel={(option) => option.label || ''}
                            value={formik.values.branch}
                            onChange={(_, newValue) => formik.setFieldValue('branch', newValue?.value)}
                            filterSelectedOptions
                            renderInput={(params) => (
                              <TextField {...params} name="branch" placeholder="Chọn chi nhánh"  />
                            )}
                            renderOption={(props, option) => (
                              <MenuItem {...props} key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            )}
                          />
                          {formik.touched.branch && formik.errors.branch && <FormHelperText>{formik.errors.branch}</FormHelperText>}
                        </FormControl>
                      </Grid> */}

                      <Grid item xs={12} md={3}>
                        <Typography sx={{ fontWeight: 'bold', ...labelStyles }}>Điện thoại</Typography>
                      </Grid>
                      <Grid item xs={12} md={9} sx={{ display: 'flex' }} alignItems="center" gap={2}>
                        {/* <FormControl sx={{ minWidth: 80 }} error={formik.touched.country && Boolean(formik.errors.country)}>
                          <Select
                            defaultValue={countriesPhoneNumber[0].phone}
                            name="country"
                            autoWidth
                            placeholder="Age"
                            
                            sx={inputStyles}
                          >
                            {countriesPhoneNumber.map((country) => (
                              <MenuItem value={country.phone} key={country.code}>
                                {country.flag} {country.label}
                              </MenuItem>
                            ))}
                          </Select>
                          {formik.touched.country && formik.errors.country && <FormHelperText>{formik.errors.country}</FormHelperText>}
                        </FormControl> */}
                        <TextField
                          name="phone"
                          placeholder="0986 312 145"
                          InputProps={{ sx: inputStyles }}
                          fullWidth
                          value={formik.values.phone}
                          error={formik.touched.phone && Boolean(formik.errors.phone)}
                          helperText={formik.touched.phone && (formik.errors.phone as string)}
                          onChange={handleChange}
                        />
                      </Grid>
                    </Grid>
                  </Grid>

                  {/*------------- right ---------------*/}
                  <Grid item xs={12} md={6}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={3}>
                        <Typography sx={{ fontWeight: 'bold', ...labelStyles }}>Email</Typography>
                      </Grid>
                      <Grid item xs={12} md={9}>
                        <TextField
                          name="email"
                          placeholder="Nhập email"
                          InputProps={{ sx: inputStyles }}
                          fullWidth
                          value={formik.values.email}
                          error={formik.touched.email && Boolean(formik.errors.email)}
                          helperText={formik.touched.email && (formik.errors.email as string)}
                          onChange={handleChange}
                        />
                      </Grid>

                      <Grid item xs={12} md={3}>
                        <Typography sx={{ fontWeight: 'bold', ...labelStyles }}>Địa chỉ</Typography>
                      </Grid>
                      <Grid item xs={12} md={9}>
                        <TextField
                          name="address"
                          placeholder="Nhập địa chỉ"
                          InputProps={{ sx: inputStyles }}
                          fullWidth
                          value={formik.values.address}
                          error={formik.touched.address && Boolean(formik.errors.address)}
                          helperText={formik.touched.address && (formik.errors.address as string)}
                          onChange={handleChange}
                        />
                      </Grid>

                      <Grid item xs={12} md={3}>
                        <Typography sx={{ fontWeight: 'bold', ...labelStyles }}>Khu vực</Typography>
                      </Grid>
                      <Grid item xs={12} md={9}>
                        <FormControl fullWidth error={formik.touched.area && Boolean(formik.errors.area)}>
                          {/* <Autocomplete
                            id="area"
                            options={provinces?.map((province: ProvinceProps) => ({
                              label: province.name,
                              value: province.id
                            }))}
                            getOptionLabel={(option) => option.label}
                            value={branches.find((item) => item.value === formik.values.area) || null}
                            onChange={(_, newValue) => formik.setFieldValue('area', newValue?.value)}
                            filterSelectedOptions
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                value={formik.values.area}
                                InputProps={{ sx: inputStyles }}
                                name="area"
                                placeholder="Chọn Tỉnh/TP - Quận/Huyện"
                                
                              />
                            )}
                            renderOption={(props, option) => (
                              <MenuItem {...props} key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            )}
                          /> */}
                          <Select
                            name="area"
                            fullWidth
                            placeholder="Chọn khu vực"
                            sx={inputStyles}
                            value={formik.values.area}
                            onChange={(e) => {
                              formik.setFieldValue('area', e.target.value);
                            }}
                          >
                            {provinces?.length > 0 &&
                              provinces?.map((province: ProvinceProps) => (
                                <MenuItem value={province.id} key={province.code}>
                                  {province.name}
                                </MenuItem>
                              ))}
                          </Select>
                          {formik.touched.area && formik.errors.area && <FormHelperText>{formik.errors.area as string}</FormHelperText>}
                        </FormControl>
                      </Grid>

                      {/* <Grid item xs={12} md={3}>
                        <Typography sx={{ fontWeight: 'bold', ...labelStyles }}>Phường xã</Typography>
                      </Grid>
                      <Grid item xs={12} md={9}>
                        <FormControl fullWidth error={formik.touched.px && Boolean(formik.errors.px)}>
                          <Autocomplete
                            id="px"
                            options={branches}
                            getOptionLabel={(option) => option.label || ''}
                            value={formik.values.px}
                            onChange={(_, newValue) => formik.setFieldValue('px', newValue?.value)}
                            filterSelectedOptions
                            renderInput={(params) => <TextField {...params} name="px" placeholder="Chọn Phường/Xã"  />}
                            renderOption={(props, option) => (
                              <MenuItem {...props} key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            )}
                          />
                          {formik.touched.px && formik.errors.px && <FormHelperText>{formik.errors.px}</FormHelperText>}
                        </FormControl>
                      </Grid> */}

                      <Grid item xs={12} md={3}>
                        <Typography sx={{ fontWeight: 'bold', ...labelStyles }}>Ngày sinh</Typography>
                      </Grid>
                      <Grid item xs={12} md={9}>
                        <FormControl fullWidth error={formik.touched.birthday && Boolean(formik.errors.birthday)}>
                          <DatePickerCustom
                            name="birthday"
                            format="dd/MM/yyyy"
                            inputStyles={INPUT_BASER_STYLE}
                            value={formik.values.birthday}
                            onChange={(value) => formik.setFieldValue('birthday', value)}
                          />
                          {formik.touched.birthday && formik.errors.birthday && (
                            <FormHelperText>{`${formik.errors.birthday}`}</FormHelperText>
                          )}
                        </FormControl>
                      </Grid>

                      <Grid item xs={12} md={3}>
                        <Typography sx={{ fontWeight: 'bold', ...labelStyles }}>Ghi chú</Typography>
                      </Grid>
                      <Grid item xs={12} md={9}>
                        <TextField
                          name="note"
                          placeholder="Nhập ghi chú"
                          InputProps={{ sx: inputStyles }}
                          fullWidth
                          value={formik.values.note}
                          onChange={handleChange}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </CardContent>
              <Divider />
              <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ px: 2.5, py: 2 }}>
                <Button color="error" onClick={handleClose}>
                  Bỏ qua
                </Button>
                <LoadingButton variant="contained" type="submit" loading={loading}>
                  Lưu
                </LoadingButton>
              </Stack>
            </form>
          </MainCard>
        </Fade>
      </Modal>
    </Box>
  );
}
