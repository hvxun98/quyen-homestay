'use client';
// next

// material-ui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project-imports
import AuthWrapper from 'sections/auth/AuthWrapper';
import AuthLogin from 'sections/auth/auth-forms/AuthLogin';
// import { FormattedMessage } from 'react-intl';

// ================================|| LOGIN ||================================ //

export default function Login() {
  return (
    <AuthWrapper>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: { xs: -0.5, sm: 0.5 } }}>
            <Typography variant="h3">Đăng nhập</Typography>
            {/* <Typography component={Link} href={'/register'} variant="body1" sx={{ textDecoration: 'none' }} color="primary" passHref>
              <FormattedMessage id="dh-ac" defaultMessage="Bạn chưa có tài khoản ?" />
            </Typography> */}
          </Stack>
        </Grid>
        <Grid item xs={12}>
          <AuthLogin />
        </Grid>
      </Grid>
    </AuthWrapper>
  );
}
