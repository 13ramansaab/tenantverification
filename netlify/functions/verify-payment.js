// functions/verify-payments.js
exports.handler = async (event) => {
  console.log('Verify-payments invoked:', event);

  const headers = {
    'Content-Type': 'application/json',
  };

  try {
    const orderId = event.queryStringParameters?.orderId;
    if (!orderId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Order ID is required' }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ order_status: 'PAID' }), // Hardcoded for testing
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || 'Server error' }),
    };
  }
};