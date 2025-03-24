export interface Sale {
  id: number;
  bill_number: string;
  grain_id: number;
  grain_name: string;
  buyer_name: string;
  customer_name: string;  
  buyer_gst?: string;
  number_of_bags: number;
  total_weight: number;
  rate_per_kg: number;
  total_amount: number;
  transportation_mode: string;
  vehicle_number: string;
  driver_name: string;
  lr_number?: string;
  po_number?: string;
  sale_date: string;
  created_at: string;
  payment_status: 'pending' | 'paid' | 'partial';
}