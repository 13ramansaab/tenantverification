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

    const cashfreeAppId = process.env.CASHFREE_APP_ID;
    const cashfreeSecretKey = process.env.CASHFREE_SECRET_KEY;

    if (!cashfreeAppId || !cashfreeSecretKey) {
      throw new Error('Missing Cashfree credentials');
    }

    const response = await axios.get(cashfreeApiUrl, {
      headers: {
        'x-client-id': cashfreeAppId,
        'x-client-secret': cashfreeSecretKey,
        'x-api-version': '2023-08-01',
      },
    });

    const { data } = response;

    // Validate response data
    if (!data || !data.order_status || !data.order_id || !data.order_amount) {
      throw new Error('Invalid response from Cashfree');
    }

    // Validate order amount
    if (data.order_amount !== 250) {
      throw new Error('Invalid order amount');
    }

    // Map Cashfree status to standardized status
    let status;
    switch (data.order_status.toUpperCase()) {
      case 'PAID':
        status = 'PAID';
        break;
      case 'ACTIVE':
        status = 'PENDING';
        break;
      case 'EXPIRED':
      case 'CANCELLED':
      case 'FAILED':
        status = 'FAILED';
        break;
      default:
        status = 'UNKNOWN';
    }

    // Check payment details for additional verification
    if (status === 'PAID') {
      if (!data.payments || !data.payments.length) {
        status = 'FAILED';
      } else {
        const payment = data.payments[0];
        if (payment.payment_status !== 'SUCCESS') {
          status = 'FAILED';
        }
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        order_status: status,
        order_id: data.order_id,
        order_amount: data.order_amount,
        payment_details: data.payments || [],
      }),
    };
  } catch (error) {
    console.error('Payment verification error:', error.response?.data || error.message);
    
    return {
      statusCode: error.response?.status || 500,
      headers,
      body: JSON.stringify({
        error: error.response?.data?.message || error.message || 'Server error',
        timestamp: new Date().toISOString(),
      }),
    };
  }
};