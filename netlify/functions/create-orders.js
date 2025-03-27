console.log('Sending to Cashfree:', {
  url: cashfreeApiUrl,
  headers: {
    'x-client-id': cashfreeAppId,
    'x-client-secret': cashfreeSecretKey,
    'x-api-version': '2023-08-01',
    'Content-Type': 'application/json',
  },
  payload: orderPayload,
});
const response = await axios.post(cashfreeApiUrl, orderPayload, {
  headers: {
    'x-client-id': cashfreeAppId,
    'x-client-secret': cashfreeSecretKey,
    'x-api-version': '2023-08-01',
    'Content-Type': 'application/json',
  },
});
console.log('Cashfree raw response:', {
  status: response.status,
  data: response.data,
});