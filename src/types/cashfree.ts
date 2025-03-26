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
  paymentMethod: any; // The component created by cashfree.create
  paymentSessionId: string;
  returnUrl?: string;
  redirect?: 'if_required' | 'always' | 'never';
}

interface CheckoutOptions {
  paymentSessionId: string;
  redirectTarget?: '_self' | '_blank' | '_modal';
  returnUrl?: string;
}

interface ComponentOptions {
  values?: Record<string, any>;
  style?: {
    base?: Record<string, string>;
  };
}

interface PaymentComponent {
  mount: (container: HTMLElement | string) => void;
  on: (event: string, callback: (data: any) => void) => void;
}

interface Cashfree {
  pay?: (options: PayOptions) => Promise<{
    error?: { message: string };
    paymentDetails?: { paymentMessage: string };
    redirect?: boolean;
  }>;
  checkout?: (options: CheckoutOptions) => void;
  create?: (type: string, options: ComponentOptions) => PaymentComponent;
  version?: string;
}

interface CashfreeConstructor {
  (config: { mode: 'sandbox' | 'production' }): Cashfree;
  new (): Cashfree; // For backward compatibility
}

declare global {
  interface Window {
    Cashfree: CashfreeConstructor;
  }
}