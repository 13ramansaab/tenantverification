import { Handler } from '@netlify/functions';
import axios from 'axios';

const handler: Handler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    if (!event.body) {
      throw new Error('Missing request body');
    }

    const { orderId, customerDetails } = JSON.parse(event.body);
    
    const response = await axios.post(
      'https://sandbox.cashfree.com/pg/orders',
      {
        order_amount: 250,
        order_currency: 'INR',
        order_id: orderId,
        customer_details: {
          customer_id: customerDetails.customerId,
          customer_email: customerDetails.customerEmail,
          customer_phone: customerDetails.customerPhone,
          customer_name: customerDetails.customerName
        },
        order_meta: {
          return_url: 'https://registertenant.netlify.app/payment/success?order_id={order_id}',
          notify_url: 'https://registertenant.netlify.app/payment/webhook'
        }
      },
      {
        headers: {
          'x-client-id': '9323391ef4bcb0d44ef73df5b8933239',
          'x-client-secret': 'cfsk_ma_prod_0b1c8a6bfe068a82b9feaca242d1bbee_161c1b2a',
          'x-api-version': '2022-09-01',
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        payment_session_id: response.data.payment_session_id,
        order_id: response.data.order_id,
        order_status: response.data.order_status
      })
    };
  } catch (error) {
    console.error('Order creation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Server error';
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: errorMessage })
    };
  }
};

export { handler };