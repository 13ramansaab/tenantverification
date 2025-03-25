import { Handler } from '@netlify/functions';
import axios from 'axios';

const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    if (!event.body) {
      throw new Error('Missing request body');
    }

    const { orderId, customerDetails } = JSON.parse(event.body);
    console.log('Request payload:', { orderId, customerDetails });

    const cashfreeApiUrl = 'https://sandbox.cashfree.com/pg/orders';
    const cashfreeAppId = process.env.YOUR_SANDBOX_APP_ID;
    const cashfreeSecretKey = process.env.YOUR_SANDBOX_SECRET_KEY;

    if (!cashfreeAppId || !cashfreeSecretKey) {
      throw new Error('Missing Cashfree credentials');
    }

    const orderData = {
      order_amount: 250,
      order_currency: 'INR',
      order_id: orderId,
      customer_details: {
        customer_id: customerDetails.customerId,
        customer_email: customerDetails.customerEmail,
        customer_phone: customerDetails.customerPhone,
        customer_name: customerDetails.customerName,
      },
      order_meta: {
        return_url: 'https://registertenant.netlify.app/payment/success?order_id={order_id}',
        notify_url: 'https://registertenant.netlify.app/payment/webhook',
      },
      order_note: "Tenant Registration Fee"
    };

    console.log('Sending to Cashfree:', orderData);

    const response = await axios.post(cashfreeApiUrl, orderData, {
      headers: {
        'x-client-id': cashfreeAppId,
        'x-client-secret': cashfreeSecretKey,
        'x-api-version': '2022-09-01',
        'Content-Type': 'application/json',
      },
    });

    console.log('Cashfree response:', response.data);
    const { payment_session_id, order_id, payment_link } = response.data;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        payment_session_id,
        order_id,
        payment_link
      }),
    };
  } catch (error) {
    console.error('Order creation error:', error.response?.data || error.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.response?.data?.message || 'Server error' }),
    };
  }
};

export { handler };