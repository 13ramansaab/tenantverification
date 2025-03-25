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

declare global {
  interface Window {
    Cashfree: {
      create: () => {
        init: (config: {
          paymentSessionId: string;
          returnUrl?: string;
        }) => Promise<void>;
      };
    };
  }
}