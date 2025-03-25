import CryptoJS from 'crypto-js';

const MERCHANT_ID = '4207054';
const ACCESS_CODE = 'AVLF61MC56BS82FLSB';
const WORKING_KEY = '5E3CBF7EFB08818ACB858DE3A19E21A9';
const REDIRECT_URL = 'https://registertenant.netlify.app/payment/success';
const CANCEL_URL = 'https://registertenant.netlify.app/payment/cancel';

export const generateCCavenueRequest = (orderId: string, amount: number, customerData: any) => {
  const merchantData = {
    merchant_id: MERCHANT_ID,
    order_id: orderId,
    currency: 'INR',
    amount: amount.toString(),
    redirect_url: REDIRECT_URL,
    cancel_url: CANCEL_URL,
    language: 'EN',
    billing_name: `${customerData.firstName} ${customerData.lastName}`,
    billing_email: customerData.email,
    billing_tel: customerData.mobileNo,
  };

  // Convert merchant data to query string
  const merchantDataString = Object.entries(merchantData)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');

  // Encrypt the merchant data
  const encrypted = encryptData(merchantDataString, WORKING_KEY);

  return {
    encRequest: encrypted,
    access_code: ACCESS_CODE
  };
};

const encryptData = (plainText: string, workingKey: string) => {
  const key = CryptoJS.enc.Hex.parse(workingKey);
  const iv = CryptoJS.enc.Hex.parse('000102030405060708090a0b0c0d0e0f');
  
  const encrypted = CryptoJS.AES.encrypt(plainText, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });

  return encrypted.toString();
};

export const decryptResponse = (encResponse: string) => {
  const key = CryptoJS.enc.Hex.parse(WORKING_KEY);
  const iv = CryptoJS.enc.Hex.parse('000102030405060708090a0b0c0d0e0f');
  
  const decrypted = CryptoJS.AES.decrypt(encResponse, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });

  return decrypted.toString(CryptoJS.enc.Utf8);
};