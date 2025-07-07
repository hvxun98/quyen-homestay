'use client';
import { Box, Button, Typography, Paper } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ConfirmEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5'
      }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: 4,
          borderRadius: 2,
          maxWidth: 600,
          textAlign: 'center',
          backgroundColor: '#fff'
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
          XÁC NHẬN EMAIL CỦA BẠN
        </Typography>
        <Typography sx={{ mb: 2 }}>
          Cảm ơn bạn đã đăng ký tài khoản tại <strong>Sieulab</strong>!
        </Typography>
        <Typography sx={{ fontWeight: 'bold', color: 'primary.main', mb: 2 }}>
          Chúng tôi đã gửi một liên kết kích hoạt tới email:
        </Typography>
        <Typography sx={{ fontWeight: 'bold', fontSize: '18px', mb: 2 }}>{email || '[Không có email]'}</Typography>
        <Typography sx={{ mb: 2 }}>
          Vui lòng kiểm tra hộp thư đến (hoặc mục Spam) và nhấp vào liên kết để hoàn tất việc kích hoạt.
        </Typography>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '16px'
          }}
        >
          <Button variant="contained" color="primary" onClick={() => alert('Gửi lại email kích hoạt')}>
            Gửi lại email kích hoạt
          </Button>

          <Button variant="outlined" color="secondary" onClick={() => router.push('/')}>
            Quay lại trang chủ
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
