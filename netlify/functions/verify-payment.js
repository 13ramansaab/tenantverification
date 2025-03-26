const axios = require('axios');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const orderId = event.queryStringParameters?.orderId;
    if (!orderId) {
      throw new Error('Order ID is required');
    }

    const isProduction = process.env.NODE_ENV === 'production';
    const cashfreeApiUrl = isProduction
      ? `https://api.cashfree.com/pg/orders/${orderId}`
      : `https://sandbox.cashfree.com/pg/orders/${orderId}`;

    console.log('Environment check:', {
      hasAppId: !!process.env.CASHFREE_APP_ID,
      hasSecretKey: !!process.env.CASHFREE_SECRET_KEY,
      nodeEnv: process.env.NODE_ENV,
      apiUrl: cashfreeApiUrl
    });

    const cashfreeAppId = process.env.CASHFREE_APP_ID;
    const cashfreeSecretKey = process.env.CASHFREE_SECRET_KEY;

    if (!cashfreeAppId || !cashfreeSecretKey) {
      throw new Error('Missing Cashfree credentials');
    }

    console.log('Making request to Cashfree API...');
    
    const response = await axios.get(cashfreeApiUrl, {
      headers: {
        'x-client-id': cashfreeAppId,
        'x-client-secret': cashfreeSecretKey,
        'x-api-version': '2023-08-01',
        'Content-Type': 'application/json',
      },
    });

    console.log('Cashfree order status response:', response.data);

    if (!response.data || !response.data.order_status) {
      throw new Error('Invalid response from Cashfree');
    }

    // Validate order amount
    if (response.data.order_amount !== 250) {
      throw new Error('Invalid order amount');
    }

    // Map Cashfree status to our status
    let order_status;
    switch (response.data.order_status) {
      case 'PAID':
        order_status = 'PAID';
        break;
      case 'ACTIVE':
        order_status = 'ACTIVE';
        break;
      case 'EXPIRED':
      case 'CANCELLED':
      case 'FAILED':
        order_status = 'FAILED';
        break;
      default:
        order_status = 'FAILED';
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        order_status,
        order_id: response.data.order_id,
        payment_status: response.data.payment_status,
        order_amount: response.data.order_amount,
      }),
    };
  } catch (error) {
    console.error('Payment verification error:', error.response?.data || error.message);
    
    const errorResponse = {
      error: error.response?.data?.message || error.message || 'Server error',
      details: error.response?.data || null,
      timestamp: new Date().toISOString(),
    };

    return {
      statusCode: error.response?.status || 500,
      headers,
      body: JSON.stringify(errorResponse),
    };
  }
};