// src/types/cashfree.ts
export interface CashfreeOrderResponse {
  payment_session_id: string;
  order_id: string;
  order_status: string;
}

export interface CashfreeOrderStatus {
  order_status: 'PAID' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'FAILED';
  order_id: string;
  payment_status?: string;
  order_amount: number;
}

export interface PayOptions {
  paymentMethod: any;
  paymentSessionId: string;
  returnUrl?: string;
  redirect?: 'if_required' | 'always' | 'never';
}

export interface CheckoutOptions {
  paymentSessionId: string;
  redirectTarget?: '_self' | '_blank' | '_modal';
  returnUrl?: string;
}

export interface ComponentOptions {
  values?: Record<string, any>;
  style?: { base?: Record<string, string> };
}

export interface PaymentComponent {
  mount: (container: HTMLElement | string) => void;
  on: (event: string, callback: (data: any) => void) => void;
}

export interface Cashfree {
  pay?: (options: PayOptions) => Promise<{
    error?: { message: string };
    paymentDetails?: { paymentMessage: string };
    redirect?: boolean;
  }>;
  checkout?: (options: CheckoutOptions) => void;
  create?: (type: string, options: ComponentOptions) => PaymentComponent;
  version?: string;
}

export interface CashfreeConstructor {
  (config: { mode: 'sandbox' | 'production' }): Cashfree;
  new (): Cashfree;
}

declare global {
  interface Window {
    Cashfree: CashfreeConstructor;
  }
}