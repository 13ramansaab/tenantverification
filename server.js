import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, 'dist')));

const CASHFREE_BASE_URL = 'https://sandbox.cashfree.com/pg';
const APP_ID = '9323391ef4bcb0d44ef73df5b8933239';
const SECRET_KEY = 'cfsk_ma_prod_0b1c8a6bfe068a82b9feaca242d1bbee_161c1b2a';

app.post('/api/create-order', async (req, res) => {
  try {
    const { orderId, customerDetails } = req.body;

    const response = await axios.post(
      `${CASHFREE_BASE_URL}/orders`,
      {
        order_id: orderId,
        order_amount: 250,
        order_currency: "INR",
        customer_details: {
          customer_id: customerDetails.customerId,
          customer_phone: customerDetails.customerPhone,
          customer_email: customerDetails.customerEmail,
          customer_name: customerDetails.customerPhone
        },
        order_meta: {
          return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success?order_id={order_id}`,
          notify_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/webhook`
        },
        order_note: "Tenant Registration Fee"
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-version': '2022-09-01',
          'x-client-id': APP_ID,
          'x-client-secret': SECRET_KEY
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Error creating order:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to create order',
      details: error.response?.data || error.message
    });
  }
});

app.get('/api/order/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    const response = await axios.get(
      `${CASHFREE_BASE_URL}/orders/${orderId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-version': '2022-09-01',
          'x-client-id': APP_ID,
          'x-client-secret': SECRET_KEY
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching order:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to fetch order',
      details: error.response?.data || error.message
    });
  }
});

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});