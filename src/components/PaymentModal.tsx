import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import type { TenantFormData } from '@/types';
import type { CashfreeOrderResponse } from '@/types/cashfree';

interface PaymentModalProps {
  onClose: () => void;
  customerData: TenantFormData;
  onPaymentComplete: () => Promise<void>;
}

const PaymentModal = ({ onClose, customerData, onPaymentComplete }: PaymentModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const paymentContainerRef = useRef<HTMLDivElement>(null);

  const loadCashfreeSDK = () => {
    return new Promise((resolve, reject) => {
      if (window.Cashfree) {
        console.log('Cashfree SDK already loaded:', window.Cashfree);
        resolve(true);
      } else {
        const script = document.createElement('script');
        script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
        script.async = true;
        script.onload = () => {
          console.log('Cashfree SDK loaded:', window.Cashfree);
          resolve(true);
        };
        script.onerror = () => reject(new Error('Failed to load Cashfree SDK'));
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
        console.log('Sending to create-order:', payload);

        const response = await axios.post<CashfreeOrderResponse>('/.netlify/functions/create-order', payload);
        console.log('Received from create-order:', response.data);
        const { payment_session_id } = response.data;

        if (!payment_session_id) {
          throw new Error('Failed to retrieve payment session ID');
        }

        await loadCashfreeSDK();

        if (!window.Cashfree) {
          throw new Error('Cashfree SDK not loaded');
        }

        // Initialize Cashfree with mode (adjust 'production' or 'sandbox' as needed)
        const cashfree = window.Cashfree({ mode: 'production' }); // Use 'sandbox' for testing
        console.log('Cashfree instance:', cashfree);
        console.log('Instance own properties:', Object.keys(cashfree));
        console.log('Instance version:', cashfree.version);

        const container = paymentContainerRef.current;
        if (!container) {
          throw new Error('Payment container not found');
        }

        // Create a payment component (e.g., card payment)
        const paymentComponent = cashfree.create('card', {
          values: {}, // Add card-specific options if needed
          style: {
            base: { fontSize: '16px' },
          },
        });
        console.log('Payment component created:', paymentComponent);

        // Mount the component to the container
        paymentComponent.mount(container);
        console.log('Payment component mounted to container');

        if (typeof cashfree.pay === 'function') {
          console.log('Using pay method');
          const payResult = await cashfree.pay({
            paymentMethod: paymentComponent,
            paymentSessionId: payment_session_id,
            returnUrl: `${window.location.origin}/payment/success?order_id=${orderId}`,
            redirect: 'if_required', // Redirect only if necessary
          });
          console.log('Pay result:', payResult);

          if (payResult.error) {
            throw new Error(`Payment failed: ${payResult.error.message || JSON.stringify(payResult.error)}`);
          }
          if (payResult.paymentDetails) {
            console.log('Payment success:', payResult.paymentDetails);
            await onPaymentComplete();
          }
          if (payResult.redirect) {
            console.log('Payment redirected');
            // Handle redirect if needed
          }
          setIsProcessing(false);
        } else if (typeof cashfree.checkout === 'function') {
          console.log('Using checkout method');
          cashfree.checkout({
            paymentSessionId: payment_session_id,
            redirectTarget: '_modal',
            returnUrl: `${window.location.origin}/payment/success?order_id=${orderId}`,
          });
          setIsProcessing(false);
        } else {
          console.error('No suitable Cashfree payment methods available');
          throw new Error('Cashfree SDK lacks pay or checkout methods');
        }

      } catch (error) {
        console.error('Payment initialization error:', error);
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
          <button onClick={onClose} disabled={isProcessing} className="text-gray-500 hover:text-gray-700">
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
        <div ref={paymentContainerRef} id="payment-form" className="mb-4 min-h-[300px]">
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