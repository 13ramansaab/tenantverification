const axios = require('axios');

exports.handler = async (event) => {
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

    const isProduction = process.env.NODE_ENV === 'production';
    const cashfreeApiUrl = isProduction
      ? 'https://api.cashfree.com/pg/orders'
      : 'https://sandbox.cashfree.com/pg/orders';
    const cashfreeAppId = process.env.CASHFREE_APP_ID;
    const cashfreeSecretKey = process.env.CASHFREE_SECRET_KEY;

    if (!cashfreeAppId || !cashfreeSecretKey) {
      throw new Error('Missing Cashfree credentials');
    }

    const orderData = {
      order_id: orderId,
      order_amount: 250,
      order_currency: 'INR',
      customer_details: {
        customer_id: customerDetails.customerId,
        customer_phone: customerDetails.customerPhone,
        customer_email: customerDetails.customerEmail,
        customer_name: customerDetails.customerName,
      },
      order_meta: {
        return_url: `${process.env.URL || 'http://localhost:8888'}/payment/success?order_id={order_id}`,
        notify_url: `${process.env.URL || 'http://localhost:8888'}/payment/webhook`,
      },
      order_note: 'Tenant Registration Fee',
    };

    console.log('Sending to Cashfree:', orderData);

    const response = await axios.post(cashfreeApiUrl, orderData, {
      headers: {
        'x-client-id': cashfreeAppId,
        'x-client-secret': cashfreeSecretKey,
        'x-api-version': '2023-08-01',
        'Content-Type': 'application/json',
      },
    });

    console.log('Cashfree response:', response.data);

    const { payment_session_id, order_id, order_status } = response.data;
    if (!payment_session_id || typeof payment_session_id !== 'string' || !payment_session_id.startsWith('session_')) {
      throw new Error('Invalid payment_session_id received from Cashfree');
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        payment_session_id,
        order_id,
        order_status,
      }),
    };
  } catch (error) {
    console.error('Order creation error:', error.response?.data || error.message);
    return {
      statusCode: error.response?.status || 500,
      headers,
      body: JSON.stringify({
        error: error.response?.data?.message || error.message || 'Server error',
      }),
    };
  }
};