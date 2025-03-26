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

export interface CashfreeInstance {
  checkout: (options: {
    paymentSessionId: string;
    redirectTarget: '_self' | '_blank';
    returnUrl: string;
  }) => Promise<void>;
}

export interface CashfreeConstructor {
  new (config: { mode: 'sandbox' | 'production' }): CashfreeInstance;
}

declare global {
  interface Window {
    Cashfree: CashfreeConstructor;
  }
}