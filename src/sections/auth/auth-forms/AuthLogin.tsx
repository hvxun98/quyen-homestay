'use client';

import { signIn } from 'next-auth/react';
import Image from 'next/legacy/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import {
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Stack,
  Typography
} from '@mui/material';

import { Formik } from 'formik';
import * as Yup from 'yup';

import { Eye, EyeSlash } from 'iconsax-react';

import AnimateButton from 'components/@extended/AnimateButton';
import IconButton from 'components/@extended/IconButton';
import { APP_DEFAULT_PATH } from 'config';

interface AuthLoginProps {
  providers?: any;
}

const AuthLogin = ({ providers }: AuthLoginProps) => {
  const router = useRouter();
  const Google = '/assets/images/icons/google.svg';
  const [showPassword, setShowPassword] = useState(false);

  const redirectPath = '/dashboard/default';

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  return (
    <Formik
      initialValues={{ username: '', password: '', rememberMe: true, submit: null }}
      validationSchema={Yup.object().shape({
        username: Yup.string().required('Vui lòng nhập tên đăng nhập'),
        password: Yup.string().required('Vui lòng nhập mật khẩu')
      })}
      onSubmit={async (values, { setErrors, setSubmitting }) => {
        try {
          const res = await signIn('credentials', {
            redirect: false,
            email: values.username,
            password: values.password,
            rememberMe: values.rememberMe
          });

          if (res?.ok && !res.error) {
            router.push(redirectPath);
          } else {
            setErrors({ submit: res?.error || 'Đăng nhập thất bại, vui lòng thử lại.' });
          }
        } catch (err: any) {
          setErrors({ submit: err.message });
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ handleSubmit, handleChange, handleBlur, values, errors, touched, isSubmitting }) => (
        <form noValidate onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Stack spacing={1}>
                <InputLabel htmlFor="username-login">Tên đăng nhập</InputLabel>
                <OutlinedInput
                  id="username-login"
                  type="text"
                  name="username"
                  value={values.username}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  placeholder="Nhập tên đăng nhập"
                  fullWidth
                  error={Boolean(touched.username && errors.username)}
                />
                {touched.username && errors.username && <FormHelperText error>{errors.username}</FormHelperText>}
              </Stack>
            </Grid>

            <Grid item xs={12}>
              <Stack spacing={1}>
                <InputLabel htmlFor="password-login">Mật khẩu</InputLabel>
                <OutlinedInput
                  id="password-login"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={values.password}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  placeholder="Nhập mật khẩu"
                  fullWidth
                  error={Boolean(touched.password && errors.password)}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton onClick={handleClickShowPassword} edge="end" color="secondary">
                        {showPassword ? <Eye /> : <EyeSlash />}
                      </IconButton>
                    </InputAdornment>
                  }
                />
                {touched.password && errors.password && <FormHelperText error>{errors.password}</FormHelperText>}
              </Stack>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={<Checkbox name="rememberMe" checked={values.rememberMe} onChange={handleChange} color="primary" />}
                label="Ghi nhớ đăng nhập"
              />
            </Grid>

            <Grid item xs={12}>
              <Stack direction="row" justifyContent="flex-end">
                <Typography variant="body2" color="text.secondary" component={Link} href="/forgot-password">
                  Quên mật khẩu?
                </Typography>
              </Stack>
            </Grid>

            {errors.submit && (
              <Grid item xs={12}>
                <FormHelperText error>{errors.submit}</FormHelperText>
              </Grid>
            )}

            <Grid item xs={12}>
              <AnimateButton>
                <Button type="submit" variant="contained" color="primary" fullWidth disabled={isSubmitting}>
                  Đăng nhập
                </Button>
              </AnimateButton>
            </Grid>

            {providers && (
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }}>Hoặc đăng nhập bằng</Divider>
                {Object.values(providers).map((provider: any) => {
                  if (provider.id === 'credentials') return null;
                  return (
                    <Button
                      key={provider.id}
                      fullWidth
                      variant="outlined"
                      startIcon={provider.id === 'google' ? <Image src={Google} alt="Google" width={16} height={16} /> : null}
                      onClick={() => signIn(provider.id, { callbackUrl: APP_DEFAULT_PATH })}
                    >
                      {provider.name}
                    </Button>
                  );
                })}
              </Grid>
            )}
          </Grid>
        </form>
      )}
    </Formik>
  );
};

export default AuthLogin;
