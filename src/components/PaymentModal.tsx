import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import type { TenantFormData } from '../types';
import type { CashfreeOrderResponse } from '../types/cashfree';

interface PaymentModalProps {
  onClose: () => void;
  customerData: TenantFormData;
  onPaymentComplete: () => Promise<void>;
}

const PaymentModal = ({ onClose, customerData, onPaymentComplete }: PaymentModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const paymentFormRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initializePayment = async () => {
      try {
        setIsProcessing(true);
        setError(null);

        if (!window.Cashfree) {
          throw new Error('Cashfree SDK not loaded');
        }

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

        // Initialize Cashfree Payment
        await window.Cashfree.initialiseDropin({
          orderToken: payment_session_id,
          onSuccess: async (data) => {
            console.log('Payment successful:', data);
            await onPaymentComplete();
          },
          onFailure: (data) => {
            console.error('Payment failed:', data);
            setError(`Payment failed: ${data.transaction.txStatus}`);
            setIsProcessing(false);
          },
          components: ["order-details", "card", "netbanking", "upi"],
          style: {
            backgroundColor: '#ffffff',
            color: '#11385b',
            fontFamily: 'Lato',
            fontSize: '14px',
            errorColor: '#ff0000',
            theme: 'light'
          }
        });

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

        <div id="payment-form" ref={paymentFormRef} className="mb-4">
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