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

interface Props {
  title: string;
  count?: string;
  percentage?: ReactNode;
  iconPrimary?: ReactNode;
  children?: any;
  color?: ColorProps;
  showMore?: boolean;
}

// ==============================|| CHART WIDGET - Room CARD  ||============================== //

export default function RoomCard({ title, count, percentage, color, iconPrimary, children, showMore = true }: Props) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <MainCard>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar variant="rounded" color={color}>
                {<BedroomChildIcon />}
              </Avatar>
              <Typography variant="subtitle1">{title}</Typography>
            </Stack>
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
              <ListItemButton onClick={handleClose}>Phòng bẩn</ListItemButton>
            </Menu>
          </Stack>
        </Grid>
        <Grid item xs={12}>
          <MainCard content={false} border={false} sx={{ bgcolor: 'background.default' }}>
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
          </MainCard>
        </Grid>
      </Grid>
    </MainCard>
  );
}
