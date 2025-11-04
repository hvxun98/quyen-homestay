'use client';

import { useState, MouseEvent, ReactNode } from 'react';

// material-ui
import Grid from '@mui/material/Grid';
import Menu from '@mui/material/Menu';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ListItemButton from '@mui/material/ListItemButton';
import Box from '@mui/material/Box';
import BedroomChildIcon from '@mui/icons-material/BedroomChild';

// project-imports
import MainCard from 'components/MainCard';
import Avatar from 'components/@extended/Avatar';
import IconButton from 'components/@extended/IconButton';
import MoreIcon from 'components/@extended/MoreIcon';

// types
import { ColorProps } from 'types/extended';
import { Broom } from 'iconsax-react';
import dayjs from 'dayjs';

interface Props {
  title: string;
  count?: string;
  percentage?: ReactNode;
  iconPrimary?: ReactNode;
  children?: any;
  color?: ColorProps;
  isDirty?: boolean;
  showMore?: boolean;
  data?: any;
  onAction?: (value: string) => void;
}

// ==============================|| CHART WIDGET - Room CARD  ||============================== //

export default function RoomCard({
  title,
  count,
  percentage,
  color,
  iconPrimary,
  children,
  showMore = true,
  isDirty = false,
  data,
  onAction = () => {}
}: Props) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const getColor = (color: ColorProps | undefined) => {
    switch (color) {
      case 'success':
        return 'linear-gradient(145deg, #56ab2f 0%, #a8e063 30%)'; // Gradient xanh lá
      case 'info':
        return 'linear-gradient(145deg, #00c6ff 0%, #79b3faff 30%)'; // Gradient xanh dương
      case 'error':
        return 'linear-gradient(145deg, #f7797d 0%, #f2a4b8 30%)'; // Gradient đỏ
      case 'secondary':
        return 'linear-gradient(145deg, #c2c2c2 0%, #e6e6e6 100%)'; // Gradient xám
      default:
        return '#ffffff'; // Mặc định nếu không có màu
    }
  };

  return (
    <MainCard
      sx={{
        background: getColor(color),
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
        borderRadius: '12px',
        padding: 2
      }}
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box>
              <Stack direction="row" alignItems="start" spacing={2}>
                <Avatar variant="rounded" color={color}>
                  {iconPrimary || <BedroomChildIcon />}
                </Avatar>
                <Box>
                  <Stack direction="row" alignItems="center">
                    <Typography variant="subtitle1" fontSize={24}>
                      {title}
                    </Typography>
                    {isDirty ? (
                      <Box sx={{ flex: 1, marginLeft: 1 }}>
                        <Broom size="16" />
                      </Box>
                    ) : (
                      ''
                    )}
                  </Stack>
                  {data?.booking ? (
                    <Box>
                      <Typography variant="subtitle1">{data?.booking?.customerName}</Typography>
                      <Typography>Checkin: {dayjs(data?.booking?.checkIn).format('DD/MM/YYYY - HH:mm:ss')}</Typography>
                      <Typography>Checkout: {dayjs(data?.booking?.checkOut).format('DD/MM/YYYY - HH:mm:ss')}</Typography>
                    </Box>
                  ) : (
                    ''
                  )}
                </Box>
              </Stack>
            </Box>

            {showMore && (
              <IconButton
                color="secondary"
                id="wallet-button"
                aria-controls={open ? 'wallet-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
              >
                <MoreIcon />
              </IconButton>
            )}
            <Menu
              id="wallet-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              MenuListProps={{
                'aria-labelledby': 'wallet-button',
                sx: { p: 1.25, minWidth: 150 }
              }}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right'
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right'
              }}
            >
              {isDirty ? (
                <ListItemButton
                  onClick={() => {
                    onAction('clean');
                    handleClose();
                  }}
                >
                  Làm sạch phòng
                </ListItemButton>
              ) : (
                <ListItemButton
                  onClick={() => {
                    onAction('dirty');
                    handleClose();
                  }}
                >
                  Phòng bẩn
                </ListItemButton>
              )}
            </Menu>
          </Stack>
        </Grid>
        <Grid item xs={12}>
          {/* <MainCard content={false} border={false}>
            <Box sx={{ p: 3, pb: 1.25 }}>
              <Grid container spacing={3}>
                <Grid item xs={7}>
                  {children}
                </Grid>
                <Grid item xs={5}>
                  <Stack spacing={1}>
                    <Typography variant="h5">{count}</Typography>
                    {percentage}
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          </MainCard> */}
        </Grid>
      </Grid>
    </MainCard>
  );
}
