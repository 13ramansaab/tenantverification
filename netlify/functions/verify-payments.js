exports.handler = async (event) => {
  console.log('Function invoked with event:', event);
  console.log('Query params:', event.queryStringParameters);
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'Hello from verify-payments',
      orderId: event.queryStringParameters?.orderId || 'No orderId provided',
    }),
  };
};