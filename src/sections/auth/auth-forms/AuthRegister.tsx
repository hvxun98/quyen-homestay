'use client';

import {
  Button,
  FormControl,
  FormHelperText,
  Grid,
  InputAdornment,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  Typography
} from '@mui/material';
import AnimateButton from 'components/@extended/AnimateButton';
import IconButtonExtended from 'components/@extended/IconButton';
import LabelWithAsterisk from 'components/LabelWithAsterisk';
import { Formik, FormikHelpers } from 'formik';
import { Eye, EyeSlash } from 'iconsax-react';
import { useRouter } from 'next/navigation';
import { SyntheticEvent, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import Turnstile from 'react-turnstile';
import { getCity, registerAccount } from 'services/register';
import * as Yup from 'yup';

interface FormValues {
  email: string;
  fullName: string;
  companySlug: string;
  password: string;
  confirmPassword: string;
  cityId: string;
  companyName: string;
  captchaResponse: string;
}
interface CityType {
  code: string;
  englishName: string;
  id: number;
  name: string;
}

export default function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [cities, setCities] = useState<CityType[]>([]);

  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleMouseDownPassword = (event: SyntheticEvent) => {
    event.preventDefault();
  };

  const initialValues: FormValues = {
    email: '',
    fullName: '',
    companySlug: '',
    password: '',
    confirmPassword: '',
    cityId: '',
    companyName: '',
    captchaResponse: ''
  };

  const validationSchema = Yup.object().shape({
    email: Yup.string().email('Email không hợp lệ').required('Vui lòng nhập email'),

    fullName: Yup.string().required('Vui lòng nhập họ tên'),

    companyName: Yup.string().required('Vui lòng nhập tên công ty'),

    password: Yup.string().min(8, 'Mật khẩu tối thiểu 8 ký tự').required('Vui lòng nhập mật khẩu'),

    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], 'Mật khẩu xác nhận không khớp')
      .required('Vui lòng xác nhận mật khẩu'),

    cityId: Yup.string().required('Vui lòng chọn thành phố'),

    companySlug: Yup.string().required('Vui lòng nhập tài khoản'),

    captchaResponse: Yup.string().required('Vui lòng xác nhận captcha')
  });

  const handleSubmit = async (values: FormValues, actions: FormikHelpers<FormValues>) => {
    try {
      console.log('values', values);

      await registerAccount({ ...values });
      router.push(`/register/confirm-email?email=${encodeURIComponent(values.email)}`);
    } catch (error: any) {
      console.error('Lỗi khi đăng ký:', error);
      actions.setErrors({
        captchaResponse: error?.message || 'Đăng ký thất bại!'
      });
      actions.setSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchCityList = async () => {
      const res = await getCity();
      setCities(res);
    };
    fetchCityList();
  }, []);

  return (
    <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
      {({ values, errors, touched, handleChange, handleBlur, handleSubmit, setFieldValue, isSubmitting }) => (
        <form noValidate onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Stack spacing={1}>
                <LabelWithAsterisk label="Email" htmlFor="email" required />
                <OutlinedInput
                  id="email"
                  name="email"
                  type="email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Nhập email của bạn"
                  fullWidth
                  error={Boolean(touched.email && errors.email)}
                />
              </Stack>
              {touched.email && errors.email && <FormHelperText error>{errors.email}</FormHelperText>}
            </Grid>

            <Grid item xs={12}>
              <Stack spacing={1}>
                <LabelWithAsterisk label="Họ tên" htmlFor="fullName" required />
                <OutlinedInput
                  id="fullName"
                  name="fullName"
                  value={values.fullName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Nhập họ tên của bạn"
                  fullWidth
                  error={Boolean(touched.fullName && errors.fullName)}
                />
              </Stack>
              {touched.fullName && errors.fullName && <FormHelperText error>{errors.fullName}</FormHelperText>}
            </Grid>

            <Grid item xs={12}>
              <Stack spacing={1}>
                <LabelWithAsterisk label="Tên công ty" htmlFor="companyName" required />

                <OutlinedInput
                  id="companyName"
                  name="companyName"
                  value={values.companyName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Nhập tên công ty"
                  fullWidth
                  error={Boolean(touched.companyName && errors.companyName)}
                />
              </Stack>
              {touched.companyName && errors.companyName && <FormHelperText error>{errors.companyName}</FormHelperText>}
            </Grid>

            <Grid item xs={12}>
              <Stack spacing={1}>
                <LabelWithAsterisk label="Tài khoản" htmlFor="companySlug" required />

                <OutlinedInput
                  id="companySlug"
                  name="companySlug"
                  value={values.companySlug}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Nhập tài khoản"
                  fullWidth
                  error={Boolean(touched.companySlug && errors.companySlug)}
                />
              </Stack>
              {touched.companySlug && errors.companySlug && <FormHelperText error>{errors.companySlug}</FormHelperText>}
            </Grid>

            <Grid item xs={12}>
              <Stack spacing={1}>
                <LabelWithAsterisk label="Mật khẩu" htmlFor="password" required />

                <OutlinedInput
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Nhập mật khẩu"
                  fullWidth
                  error={Boolean(touched.password && errors.password)}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButtonExtended
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                        color="secondary"
                      >
                        {showPassword ? <Eye /> : <EyeSlash />}
                      </IconButtonExtended>
                    </InputAdornment>
                  }
                />
              </Stack>
              {touched.password && errors.password && <FormHelperText error>{errors.password}</FormHelperText>}
            </Grid>

            <Grid item xs={12}>
              <Stack spacing={1}>
                <LabelWithAsterisk label="Mật khẩu xác nhận" htmlFor="confirmPassword" required />

                <OutlinedInput
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={values.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Nhập lại mật khẩu"
                  fullWidth
                  error={Boolean(touched.confirmPassword && errors.confirmPassword)}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButtonExtended
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                        color="secondary"
                      >
                        {showPassword ? <Eye /> : <EyeSlash />}
                      </IconButtonExtended>
                    </InputAdornment>
                  }
                />
              </Stack>
              {touched.confirmPassword && errors.confirmPassword && <FormHelperText error>{errors.confirmPassword}</FormHelperText>}
            </Grid>

            <Grid item xs={12}>
              <Stack spacing={1}>
                <LabelWithAsterisk label="Thành phố" htmlFor="cityId" required />

                <FormControl fullWidth>
                  <Select
                    id="cityId"
                    name="cityId"
                    value={values.cityId}
                    onChange={handleChange}
                    displayEmpty
                    error={Boolean(touched.cityId && errors.cityId)}
                  >
                    <MenuItem value="">
                      <em>Chọn thành phố</em>
                    </MenuItem>
                    {cities.map((city) => (
                      <MenuItem key={city.id} value={city.id}>
                        {city.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
              {touched.cityId && errors.cityId && <FormHelperText error>{errors.cityId}</FormHelperText>}
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Vui lòng hoàn thành captcha bên dưới
              </Typography>
              <Turnstile
                sitekey="0x4AAAAAAA5p779klVt5wvoB"
                onVerify={(token) => {
                  setFieldValue('captchaResponse', token);
                }}
                onExpire={() => {
                  setFieldValue('captchaResponse', '');
                }}
                onError={() => {
                  setFieldValue('captchaResponse', '');
                }}
                appearance="always"
              />
              {/* {touched.captchaResponse && errors.captchaResponse && (
                <FormHelperText error>{errors.captchaResponse}</FormHelperText>
              )} */}
            </Grid>

            <Grid item xs={12}>
              <Stack direction="row" justifyContent="flex-end" spacing={2}>
                <AnimateButton>
                  <Button disableElevation disabled={isSubmitting} type="submit" variant="contained" color="primary">
                    <FormattedMessage id={'register'} />
                  </Button>
                </AnimateButton>
              </Stack>
            </Grid>
          </Grid>
        </form>
      )}
    </Formik>
  );
}
