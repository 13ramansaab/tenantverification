// functions/create-orders.js
const axios = require('axios');

exports.handler = async (event) => {
  // ... (previous logic)
  console.log('Creating order with payload:', event.body);
  const response = await axios.post(
    process.env.NODE_ENV === 'production'
      ? 'https://api.cashfree.com/pg/orders'
      : 'https://sandbox.cashfree.com/pg/orders',
    {
      order_id: orderId,
      order_amount: 250,
      order_currency: 'INR',
      customer_details: customerDetails,
      order_meta: { return_url: `${event.headers.origin}/payment/success?order_id={order_id}` },
    },
    {
      headers: {
        'x-client-id': process.env.CASHFREE_APP_ID,
        'x-client-secret': process.env.CASHFREE_SECRET_KEY,
        'x-api-version': '2023-08-01',
      },
    }
  );
  console.log('Cashfree response:', response.data);
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ payment_session_id: response.data.payment_session_id }),
  };
};