import { useState, useEffect } from 'react';
import { TenantFormData } from '../types';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

interface PaymentModalProps {
  onClose: () => void;
  customerData: TenantFormData;
  onPaymentComplete: () => Promise<void>;
}

declare global {
  interface Window {
    CFPaymentSdk: any;
  }
}

const PaymentModal = ({ onClose, customerData, onPaymentComplete }: PaymentModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializePayment = async () => {
      try {
        setIsProcessing(true);
        setError(null);

        const orderId = `TRF-${uuidv4()}`;
        
        const response = await axios.post('/.netlify/functions/create-order', {
          orderId,
          customerDetails: {
            customerId: customerData.mobileNo,
            customerPhone: customerData.mobileNo,
            customerEmail: customerData.email,
            customerName: `${customerData.firstName} ${customerData.lastName}`
          }
        });

        const { payment_session_id } = response.data;

        if (!payment_session_id) {
          throw new Error('Failed to create payment session');
        }

        const paymentConfig = {
          paymentSessionId: payment_session_id,
          returnUrl: `${window.location.origin}/payment/success?order_id={order_id}`,
        };

        if (!window.CFPaymentSdk) {
          throw new Error('Payment SDK not loaded');
        }

        await window.CFPaymentSdk.init(paymentConfig);
        
        window.CFPaymentSdk.doPayment({
          orderToken: payment_session_id,
          orderAmount: 250,
          customerDetails: {
            customerId: customerData.mobileNo,
            customerEmail: customerData.email,
            customerPhone: customerData.mobileNo,
            customerName: `${customerData.firstName} ${customerData.lastName}`
          },
          onSuccess: async (data: any) => {
            console.log('Payment success:', data);
            await onPaymentComplete();
          },
          onFailure: (error: Error) => {
            console.error('Payment failed:', error);
            setError('Payment failed. Please try again.');
          }
        });
      } catch (error) {
        console.error('Payment initialization error:', error);
        setError(error instanceof Error ? error.message : 'Payment initialization failed');
      } finally {
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
          <p className="text-sm text-gray-600">Please wait while we initialize the payment...</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {isProcessing && (
          <div className="mb-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-gray-600">Initializing payment...</p>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Secure payment powered by Cashfree
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;