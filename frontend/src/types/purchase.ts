export interface Purchase {
  id: number;
  purchase_date: string;
  supplier_name: string;  // Changed from seller_name to match the component
  seller_gst?: string;
  grain: {
    id: number;
    name: string;
  };
  grain_id: number;
  bill_number: string;  // Added this field
  number_of_bags: number;
  total_weight: number;
  rate_per_kg: number;
  total_amount: number;
  payment_status: 'paid' | 'pending' | 'partial';
  transportation_mode: string;
  vehicle_number: string;
  driver_name: string;
  lr_number?: string;
  po_number?: string;
  created_at: string;
  updated_at: string;
}

export interface PurchaseDetail {
    id: number;
    bill_number: string;
    grain_name: string;
    godown_name: string;
    supplier_name: string;
    number_of_bags: number;
    weight_per_bag: number;
    extra_weight: number;
    rate_per_kg: number;
    total_weight: number;
    total_amount: number;
    payment_status: string;
    paid_amount: number;
    purchase_date: string;
    grain_id: number;
    godown_id: number;
    created_at: string;
}

export interface PaymentHistory {
    id: number;
    amount: number;
    description: string;
    payment_date: string;
    created_at: string;
}