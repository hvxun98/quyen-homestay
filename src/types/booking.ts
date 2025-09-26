export interface BookingProps {
  id: string;
  stt?: number;
  code: string; // OD_XXXX (virtual)
  name: string;
  roomId: string | any;
  customerName: string;
  customerPhone?: string;
  checkIn: string | Date;
  checkOut: string | Date;
  price: number;
  source?: string;
  paymentStatus?: 'full' | 'deposit' | 'unpaid';
  note?: string;
  houseId?: string;
}
