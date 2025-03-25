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
interface DropinOptions {
  paymentSessionId: string;
  container: HTMLElement | null;
  components?: string[];
  onSuccess?: (data: any) => void;
  onFailure?: (error: any) => void;
}

interface Cashfree {
  initialiseDropin(options: DropinOptions): void;
}

interface CashfreeConstructor {
  new (): Cashfree;
}

declare global {
  interface Window {
    Cashfree: CashfreeConstructor;
  }
}