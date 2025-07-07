export interface RoleByBrandProps {
  branchId: number | string;
  branchName: string;
  login: string;
  privileges: any;
  roleId: number | string;
  roleName: string;
  listPermission: PermissionProps[];
  permissionStr: PermissionProps;
}

export interface PermissionProps {
  code: string;
  id: number | string;
  name: string;
  nameHierarchy: string;
  parentId: number | string;
}

export interface RoleSystemProps {
  id: number;
  name: string;
}

export interface PrivilegesProps {
  code: string;
  functions?: PrivilegesProps[];
  hasChildren: string;
  id: string;
  name: string;
  nameHierarchy: string;
  ops: PrivilegesProps[];
}

export interface PermissionAssignProps {
  listPermissionId: number[] | string[];
  userId: number;
  brandsId: number;
  rolesId: number;
}
