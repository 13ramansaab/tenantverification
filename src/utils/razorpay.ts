import { v4 as uuidv4 } from 'uuid';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const RAZORPAY_KEY = 'rzp_test_YourTestKey'; // Replace with your actual key

interface CreateOrderParams {
  amount: number;
  customerDetails: {
    name: string;
    email: string;
    phone: string;
  };
}

export const initializePayment = ({ amount, customerDetails }: CreateOrderParams) => {
  return new Promise((resolve, reject) => {
    const options = {
      key: RAZORPAY_KEY,
      amount: amount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      name: 'Tenant Registration',
      description: 'Registration Fee Payment',
      order_id: `TRF-${uuidv4()}`,
      prefill: {
        name: customerDetails.name,
        email: customerDetails.email,
        contact: customerDetails.phone,
      },
      handler: function (response: any) {
        resolve({
          transactionId: response.razorpay_payment_id,
          orderId: response.razorpay_order_id,
        });
      },
      modal: {
        ondismiss: function () {
          reject(new Error('Payment cancelled by user'));
        },
      },
      theme: {
        color: '#3B82F6',
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  });
};