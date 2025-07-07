// ==============================|| TYPES - USER PROFILE  ||============================== //

export type UserProfile = {
  id?: string;
  avatar?: string;
  image?: string;
  name?: string;
  role?: string;
  about?: string;
  email?: string;
  work_email?: string;
  personal_email?: string;
  phone?: string;
  work_phone?: string;
  personal_phone?: string;
  birthdayText?: string;
  lastMessage?: string;
  status?: string;
  friends?: number;
  followers?: number;
  contact?: string;
  company?: string;
  location?: string;
  online_status?: string;
  unReadChatCount?: number;
  // groups?: Group[];
  time?: string;
  tier?: string;
  // Progress?: ProfileProgress;
};

export type UserCardProps = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  role: string;
  visits: number;
  progress: number;
  status: string;
  orderStatus: string;
  contact: number;
  country: string;
  address: string;
  fatherName: string;
  about: string;
  avatar: number;
  skills: string[];
  time: string;
};

export type UserPropsTable = {
  activated: boolean;
  authorities: string[];
  createdBy: string;
  email: string;
  firstName: string;
  id: number;
  imageUrl: string;
  langKey: string;
  lastModifiedBy: string;
  lastName: string;
  login: string;
};

export type UserAccessTimeProps = {
  id?: number | string;
  numberOrder: number;
  dayOfWeek: string;
  name: string;
  from: string;
  to: string;
  isActive: boolean;
  isChild?: boolean;
};
