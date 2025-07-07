// project-import
import { Gender } from 'config';

// ==============================|| TYPES - CUSTOMER  ||============================== //

export interface CustomerProps {
  modal: boolean;
}

export interface CustomerList {
  firstName: string;
  lastName: string;
  id?: number;
  avatar: number;
  name: string;
  fatherName: string;
  email: string;
  age: number;
  gender: Gender;
  role: string;
  orders: number;
  progress: number;
  status: number;
  orderStatus: string;
  contact: string;
  country: string;
  location: string;
  about: string;
  skills: string[];
  time: string[];
  date: Date | string | number;
}

export interface CustomerInfoProps {
  departmentId: string;
  name: string;
  namePrint: string;
  nameEnglish: string;
  clientCode: string;
  taxCode: string;
  accountNumber: string;
  phoneNumber: string;
  faxNumber: string;
  email: string;
  address: string;
  addressInvoice: string;
  representative: string;
  jobTitle: string;
  unitRequest: boolean;
  inspector: boolean;
  id?: number;
}

export interface ContactInfoProps {
  departmentId: string;
  name: string;
  namePrint: string;
  nameEnglish: string;
  clientCode: string;
  taxCode: string;
  accountNumber: string;
  phoneNumber: string;
  faxNumber: string;
  email: string;
  address: string;
  addressInvoice: string;
  representative: string;
  jobTitle: string;
  unitRequest: boolean;
  inspector: boolean;
  id: number;
}

export interface ContractInfoProps {
  id: number;
  contractNo: string | number;
  contractValue: number;
  dateSign: string;
  dateLiquidation?: string;
  status?: string;
  name: string;
}

export interface LocationInfoProps {
  name: string;
  name_en: string;
  description: string;
  id: number;
}

export interface MonitoringLocation {
  id: number;
  clientLocationId: number;
  name: string;
  nameEn: string;
  order: number;
  description: string;
  latitude: string;
  longitude: string;
}

export interface MonitoringSchedule {
  clientLocationId: number;
  id: number;
  processDay: number;
  processMonth: number;
  processYear: number;
}
