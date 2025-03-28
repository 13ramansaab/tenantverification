import { useState, useEffect } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const PaymentModal = ({ onClose, customerData }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCashfreeSDK = () => {
    return new Promise((resolve, reject) => {
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

        console.log('Creating order with payload:', JSON.stringify(payload, null, 2));
        const response = await axios.post(
          '/.netlify/functions/create-orders',
          payload,
          { headers: { 'Content-Type': 'application/json' } }
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

        const cashfree = window.Cashfree({
          mode: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
        });
        console.log('Cashfree instance initialized:', cashfree);

        const checkoutOptions = {
          paymentSessionId: payment_session_id,
          redirectTarget: '_self',
          returnUrl: `${window.location.origin}/payment/success?order_id=${orderId}`,
        };
        console.log('Initiating checkout with options:', checkoutOptions);

        cashfree.checkout(checkoutOptions);
        console.log('Checkout initiated; expecting redirect');
      } catch (error) {
        console.error('Payment initialization error:', error);
        setError(error.message || 'Payment initialization failed. Please try again or contact support.');
        setIsProcessing(false);
      }
    };

    initializePayment();
  }, [customerData]);

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