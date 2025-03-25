declare global {
  interface Window {
    Cashfree: {
      HandlePayment: new () => {
        init: (config: {
          sessionId: string;
          returnUrl: string;
        }) => Promise<void>;
        renderPaymentElements: (config: {
          container: string;
          style?: {
            backgroundColor?: string;
            color?: string;
            fontFamily?: string;
            fontSize?: string;
            errorColor?: string;
            theme?: 'light' | 'dark';
          };
        }) => Promise<void>;
      };
    };
  }
}

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
  payment_details?: {
    payment_id: string;
    payment_status: string;
    payment_amount: number;
    payment_currency: string;
    payment_message: string;
    payment_time: string;
  };
}

export {};