import { useState, useEffect } from 'react';
import { TenantFormData } from '../types';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

// TypeScript declaration for Cashfree SDK v3
interface CashfreeSDK {
  new (paymentSessionId: string): {
    checkout: (options: {
      redirect?: boolean;
      onPaymentSuccess?: (data: any) => void;
      onPaymentFailure?: (data: any) => void;
      onError?: (error: any) => void;
    }) => void;
  };
}

declare global {
  interface Window {
    Cashfree?: CashfreeSDK;
  }
}

interface PaymentModalProps {
  onClose: () => void;
  customerData: TenantFormData;
  onPaymentComplete: () => Promise<void>;
}

const PaymentModal = ({ onClose, customerData, onPaymentComplete }: PaymentModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);

  // Load Cashfree SDK dynamically
  useEffect(() => {
    if (!window.Cashfree) {
      const script = document.createElement('script');
      script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
      script.async = true;
      script.onload = () => {
        console.log('Cashfree SDK loaded');
        setSdkLoaded(true);
      };
      script.onerror = () => {
        console.error('Failed to load Cashfree SDK');
        setError('Failed to load Cashfree SDK');
      };
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    } else {
      console.log('Cashfree SDK already loaded');
      setSdkLoaded(true);
    }
  }, []);

  // Initialize payment once SDK is loaded
  useEffect(() => {
    if (!sdkLoaded) return;

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
        console.log('Sending to create-order:', payload);

        const response = await axios.post('/.netlify/functions/create-order', payload);
        console.log('Received from create-order:', response.data);
        const { payment_session_id } = response.data;

        if (!payment_session_id) {
          throw new Error('Failed to create payment session');
        }

        if (!window.Cashfree) {
          throw new Error('Cashfree SDK not loaded');
        }

        console.log('Initializing Cashfree with:', payment_session_id);
        const cashfree = new window.Cashfree(payment_session_id);

        // Track if redirect happens
        let redirected = false;

        // Use checkout with redirect mode
        cashfree.checkout({
          redirect: true,
          onPaymentSuccess: (data) => {
            console.log('Payment success:', data);
            redirected = true;
            setIsProcessing(false);
            onPaymentComplete();
            onClose();
          },
          onPaymentFailure: (data) => {
            console.error('Payment failure:', data);
            setError('Payment failed: ' + (data?.message || 'Unknown error'));
            setIsProcessing(false);
          },
          onError: (error) => {
            console.error('Cashfree SDK error:', error);
            setError('SDK error: ' + (error?.message || 'Unknown error'));
            setIsProcessing(false);
          },
        });

        // Fallback: If checkout doesn't redirect within 2 seconds, do it manually
        setTimeout(() => {
          if (!redirected) {
            console.log('Falling back to manual redirect');
            const paymentUrl = `https://sandbox.cashfree.com/pg/view/sessions/checkout?session_id=${payment_session_id}`;
            window.location.href = paymentUrl;
          }
        }, 2000);

      } catch (error) {
        console.error('Payment initialization error:', error);
        setError(error instanceof Error ? error.message : 'Payment initialization failed');
        setIsProcessing(false);
      }
    };

    initializePayment();
  }, [sdkLoaded, customerData, onPaymentComplete]);

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

        <div id="payment-form" className="mb-4">
          {isProcessing && (
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