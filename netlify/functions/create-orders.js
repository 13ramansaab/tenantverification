// functions/create-orders.js
const axios = require('axios');

exports.handler = async (event) => {
  console.log('Function invoked with event:', event);

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return { statusCode: 204, headers };
  }

  if (event.httpMethod !== 'POST') {
    console.log('Invalid method:', event.httpMethod);
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { orderId, customerDetails } = body;
    console.log('Parsed body:', { orderId, customerDetails });

    if (!orderId || !customerDetails) {
      throw new Error('Missing orderId or customerDetails');
    }

    const isProduction = process.env.NODE_ENV === 'production';
    const cashfreeApiUrl = isProduction
      ? 'https://api.cashfree.com/pg/orders'
      : 'https://sandbox.cashfree.com/pg/orders';
    const cashfreeAppId = process.env.CASHFREE_APP_ID;
    const cashfreeSecretKey = process.env.CASHFREE_SECRET_KEY;

    console.log('Config:', {
      isProduction,
      cashfreeApiUrl,
      appIdSet: !!cashfreeAppId,
      secretKeySet: !!cashfreeSecretKey,
    });

    if (!cashfreeAppId || !cashfreeSecretKey) {
      throw new Error('Missing Cashfree credentials');
    }

    const payload = {
      order_id: orderId,
      order_amount: 250,
      order_currency: 'INR',
      customer_details: {
        customer_id: customerDetails.customerId,
        customer_name: customerDetails.customerName,
        customer_email: customerDetails.customerEmail,
        customer_phone: customerDetails.customerPhone,
      },
      order_meta: {
        return_url: `${event.headers.origin || 'https://registertenant.netlify.app'}/payment/success?order_id={order_id}`,
      },
    };

    console.log('Sending payload to Cashfree:', payload);
    const response = await axios.post(cashfreeApiUrl, payload, {
      headers: {
        'x-client-id': cashfreeAppId,
        'x-client-secret': cashfreeSecretKey,
        'x-api-version': '2023-08-01',
        'Content-Type': 'application/json',
      },
    });

    console.log('Cashfree response:', response.data);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        payment_session_id: response.data.payment_session_id,
        order_id: response.data.order_id,
        order_status: response.data.order_status,
      }),
    };
  } catch (error) {
    console.error('Create order error:', {
      message: error.message,
      stack: error.stack,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data,
      } : null,
    });
    return {
      statusCode: error.response?.status || 500,
      headers,
      body: JSON.stringify({
        error: error.response?.data?.message || error.message || 'Server error',
      }),
    };
  }
};