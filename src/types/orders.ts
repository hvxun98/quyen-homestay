export interface OrderProps {
  id: number;
  name: string;
  clientId: number;
  clientContactId: number;
  clientLocationId: number;
  clientContractId: number;
  monitoringDate: string;
  sampleReceiptDate: string;
  resultDeliveryDate: string;
  batchType: number | string;
  displayTimeMonitoring: string;
  unitRequestMonitoring: number;
  salesManager: string | number;
  monitoringSupervisor: string | number;
  resultApprovalOfficer: string | number;
  qaQcOfficer: string | number;
  description: string;
  originalTestReportLink: string;
  finalReportLink: string;
  samplingRecordLink: string;
  hideAllRequests: string;
  resultCertificateLink: string;
  vnResultCertificateNumber: string;
  enResultCertificateNumber: string;
  resultDeliveryMethod: number;
  status: number;
}
