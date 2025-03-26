import { useEffect, useState } from 'react';
import axios from 'axios';
import { CashfreeOrderStatus } from '@/types/cashfree';

const PaymentSuccess = () => {
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const orderId = urlParams.get('order_id');
        if (!orderId) {
          throw new Error('No order ID received from payment gateway');
        }

        console.log('Verifying payment for orderId:', orderId);
        const response = await axios.get<CashfreeOrderStatus>(
          `/.netlify/functions/verify-payments?orderId=${orderId}`
        );
        console.log('Verification response:', response.data);

        if (response.data.order_status === 'PAID') {
          setIsPaid(true);
          setTimeout(() => {
            window.location.href = '/';
          }, 5000);
        } else {
          throw new Error(`Payment status: ${response.data.order_status}`);
        }
      } catch (error) {
        console.error('Verification error:', error);
        setError(
          error instanceof Error
            ? error.message
            : 'Payment verification failed. Please try again or contact support.'
        );
      } finally {
        setIsProcessing(false);
      }
    };

    verifyPayment();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-lg shadow p-8 text-center">
          <div className="mb-6 text-red-500">
            <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Payment Verification Failed</h1>
          <p className="text-gray-600 mb-8">{error}</p>
          <button
            onClick={() => (window.location.href = '/')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Return to Registration
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-lg shadow p-8 text-center">
        {isProcessing ? (
          <>
            <div className="mb-6">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Verifying Payment</h1>
            <p className="text-gray-600">Please wait while we verify your payment...</p>
          </>
        ) : isPaid ? (
          <>
            <div className="mb-6">
              <svg className="mx-auto h-16 w-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
            <p className="text-gray-600 mb-8">
              Your payment has been processed successfully. You will be redirected to the homepage shortly.
            </p>
            <button
              onClick={() => (window.location.href = '/')}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Return to Homepage Now
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default PaymentSuccess;