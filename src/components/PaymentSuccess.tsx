import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { CashfreeOrderStatus } from '@/types/cashfree';
import { AxiosError } from 'axios';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const orderId = searchParams.get('order_id');
        if (!orderId) {
          throw new Error('No order ID received from payment gateway');
        }

        console.log('Verifying payment for orderId:', orderId);
        const response = await axios.get<CashfreeOrderStatus>(
          `/.netlify/functions/verify-payments?orderId=${orderId}`,
          { headers: { Accept: 'application/json' } } // Force JSON response
        );
        console.log('Verification response:', response.data);

        if (!response.data || typeof response.data.order_status !== 'string') {
          throw new Error('Invalid verification response');
        }

        if (response.data.order_status === 'PAID') {
          setIsPaid(true);
          setTimeout(() => {
            navigate('/', { state: { paymentSuccess: true } });
          }, 5000);
        } else {
          throw new Error(`Payment status: ${response.data.order_status || 'unknown'}`);
        }
      } catch (error: unknown) {
        const isAxiosError = (err: any): err is AxiosError => err.isAxiosError || (err.response && err.request);
        const err = error as Error | AxiosError;

        console.error('Verification error:', {
          message: err instanceof Error ? err.message : 'Unknown error',
          stack: err instanceof Error ? err.stack : undefined,
          axiosError: isAxiosError(err) ? {
            status: err.response?.status,
            data: err.response?.data,
          } : null,
        });
        setError(
          err instanceof Error
            ? err.message
            : 'Payment verification failed. Please try again or contact support.'
        );
      } finally {
        setIsProcessing(false);
      }
    };

    verifyPayment();
  }, [searchParams, navigate]);

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
            onClick={() => navigate('/')}
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
              onClick={() => navigate('/')}
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