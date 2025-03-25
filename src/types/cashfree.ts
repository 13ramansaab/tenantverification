export interface CashfreeOrderResponse {
  payment_session_id: string;
  order_id: string;
  order_status: string;
}

export interface CashfreeOrderStatus {
  order_id: string;
  order_status: string;
  order_amount: number;
  order_currency: string;
  customer_details: {
    customer_id: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
  };
}
// types/cashfree.d.ts
interface DropOptions {
  paymentSessionId: string;
  components?: string[];
  onSuccess?: (data: any) => void;
  onFailure?: (error: any) => void;
}

interface Cashfree {
  drop(container: HTMLElement | null, options: DropOptions): void;
}

interface CashfreeConstructor {
  new (): Cashfree;
}

declare global {
  interface Window {
    Cashfree: CashfreeConstructor;
  }
}