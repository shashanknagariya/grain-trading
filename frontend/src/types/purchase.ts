export interface Purchase {
    id: number;
    bill_number: string;
    grain_name: string;
    supplier_name: string;
    total_amount: number;
    payment_status: 'pending' | 'partially_paid' | 'paid';
    paid_amount: number;
    purchase_date: string;
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