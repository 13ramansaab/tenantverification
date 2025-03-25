// src/components/PaymentModal.tsx
import { useState, useEffect } from 'react';
import { TenantFormData } from '../types';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

interface PaymentModalProps {
  onClose: () => void;
  customerData: TenantFormData;
  onPaymentComplete: () => Promise<void>;
}

const PaymentModal = ({ onClose, customerData, onPaymentComplete }: PaymentModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

        const response = await axios.post('/.netlify/functions/create-order', payload);
        const { payment_session_id, order_status } = response.data;

        if (!payment_session_id || order_status !== 'ACTIVE') {
          throw new Error('Failed to initialize payment');
        }

        const cashfree = Cashfree({
          mode: 'sandbox',
        });

        const paymentOptions = {
          paymentSessionId: payment_session_id,
          returnUrl: `${window.location.origin}/payment/success?order_id=${orderId}`,
        };

        await cashfree.checkout(paymentOptions);
        console.log('Payment initiated successfully');
        await onPaymentComplete();

      } catch (error) {
        console.error('Payment initialization error:', error);
        setError(error instanceof Error ? error.message : 'Payment initialization failed');
        setIsProcessing(false);
      }
    };

    initializePayment();
  }, [customerData, onPaymentComplete]);

  // ... rest of your JSX remains unchanged
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      {/* ... rest of your JSX */}
    </div>
  );
};

export default PaymentModal;