import { useState, useEffect } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import type { TenantFormData } from '../types';
import type { CashfreeOrderResponse, Cashfree } from '@/types/cashfree'; // Import from cashfree.ts

interface PaymentModalProps {
  onClose: () => void;
  customerData: TenantFormData;
  onPaymentComplete: () => Promise<void>;
}

const PaymentModal = ({ onClose, customerData, onPaymentComplete }: PaymentModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCashfreeSDK = () => {
    return new Promise<void>((resolve, reject) => {
      if (typeof window.Cashfree !== 'undefined') {
        console.log('Cashfree SDK already loaded');
        resolve();
      } else {
        const script = document.createElement('script');
        script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
        script.async = true;
        script.onload = () => {
          console.log('Cashfree SDK loaded successfully');
          resolve();
        };
        script.onerror = () => {
          console.error('Failed to load Cashfree SDK');
          reject(new Error('Failed to load Cashfree SDK'));
        };
        document.head.appendChild(script);
      }
    });
  };

  useEffect(() => {
    const initializePayment = async () => {
      try {
        setIsProcessing(true);
        setError(null);

        const orderId = `TRF-${uuidv4()}`;
        const payload = {
          orderId,
          customerDetails: {
            customerId: customerData.mobileNo,
            customerPhone: customerData.mobileNo,
            customerEmail: customerData.email,
            customerName: `${customerData.firstName} ${customerData.lastName}`,
          },
        };

        console.log('Creating order with payload:', payload);
        const response = await axios.post<CashfreeOrderResponse>(
          '/.netlify/functions/create-orders',
          payload
        );
        console.log('Order creation response:', response.data);

        const { payment_session_id } = response.data;
        if (!payment_session_id || typeof payment_session_id !== 'string' || !payment_session_id.startsWith('session_')) {
          throw new Error('Invalid payment session ID received');
        }

        await loadCashfreeSDK();

        if (typeof window.Cashfree === 'undefined') {
          throw new Error('Cashfree SDK not loaded');
        }

        const cashfree: Cashfree = window.Cashfree({
          mode: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
        });
        console.log('Cashfree instance initialized:', cashfree);

        // Since checkout is optional in the type, check its existence
        if (!cashfree.checkout) {
          throw new Error('Cashfree checkout method is unavailable');
        }

        const checkoutOptions = {
          paymentSessionId: payment_session_id,
          redirectTarget: '_self' as const,
          returnUrl: `${window.location.origin}/payment/success?order_id=${orderId}`,
        };
        console.log('Initiating checkout with options:', checkoutOptions);

        // `checkout` in cashfree.ts is void, but docs suggest it returns a Promise in newer SDK versions
        // For now, treat it as void per the type, but handle redirect implicitly
        cashfree.checkout(checkoutOptions);
        console.log('Checkout initiated; expecting redirect');

        // Since checkout is void and redirects, we don’t await a result here
        // onPaymentComplete will be called by PaymentSuccess.tsx after verification
      } catch (error) {
        console.error('Payment initialization error:', {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
        setError(error instanceof Error ? error.message : 'Payment initialization failed');
        setIsProcessing(false);
      }
    };

    initializePayment();
  }, [customerData, onPaymentComplete]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Complete Payment</h2>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <div className="mb-6">
          <p className="text-lg font-medium mb-2">Amount to pay: ₹250</p>
          <p className="text-sm text-gray-600">Please complete the payment to proceed.</p>
        </div>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        <div id="payment-form" className="mb-4 min-h-[300px]">
          {isProcessing && !error && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-gray-600">Initializing payment...</p>
            </div>
          )}
        </div>
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">Secure payment powered by Cashfree</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;