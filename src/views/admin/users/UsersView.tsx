'use client';
import React, { useEffect, useState } from 'react';

// material-ui
import { Autocomplete, Box, Button, FormControlLabel, MenuItem, Radio, RadioGroup, TextField } from '@mui/material';
import Grid from '@mui/material/Grid';

// third-party
import { useFormik } from 'formik';

// project-imports
import UserTable, { UserTableSearch } from './components/UserTable';
import MainCard from 'components/MainCard';
import { getRolesSystem } from 'services/users';
import { RoleSystemProps } from 'types/role';
import { INPUT_BASER_STYLE } from 'constants/style';

function UsersView() {
  const [searchValues, setSearchValues] = useState<UserTableSearch>();
  const [roles, setRoles] = useState<RoleSystemProps[]>([]);

  useEffect(() => {
    const getAllRoles = async () => {
      const res = await getRolesSystem();
      setRoles(res.data);
    };
    getAllRoles();
  }, []);

  const formik = useFormik({
    // enableReinitialize: true,
    initialValues: {
      username: '',
      phoneNumber: '',
      email: '',
      role: undefined,
      status: 0
    },

    onSubmit: (values) => {
      console.log(values);
      setSearchValues(values);
    }
  });

  return (
    <Box>
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={[2, 2]} sx={{ mt: 2, mb: 4, pt: 2 }} xs={12} md={8}>
          <Grid item xs={12} md={4}>
            <TextField
              name="username"
              onChange={formik.handleChange}
              fullWidth
              placeholder="Tên đăng nhập, người dùng"
              sx={INPUT_BASER_STYLE}
              size="small"
              type="search"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              name="phoneNumber"
              onChange={formik.handleChange}
              fullWidth
              id="outlined-basic"
              placeholder="Số điện thoại"
              sx={INPUT_BASER_STYLE}
              size="small"
              type="search"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              name="email"
              onChange={formik.handleChange}
              fullWidth
              id="outlined-basic"
              placeholder="Email"
              sx={INPUT_BASER_STYLE}
              size="small"
              type="search"
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Button sx={{ height: 40 }} variant="contained" type="submit">
              Tìm kiếm
            </Button>
          </Grid>
        </Grid>
      </form>
      <Grid container spacing={[2, 2]}>
        <Grid item component="div" xs={12} md={2}>
          <MainCard title="Vai trò">
            <Autocomplete
              multiple
              id="role"
              options={roles?.map((role: RoleSystemProps) => ({
                label: role?.name,
                value: role?.id
              }))}
              getOptionLabel={(option) => option.label}
              value={formik.values.role}
              onChange={(_, newValue) =>
                formik.setFieldValue(
                  'role',
                  newValue.map((role) => role.value)
                )
              }
              filterSelectedOptions
              renderInput={(params) => <TextField {...params} name="roles" placeholder="Vai trò" />}
              renderOption={(props, option) => (
                <MenuItem {...props} key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              )}
            />
          </MainCard>

          <MainCard title="Trạng thái" style={{ marginTop: 16 }}>
            <RadioGroup aria-label="size" defaultValue={0} name="status" onChange={formik.handleChange}>
              <FormControlLabel value={0} control={<Radio />} label="Tất cả" />
              <FormControlLabel value={1} control={<Radio />} label="Đang hoạt động" />
              <FormControlLabel value={2} control={<Radio />} label="Ngừng hoạt động" />
            </RadioGroup>
          </MainCard>
        </Grid>

        <Grid item component="div" xs={12} md={10}>
          <UserTable search={searchValues} />
        </Grid>
      </Grid>
    </Box>
  );
}

export default UsersView;
