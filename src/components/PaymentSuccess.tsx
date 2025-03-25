import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const orderId = searchParams.get('order_id');
        if (!orderId) {
          throw new Error('No order ID received from payment gateway');
        }

        const response = await fetch(`https://sandbox.cashfree.com/pg/orders/${orderId}`, {
          headers: {
            'x-client-id': '9323391ef4bcb0d44ef73df5b8933239',
            'x-client-secret': 'cfsk_ma_prod_0b1c8a6bfe068a82b9feaca242d1bbee_161c1b2a',
            'x-api-version': '2022-09-01'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to verify payment status');
        }

        const data = await response.json();
        
        if (data.order_status === 'PAID') {
          setTimeout(() => {
            navigate('/', { state: { paymentSuccess: true } });
          }, 3000);
        } else {
          throw new Error(`Payment failed: ${data.order_status}`);
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Payment verification failed');
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