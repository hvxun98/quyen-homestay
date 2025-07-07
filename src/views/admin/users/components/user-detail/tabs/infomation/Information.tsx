'use client';
import React, { useState } from 'react';

// material-ui
import { Theme } from '@mui/material/styles';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useMediaQuery } from '@mui/system';
import { DialogContentText } from '@mui/material';

// third-party
import { PatternFormat } from 'react-number-format';

// project-imports
import MainCard from 'components/MainCard';
import Avatar from 'components/@extended/Avatar';
import SimpleDialog from 'components/SimpleDialog';
import UserActionModal from '../../../UserActionModal';

// assets
import { Call, Location, Sms, Edit, Copy, Lock, Trash } from 'iconsax-react';
import { notifySuccess, notifyWarning } from 'utils/notify';
import { deleteUser, postBlockUser } from 'services/users';

const avatarImage = '/assets/images/users';

interface InformationProps {
  data?: any;
}

function Information({ data }: InformationProps) {
  const matchDownMD = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const [loadingSubmit, setLoadingSubmit] = useState<boolean>(false);

  const handleDeleteUser = async (next: any) => {
    if (!data?.id) {
      notifyWarning('Không tìm thấy người dùng');
      return;
    }
    try {
      setLoadingSubmit(true);
      await deleteUser(data.id);
      notifySuccess('Thực hiện thành công');
      next();
    } catch (err) {
      notifyWarning(`${err}`);
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleBlockUser = async (next: any) => {
    if (!data?.id) {
      notifyWarning('Không tìm thấy người dùng');
      return;
    }
    try {
      setLoadingSubmit(true);
      await postBlockUser(data.id);
      notifySuccess('Thực hiện thành công');
      next();
    } catch (err) {
      notifyWarning(`${err}`);
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <Grid container spacing={2.5} sx={{ p: 2 }}>
      <Grid item xs={12} sm={5} md={4} xl={3.5}>
        <MainCard>
          <Chip
            color="success"
            label={'Đang hoạt động'}
            size="small"
            sx={{
              position: 'absolute',
              right: -1,
              top: -1,
              borderRadius: '0 4px 0 4px'
            }}
          />
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Stack spacing={2.5} alignItems="center">
                <Avatar alt="Avatar 1" size="xl" src={`${avatarImage}/avatar-${data.avatar}.png`} />
                <Stack spacing={0.5} alignItems="center">
                  <Typography variant="h5">
                    {data.firstName} {data.lastName}
                  </Typography>
                  <Typography color="secondary">{data.role}</Typography>
                </Stack>
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <Divider />
            </Grid>
            <Grid item xs={12}>
              <Stack direction="row" justifyContent="space-around" alignItems="center">
                <Stack spacing={0.5} alignItems="center">
                  <Typography variant="h5">{data.age || '-'}</Typography>
                  <Typography color="secondary">Age</Typography>
                </Stack>
                <Divider orientation="vertical" flexItem />
                <Stack spacing={0.5} alignItems="center">
                  <Typography variant="h5">{data.progress || '0'}%</Typography>
                  <Typography color="secondary">Progress</Typography>
                </Stack>
                <Divider orientation="vertical" flexItem />
                <Stack spacing={0.5} alignItems="center">
                  <Typography variant="h5">{data.visits || '-'}</Typography>
                  <Typography color="secondary">Visits</Typography>
                </Stack>
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <Divider />
            </Grid>
            <Grid item xs={12}>
              <List component="nav" aria-label="main mailbox folders" sx={{ py: 0, '& .MuiListItem-root': { p: 0 } }}>
                <ListItem>
                  <ListItemIcon>
                    <Sms size="15" />
                  </ListItemIcon>
                  <ListItemText primary={<Typography color="secondary">Email</Typography>} />
                  <ListItemSecondaryAction>
                    <Typography align="right">{data.email || '-'}</Typography>
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Call size="15" />
                  </ListItemIcon>
                  <ListItemText primary={<Typography color="secondary">Phone</Typography>} />
                  <ListItemSecondaryAction>
                    <Typography align="right">
                      <PatternFormat displayType="text" format="+1 (###) ###-####" mask="_" defaultValue={data.phone} />
                    </Typography>
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Location size="15" />
                  </ListItemIcon>
                  <ListItemText primary={<Typography color="secondary">Location</Typography>} />
                  <ListItemSecondaryAction>
                    <Typography align="right">{data.country || '-'}</Typography>
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </MainCard>
      </Grid>
      <Grid item xs={12} sm={7} md={8} xl={8.5}>
        <Stack spacing={2.5}>
          <MainCard title="Thông tin chi tiết">
            <List sx={{ py: 0 }}>
              <ListItem divider={!matchDownMD}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Stack spacing={0.5}>
                      <Typography color="secondary">Tên đăng nhập</Typography>
                      <Typography>
                        {data.firstName} {data.lastName}
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Stack spacing={0.5}>
                      <Typography color="secondary">Địa chỉ</Typography>
                      <Typography>{data.address || '-'}</Typography>
                    </Stack>
                  </Grid>
                </Grid>
              </ListItem>
              <ListItem divider={!matchDownMD}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Stack spacing={0.5}>
                      <Typography color="secondary">Tên người dùng</Typography>
                      <Typography>{data.country || '-'}</Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Stack spacing={0.5}>
                      <Typography color="secondary">Khu vực giao hàng</Typography>
                      <Typography>
                        <PatternFormat displayType="text" format="### ###" mask="_" defaultValue={data.contact || '-'} />
                      </Typography>
                    </Stack>
                  </Grid>
                </Grid>
              </ListItem>
              <ListItem divider={!matchDownMD}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Stack spacing={0.5}>
                      <Typography color="secondary">Điện thoại</Typography>
                      <Typography>{data.contact || '-'}</Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Stack spacing={0.5}>
                      <Typography color="secondary">Phường xã</Typography>
                      <Typography>{data.address || '-'}</Typography>
                    </Stack>
                  </Grid>
                </Grid>
              </ListItem>
              <ListItem>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Stack spacing={0.5}>
                      <Typography color="secondary">Ngày sinh</Typography>
                      <Typography>{data?.birthday || '-'}</Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Stack spacing={0.5}>
                      <Typography color="secondary">Email</Typography>
                      <Typography>{data.email || '-'}</Typography>
                    </Stack>
                  </Grid>
                </Grid>
              </ListItem>
            </List>
          </MainCard>
          <MainCard>
            <Stack spacing={0.5} alignItems="center" gap={4} flexDirection="row">
              <UserActionModal data={data} type="edit" buttonProps={{ variant: 'contained', startIcon: <Edit />, children: 'Cập nhật' }} />

              <UserActionModal
                type="copy"
                data={data}
                buttonProps={{ variant: 'contained', startIcon: <Copy />, children: 'Sao chép', color: 'info' }}
              />

              <SimpleDialog
                title="Xác nhận ngừng hoạt động"
                content={<DialogContentText>Bạn có chắc muốn ngừng hoạt động người dùng này ?</DialogContentText>}
                buttonProps={{ startIcon: <Lock />, variant: 'contained', color: 'error', children: 'Ngừng hoạt động' }}
                onAccept={handleBlockUser}
                loadingSubmit={loadingSubmit}
              />

              <SimpleDialog
                title="Xác nhận xóa người dùng"
                content={<DialogContentText>Bạn có chắc muốn xóa người dùng này ?</DialogContentText>}
                buttonProps={{ startIcon: <Trash />, variant: 'contained', color: 'error', children: 'Xóa người dùng' }}
                onAccept={handleDeleteUser}
                loadingSubmit={loadingSubmit}
              />
            </Stack>
          </MainCard>
        </Stack>
      </Grid>
    </Grid>
  );
}

export default Information;
