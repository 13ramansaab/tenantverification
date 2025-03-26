const axios = require('axios');

exports.handler = async (event) => {
  console.log('Function invoked:', event);
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return { statusCode: 204, headers };
  }

  if (event.httpMethod !== 'GET') {
    console.log('Invalid method:', event.httpMethod);
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const orderId = event.queryStringParameters?.orderId;
    console.log('Order ID:', orderId);
    if (!orderId) throw new Error('Order ID is required');

    const isProduction = process.env.NODE_ENV === 'production';
    const cashfreeApiUrl = isProduction
      ? `https://api.cashfree.com/pg/orders/${orderId}`
      : `https://sandbox.cashfree.com/pg/orders/${orderId}`;
    const cashfreeAppId = process.env.CASHFREE_APP_ID;
    const cashfreeSecretKey = process.env.CASHFREE_SECRET_KEY;

    console.log('Config:', { url: cashfreeApiUrl, appIdSet: !!cashfreeAppId, secretKeySet: !!cashfreeSecretKey });
    if (!cashfreeAppId || !cashfreeSecretKey) throw new Error('Missing Cashfree credentials');

    const response = await axios.get(cashfreeApiUrl, {
      headers: {
        'x-client-id': cashfreeAppId,
        'x-client-secret': cashfreeSecretKey,
        'x-api-version': '2023-08-01',
      },
    });

    console.log('Cashfree response:', response.data);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ order_status: response.data.order_status }),
    };
  } catch (error) {
    console.error('Verify payments error:', {
      message: error.message,
      stack: error.stack,
      response: error.response ? { status: error.response.status, data: error.response.data } : null,
    });
    return {
      statusCode: error.response?.status || 500,
      headers,
      body: JSON.stringify({ error: error.response?.data?.message || error.message || 'Server error' }),
    };
  }
};