// functions/create-orders.js
const axios = require('axios');

exports.handler = async (event) => {
  console.log('Function invoked:', event);

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
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
    console.log('Request body:', body);

    const { orderId, customerDetails } = body;
    if (!orderId || !customerDetails) {
      throw new Error('Missing orderId or customerDetails');
    }

    const { customerId, customerPhone, customerEmail, customerName } = customerDetails;
    if (!customerId || !customerPhone || !customerEmail || !customerName) {
      throw new Error('Missing required customer details');
    }

    const isProduction = process.env.NODE_ENV === 'production';
    const cashfreeApiUrl = isProduction
      ? 'https://api.cashfree.com/pg/orders'
      : 'https://sandbox.cashfree.com/pg/orders';
    const cashfreeAppId = process.env.CASHFREE_APP_ID;
    const cashfreeSecretKey = process.env.CASHFREE_SECRET_KEY;

    console.log('Config:', {
      url: cashfreeApiUrl,
      appIdSet: !!cashfreeAppId,
      secretKeySet: !!cashfreeSecretKey,
    });

    if (!cashfreeAppId || !cashfreeSecretKey) {
      throw new Error('Missing Cashfree credentials');
    }

    const orderPayload = {
      order_id: orderId,
      order_amount: 250, // Hardcoded for now; adjust as needed
      order_currency: 'INR',
      customer_details: {
        customer_id: customerId,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
      },
    };

    console.log('Sending to Cashfree:', orderPayload);
    const response = await axios.post(cashfreeApiUrl, orderPayload, {
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
      body: JSON.stringify({ payment_session_id: response.data.payment_session_id }),
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