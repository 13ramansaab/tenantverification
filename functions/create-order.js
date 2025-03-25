exports.handler = async (event, context) => {
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
    
    // For now, return a mock successful response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        payment_session_id: 'session_' + orderId,
        order_id: orderId,
        order_status: 'ACTIVE'
      })
    };
  } catch (error) {
    console.error('Order creation error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || 'Server error' })
    };
  }
};