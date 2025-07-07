'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Typography, CircularProgress, Box } from '@mui/material';
import { verifyAccount } from 'services/register';

export default function VerifyTokenPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (!token) return;

    const verify = async () => {
      try {
        await verifyAccount(token);
        setStatus('success');
      } catch {
        setStatus('error');
      }
    };

    verify();
  }, [token]);

  if (status === 'loading') {
    return (
      <div style={{ textAlign: 'center', marginTop: 40 }}>
        <Typography variant="h5">Đang xác thực tài khoản...</Typography>
        <CircularProgress sx={{ mt: 2 }} />
      </div>
    );
  }

  if (status === 'success') {
    return (
      <Box sx={{ textAlign: 'center', marginTop: 40 }}>
        <Typography variant="h4">Xác thực thành công!</Typography>
        <Typography variant="body1">Tài khoản của bạn đã được kích hoạt. Hãy đăng nhập để sử dụng.</Typography>
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => router.push('/login')}>
          Đăng nhập
        </Button>
      </Box>
    );
  }

  return (
    <Box style={{ textAlign: 'center', marginTop: 40 }}>
      <Typography variant="h4" color="error">
        Xác thực thất bại
      </Typography>
      <Typography variant="body1">Token không hợp lệ hoặc đã hết hạn. Vui lòng thử lại hoặc liên hệ hỗ trợ.</Typography>
      <Button variant="contained" sx={{ mt: 2 }} onClick={() => router.push('/')}>
        Về trang chủ
      </Button>
    </Box>
  );
}
