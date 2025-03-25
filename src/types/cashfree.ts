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
interface PayOptions {
  paymentSessionId: string;
  components?: string[];
  container?: HTMLElement | null;
  onSuccess?: (data: any) => void;
  onFailure?: (error: any) => void;
}

interface CheckoutOptions {
  paymentSessionId: string;
  redirectTarget?: '_self' | '_blank' | '_modal';
  returnUrl?: string;
}

interface Cashfree {
  pay?: (options: PayOptions) => void;
  checkout?: (options: CheckoutOptions) => void;
  version?: string; // Added from runtime logs
  create?: (options: any) => any; // Optional, from logs
  flowWisePay?: (options: any) => any; // Optional, from logs
  returnElement?: (options: any) => any; // Optional, from logs
  destroyElement?: (options: any) => any; // Optional, from logs
  getComponents?: () => any; // Optional, from logs
  updateRootOptions?: (options: any) => any; // Optional, from logs
  getRootOptions?: () => any; // Optional, from logs
  subscriptionsCheckout?: (options: any) => any; // Optional, from logs
}

interface CashfreeConstructor {
  new (): Cashfree;
}

declare global {
  interface Window {
    Cashfree: CashfreeConstructor;
  }
}