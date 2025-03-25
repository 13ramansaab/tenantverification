declare module 'cashfree-pg' {
  interface CashfreeConfig {
    env: 'PRODUCTION' | 'TEST';
    apiVersion: string;
    appId: string;
    secretKey: string;
  }

  interface CustomerDetails {
    customerId: string;
    customerPhone: string;
    customerEmail: string;
  }

  interface OrderMeta {
    returnUrl: string;
    notifyUrl: string;
  }

  interface OrderRequest {
    orderId: string;
    orderAmount: number;
    orderCurrency: string;
    customerDetails: CustomerDetails;
    orderMeta: OrderMeta;
  }

  interface OrderResponse {
    orderId: string;
    orderStatus: string;
    paymentLink: string;
  }

  interface Orders {
    createOrder(request: OrderRequest): Promise<OrderResponse>;
    getOrder(orderId: string): Promise<OrderResponse>;
  }

  export class Cashfree {
    constructor(config: CashfreeConfig);
    orders: Orders;
  }
}