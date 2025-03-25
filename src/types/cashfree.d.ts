// src/types/cashfree.d.ts
interface CashfreeInstance {
  checkout: (options: {
    paymentSessionId: string;
    returnUrl: string;
  }) => Promise<void>;
}

interface CashfreeConstructor {
  (config: { mode: 'sandbox' | 'production' }): CashfreeInstance;
}

declare global {
  interface Window {
    Cashfree: CashfreeConstructor;
  }
}

declare const Cashfree: CashfreeConstructor;