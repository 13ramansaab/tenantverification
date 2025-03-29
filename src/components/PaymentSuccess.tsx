import { useEffect, useState } from 'react';
import axios from 'axios';
import { saveTenantData } from '../api';

const PaymentSuccess = () => {
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    const verifyAndSavePayment = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const orderId = urlParams.get('order_id');
        if (!orderId) {
          throw new Error('No order ID received from payment gateway');
        }

        console.log('Verifying payment for orderId:', orderId);
        const functionUrl = 'https://registertenant.netlify.app/.netlify/functions/verify-payments';
        const response = await axios.get(
          `${functionUrl}?orderId=${orderId}`,
          { headers: { Accept: 'application/json' } }
        );
        console.log('Verification response:', response.data);

        if (response.data.order_status !== 'PAID') {
          throw new Error(`Payment status: ${response.data.order_status || 'unknown'}`);
        }

        const tenantData = JSON.parse(localStorage.getItem('tenantFormData') || '{}');
        const ownerMobileNo = tenantData.presentAddress?.ownerMobileNo;
        if (!ownerMobileNo || !tenantData.mobileNo) {
          throw new Error('Missing tenant data for submission');
        }

        await saveTenantData(ownerMobileNo, tenantData);
        console.log('Tenant data saved successfully');

        setIsPaid(true);
        setTimeout(() => {
          localStorage.removeItem('tenantFormData');
          window.location.href = '/';
        }, 5000);
      } catch (error) {
        console.error('Verification or save error:', error);
        setError(error.message || 'Payment verification or data save failed.');
      } finally {
        setIsProcessing(false);
      }
    };

    verifyAndSavePayment();
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