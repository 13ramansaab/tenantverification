import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import RegistrationForm from './components/RegistrationForm';
import ContactUs from './components/ContactUs';
import TermsAndConditions from './components/TermsAndConditions';
import PaymentSuccess from './components/PaymentSuccess';
import PaymentCancel from './components/PaymentCancel';
import SuccessPage from './components/SuccessPage';


interface RegistrationFormProps {
  onPaymentComplete: () => Promise<void>;
}

function App() {
  const handlePaymentComplete = async () => {
    console.log('Payment completed successfully');
    // Add any async logic here if needed
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RegistrationForm onPaymentComplete={handlePaymentComplete} />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;