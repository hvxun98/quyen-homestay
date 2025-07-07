import React, { useEffect, useState } from 'react';

// material-ui
import {
  Autocomplete,
  Box,
  Button,
  // Checkbox,
  CircularProgress,
  // FormControlLabel,
  Grid,
  List,
  ListItemButton,
  ListItemText,
  MenuItem,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { SimpleTreeView } from '@mui/x-tree-view';

// project-imports
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';
import TreeItemRole from './TreeItem';
import SimpleDialog from 'components/SimpleDialog';
// import { privileges } from '../../../mock.data';

import { getBrands, getPrivileges, getRolesByBrand, getRolesSystem, postCreateRole, postPermissionAssign } from 'services/users';
import { useAppDispatch, useAppSelector } from 'store/hook';
import { setStateBrands } from 'store/slices/app';
import { BrandProps } from 'types/brands';
import { PrivilegesProps, RoleByBrandProps, RoleSystemProps } from 'types/role';
import { center } from 'utils/commontStyle';
import { RootState } from 'store/store';
import { MenuItemProps } from 'types/menu';

// third-party
import { useFormik } from 'formik';
import { Add, ArrowDown2, ArrowRight2, CloseCircle, Save2 } from 'iconsax-react';
import { isEmpty, toNumber } from 'lodash';
import { notifySuccess, notifyWarning } from 'utils/notify';
import LoadingButton from 'components/@extended/LoadingButton';
import { extractFunctionIds, extractOpsIds, getFunctionIdByOpsId, getOpsByFunctionId } from './utils';
import { INPUT_BASER_STYLE } from 'constants/style';

const initialRole = {
  label: 'Chọn vai trò',
  value: 0
};

interface RoleManagementProps {
  data: any;
}

function RoleManagement({ data }: RoleManagementProps) {
  const userId = data?.id;
  const dispatch = useAppDispatch();
  const brands = useAppSelector((state: RootState) => state.app.brands);
  const [activeBrand, setActiveBrand] = useState(1);
  const [rolesByBrand, setRolesByBrand] = useState<RoleByBrandProps[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [roleSelected, setRoleSelected] = useState<MenuItemProps>(initialRole);
  const [roles, setRoles] = useState<RoleSystemProps[]>([]);
  const [privileges, setPrivileges] = useState<PrivilegesProps[]>([]);
  const [loadingSubmit, setLoadingSubmit] = useState<boolean>(false);
  const [reload, setReload] = useState<boolean>(false);
  const functions = extractFunctionIds(privileges);
  const ops = extractOpsIds(privileges);

  const currentUserPrivileges = rolesByBrand?.find((item: RoleByBrandProps) => toNumber(item.roleId) === roleSelected.value);

  const getRolesInitialValue = () => {
    const functionsObj: any = {};
    const opsObj: any = {};

    privileges?.forEach((category) => {
      if (category?.functions && category?.functions?.length > 0) {
        category?.functions?.forEach((func) => {
          functionsObj[func.id] = false;

          func.ops.forEach((op) => {
            opsObj[op.id] = false;
          });
        });
      } else {
        category?.ops?.forEach((func) => {
          functionsObj[func.id] = false;
          func.ops.forEach((op) => {
            opsObj[op.id] = false;
          });
        });
      }
    });

    return { ...functionsObj, ...opsObj };
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      roleName: '',
      roleNameCopy: '',
      view_general: false,
      view_other_imployee_trans: false,
      ...getRolesInitialValue()
    },

    onSubmit: (values) => {
      handleSubmitForm(values);
    }
  });

  useEffect(() => {
    if (currentUserPrivileges) {
      const permissions = flattenPermissions(currentUserPrivileges?.listPermission);

      for (let i = 0; i < permissions?.length; i++) {
        formik.setFieldValue(`${permissions[i]?.id}`, true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleSelected, rolesByBrand, currentUserPrivileges]);

  useEffect(() => {
    const getAllRoles = async () => {
      const res = await getRolesSystem();
      setRoles(res.data);
    };
    const getPrivilegeList = async () => {
      const res = await getPrivileges();
      setPrivileges(res.data);
    };
    getPrivilegeList();
    getAllRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reload]);

  useEffect(() => {
    const getAllBrand = async () => {
      if (brands.length === 0) {
        const res = await getBrands();

        dispatch(setStateBrands(res.data));
      }
    };
    getAllBrand();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeBrand) {
      const getRoles = async () => {
        try {
          setLoading(true);
          const res = await getRolesByBrand({
            userId: userId,
            brandId: activeBrand
          });
          setRolesByBrand(res.data);
        } finally {
          setLoading(false);
        }
      };
      getRoles();
    }
  }, [activeBrand, userId, roleSelected]);

  function flattenPermissions(data: any[]): any[] {
    const result: any[] = [];

    function recurse(items: any[]) {
      for (const item of items) {
        result.push(item);

        // Nếu có functions bên trong
        if (Array.isArray(item.functions) && item.functions.length > 0) {
          recurse(item.functions);
        }

        // Nếu có ops bên trong
        if (Array.isArray(item.ops) && item.ops.length > 0) {
          recurse(item.ops);
        }
      }
    }

    recurse(data);
    return result;
  }

  const handleMenuClick = (id: number) => {
    setActiveBrand(id);
    formik.resetForm();
  };

  const handleCheckPermission = (name: string, checked: boolean) => {
    formik.setFieldValue(name, checked);
    /* ---------------------------- 
    If checked/unchecked a function
    ------------------------------*/
    if (functions?.includes(name)) {
      const children = getOpsByFunctionId(privileges, name);

      if (children?.length) {
        for (let i = 0; i < children?.length; i++) {
          formik.setFieldValue(children[i], checked);
        }
      }
    }

    /* ---------------------------- 
    If checked/unchecked an op
    ------------------------------*/
    if (ops?.includes(name)) {
      const parent = getFunctionIdByOpsId(privileges, name);
      if (parent) {
        const brothers = getOpsByFunctionId(privileges, parent as string);

        if (brothers?.length === 1) {
          formik.setFieldValue(`${parent}`, checked);
        }
        if (brothers?.length > 1) {
          let brothersChecked = [];
          for (let i = 0; i < brothers.length; i++) {
            if (formik.values[brothers[i]] === true) {
              brothersChecked.push(brothers[i]);
            }
          }
          if (brothersChecked?.length === brothers?.length - 1) formik.setFieldValue(`${parent}`, checked);
        }
      }
    }
  };

  const handleSubmitForm = async (values: any) => {
    try {
      setLoadingSubmit(true);
      await postPermissionAssign({
        userId: userId,
        brandsId: activeBrand,
        rolesId: toNumber(roleSelected.value),
        listPermissionId: extractKeys(values)
      });
      setReload(!reload);
      notifySuccess('Thực hiện thành công');
    } catch (err: any) {
      console.log(err);

      // notifyWarning(err);
    } finally {
      setLoadingSubmit(false);
    }
  };

  function extractKeys(obj: { [key: string]: any }): string[] {
    return Object.keys(obj).filter((key) => {
      return obj[key] === true;
    });
  }

  const handleAddRoleAndPermissionAssign = async (next: any) => {
    const roleName = formik.values?.roleName;
    if (roleName) {
      try {
        setLoadingSubmit(true);
        await postCreateRole({
          name: roleName
        });
        notifySuccess('Thực hiện thành công');
        setReload(!reload);
        next && next();
      } catch (err: any) {
        console.log(err);

        notifyWarning('Some thing went wrong');
      } finally {
        setLoadingSubmit(false);
      }
    }
  };

  const getOps = (p: any) => {
    if (p?.functions.length > 0) {
      return p?.functions?.map((func: any) => (
        <TreeItemRole
          key={func?.id}
          label={func?.name}
          itemId={func?.id}
          values={formik.values}
          items={func?.ops?.map((op: any) => ({
            label: op?.name,
            itemId: op?.id
          }))}
          onChange={(name, checked) => handleCheckPermission(name, checked)}
        >
          {func?.functions?.length > 0 &&
            func?.functions.map((childFunc: any) => (
              <TreeItemRole
                key={childFunc?.id}
                label={childFunc?.name}
                itemId={childFunc?.id}
                values={formik.values}
                items={childFunc?.ops?.map((childOp: any) => ({
                  label: childOp?.name,
                  itemId: childOp?.id
                }))}
                onChange={(name, checked) => handleCheckPermission(name, checked)}
              />
            ))}
        </TreeItemRole>
      ));
    } else {
      return p?.ops?.map((func: any) => (
        <TreeItemRole
          key={func?.id}
          label={func?.name}
          itemId={func?.id}
          values={formik.values}
          items={func?.ops?.map((op: any) => ({
            label: op?.name,
            itemId: op?.id
          }))}
          onChange={(name, checked) => handleCheckPermission(name, checked)}
        />
      ));
    }
  };

  return (
    <MainCard sx={{ mt: 2 }}>
      <form onSubmit={formik.handleSubmit}>
        {/* <Box>
          <Typography style={{ fontWeight: 500 }}>Phân quyền hệ thống</Typography>
          <Stack sx={{ py: 1 }}>
            <FormControlLabel
              value="end"
              name="view_general"
              control={<Checkbox defaultChecked />}
              label="Xem thông tin chung của hàng hóa, giao dịch, đối tác"
              labelPlacement="end"
              sx={{ ml: 1 }}
              onChange={formik.handleChange}
            />
            <FormControlLabel
              value="end"
              name="view_other_imployee_trans"
              control={<Checkbox defaultChecked />}
              label="Xem giao dịch của nhân viên khác"
              labelPlacement="end"
              sx={{ ml: 1 }}
              onChange={formik.handleChange}
            />
          </Stack>
        </Box> */}
        <Box sx={{ pt: 2 }}>
          <Typography style={{ fontWeight: 500 }}>Phân quyền chi nhánh</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <SimpleBar
                sx={{
                  height: { xs: 'calc(100vh - 70px)', md: 'calc(100% - 70px)' },
                  '& .simplebar-content': {
                    display: 'flex',
                    flexDirection: 'column'
                  }
                }}
              >
                <Box sx={{ pt: 1.5 }}>
                  <SimpleBar
                    sx={{
                      height: { xs: 'calc(100vh - 70px)', md: 'calc(100% - 70px)' },
                      '& .simplebar-content': {
                        display: 'flex',
                        flexDirection: 'column'
                      }
                    }}
                  >
                    <MainCard>
                      <List
                        sx={{
                          width: '100%',
                          maxWidth: 360,
                          minHeight: 300,
                          height: '100%'
                        }}
                        component="nav"
                        aria-labelledby="nested-list-subheader"
                      >
                        {brands?.map((brand: BrandProps) => (
                          <ListItemButton key={brand?.id} selected={activeBrand === brand?.id} onClick={() => handleMenuClick(brand?.id)}>
                            <ListItemText primary={brand?.brandName} />
                          </ListItemButton>
                        ))}
                      </List>
                    </MainCard>
                  </SimpleBar>
                </Box>
              </SimpleBar>
            </Grid>
            <Grid item xs={12} md={9} sx={{ mt: '12px' }}>
              <MainCard sx={{ minHeight: 700 }}>
                <Stack flexDirection="row" gap={2} alignItems={'center'}>
                  <Typography>Vai trò</Typography>{' '}
                  <Autocomplete
                    sx={{ width: 400 }}
                    disablePortal
                    id="basic-autocomplete"
                    defaultValue={initialRole}
                    options={roles?.map((role) => ({
                      label: role.name,
                      value: role.id
                    }))}
                    value={roleSelected}
                    onChange={(_, item) => {
                      if (isEmpty(item)) setRoleSelected(initialRole);
                      else {
                        setRoleSelected({
                          label: item?.label as string,
                          value: item?.value as number | string
                        });
                        formik.resetForm();
                      }
                    }}
                    renderInput={(params) => <TextField {...params} placeholder="Chọn vai trò" />}
                    renderOption={(props, option) => (
                      <MenuItem {...props} key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    )}
                  />
                  <SimpleDialog
                    title="Thêm vai trò"
                    content={
                      <Stack direction={'row'} alignItems={'center'} gap={2}>
                        <Typography whiteSpace={'nowrap'}>Vai trò</Typography>{' '}
                        <TextField
                          name="roleName"
                          onChange={formik.handleChange}
                          sx={{ minWidth: 250, ...INPUT_BASER_STYLE }}
                          placeholder="Nhập tên vai trò mới"
                        />
                      </Stack>
                    }
                    buttonProps={{
                      children: <Add />
                    }}
                    onAccept={handleAddRoleAndPermissionAssign}
                  ></SimpleDialog>
                </Stack>

                {/* ----------- list ------------- */}
                {loading ? (
                  <Box sx={{ ...center, height: 300 }}>
                    <CircularProgress />
                  </Box>
                ) : roleSelected.value ? (
                  <Grid container spacing={2} sx={{ mt: 2 }}>
                    {privileges?.length > 0 ? (
                      privileges.map((item: any, i) => (
                        <Grid item xs={12} sm={6} md={4} key={i}>
                          <Typography fontWeight={600}>{item?.name}</Typography>
                          <SimpleTreeView
                            aria-label={item?.name}
                            slots={{ collapseIcon: ArrowDown2, expandIcon: ArrowRight2 }}
                            title={item?.name}
                          >
                            {getOps(item)}
                          </SimpleTreeView>
                        </Grid>
                      ))
                    ) : (
                      <Box sx={{ ...center, width: '100%' }}>Không có danh sách quyền</Box>
                    )}
                  </Grid>
                ) : (
                  <Box sx={center} mt={5}>
                    Vui lòng chọn vai trò
                  </Box>
                )}
              </MainCard>
            </Grid>
          </Grid>
        </Box>
        <Stack flexDirection="row" gap={2} sx={{ pt: 2 }} justifyContent="flex-end">
          <LoadingButton loading={loadingSubmit} type="submit" variant="contained" color="success" startIcon={<Save2 />}>
            Lưu
          </LoadingButton>
          <Button variant="contained" color="secondary" startIcon={<CloseCircle />}>
            Bỏ qua
          </Button>
        </Stack>
      </form>
    </MainCard>
  );
}

export default RoleManagement;
