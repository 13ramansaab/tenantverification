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
    Cashfree: any;
  }
}

const PaymentModal = ({ onClose, customerData, onPaymentComplete }: PaymentModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeOrder = async () => {
      try {
        setIsProcessing(true);
        setError(null);

        const orderId = `TRF-${uuidv4()}`;
        
        // Create order
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

        initializePaymentUI(payment_session_id);
      } catch (error) {
        console.error('Payment initialization error:', error);
        setError(error instanceof Error ? error.message : 'Payment initialization failed');
      } finally {
        setIsProcessing(false);
      }
    };

    initializeOrder();
  }, [customerData]);

  const initializePaymentUI = async (sessionId: string) => {
    try {
      const cashfree = new window.Cashfree({
        mode: "sandbox"
      });

      await cashfree.init({
        sessionId: sessionId
      });

      // Style configuration for UPI components
      const style = {
        base: {
          fontSize: '16px',
          color: '#333',
          '::placeholder': {
            color: '#999'
          }
        }
      };

      // Create UPI collect component
      const upiCollect = cashfree.create('upiCollect', {
        style
      });

      // Mount UPI collect component
      upiCollect.mount('#upi-collect-container');

      // Create UPI QR component
      const upiQR = cashfree.create('qrCode', {
        style
      });

      // Mount UPI QR component
      upiQR.mount('#upi-qr-container');

      // Create common UPI apps component
      const upiApps = cashfree.create('upiApps', {
        style
      });

      // Mount UPI apps component
      upiApps.mount('#upi-apps-container');

      // Handle payment submission
      const handlePay = async (component: any) => {
        try {
          setIsProcessing(true);
          setError(null);

          const result = await cashfree.pay({
            paymentMethod: component,
            paymentSessionId: sessionId
          });

          if (result.error) {
            throw new Error(result.error.message);
          }

          await onPaymentComplete();
        } catch (error) {
          console.error('Payment error:', error);
          setError(error instanceof Error ? error.message : 'Payment failed');
        } finally {
          setIsProcessing(false);
        }
      };

      // Add event listeners
      upiCollect.on('submit', () => handlePay(upiCollect));
      upiQR.on('submit', () => handlePay(upiQR));
      upiApps.on('select', () => handlePay(upiApps));

    } catch (error) {
      console.error('Error initializing payment UI:', error);
      setError(error instanceof Error ? error.message : 'Failed to initialize payment interface');
    }
  };

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
          <p className="text-sm text-gray-600">Choose a payment method below</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {isProcessing && (
          <div className="mb-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-gray-600">Processing payment...</p>
          </div>
        )}

        <div className="space-y-6">
          {/* UPI Payment Options */}
          <div>
            <h3 className="text-lg font-medium mb-4">Pay using UPI</h3>
            
            {/* UPI Collect */}
            <div id="upi-collect-container" className="mb-4"></div>
            
            {/* UPI QR Code */}
            <div id="upi-qr-container" className="mb-4"></div>
            
            {/* UPI Apps */}
            <div id="upi-apps-container"></div>
          </div>
        </div>

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