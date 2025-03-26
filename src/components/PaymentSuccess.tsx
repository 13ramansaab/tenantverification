import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

interface PaymentVerificationResponse {
  order_status: 'PAID' | 'PENDING' | 'FAILED' | 'UNKNOWN';
  order_id: string;
  order_amount: number;
  payment_details?: Array<{
    payment_status: string;
    payment_message?: string;
  }>;
}

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  const MAX_VERIFICATION_ATTEMPTS = 3;
  const VERIFICATION_INTERVAL = 5000; // 5 seconds

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const orderId = searchParams.get('order_id');
        if (!orderId) {
          throw new Error('No order ID received');
        }

        const response = await axios.get<PaymentVerificationResponse>(
          '/.netlify/functions/verify-payment',
          {
            params: { orderId },
          }
        );

        const { order_status, payment_details } = response.data;

        switch (order_status) {
          case 'PAID':
            // Payment successful, redirect to success page
            setTimeout(() => {
              navigate('/', { state: { paymentSuccess: true } });
            }, 3000);
            break;

          case 'PENDING':
            // Payment is still processing
            if (verificationAttempts < MAX_VERIFICATION_ATTEMPTS) {
              setVerificationAttempts(prev => prev + 1);
              setTimeout(() => {
                verifyPayment();
              }, VERIFICATION_INTERVAL);
            } else {
              throw new Error('Payment verification timeout. Please contact support if payment was deducted.');
            }
            break;

          case 'FAILED':
            throw new Error(
              payment_details?.[0]?.payment_message || 
              'Payment failed. Please try again.'
            );

          default:
            throw new Error('Unable to verify payment status');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setError(
          error instanceof Error 
            ? error.message 
            : 'Payment verification failed. Please contact support if payment was deducted.'
        );
        
        // Redirect to cancel page for failed payments
        setTimeout(() => {
          navigate('/payment/cancel');
        }, 5000);
      } finally {
        if (verificationAttempts >= MAX_VERIFICATION_ATTEMPTS) {
          setIsProcessing(false);
        }
      }
    };

    verifyPayment();
  }, [searchParams, navigate, verificationAttempts]);

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
          <p className="text-sm text-gray-500">You will be redirected to the cancellation page in a few seconds...</p>
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
            <p className="text-gray-600">
              Please wait while we verify your payment...
              {verificationAttempts > 0 && (
                <span className="block text-sm text-gray-500 mt-2">
                  Attempt {verificationAttempts} of {MAX_VERIFICATION_ATTEMPTS}
                </span>
              )}
            </p>
          </>
        ) : (
          <>
            <div className="mb-6">
              <svg className="mx-auto h-16 w-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
            <p className="text-gray-600 mb-8">
              Your payment has been processed successfully. You will be redirected back to the registration page.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;