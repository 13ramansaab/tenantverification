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
interface CheckoutOptions {
  paymentSessionId: string;
  redirectTarget?: '_self' | '_blank' | '_modal';
  returnUrl?: string;
}

interface Cashfree {
  checkout(options: CheckoutOptions): void;
}

interface CashfreeConstructor {
  new (): Cashfree;
}

declare global {
  interface Window {
    Cashfree: CashfreeConstructor;
  }
}