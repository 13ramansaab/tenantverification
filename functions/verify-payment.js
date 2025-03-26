// netlify/functions/verify-payments.js
exports.handler = async (event) => {
  console.log('Function invoked:', event);
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Hello from verify-payments', orderId: event.queryStringParameters?.orderId }),
  };
};