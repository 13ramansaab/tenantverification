import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import RegistrationForm from './components/RegistrationForm';
import ContactUs from './components/ContactUs';
import TermsAndConditions from './components/TermsAndConditions';
import PaymentSuccess from './components/PaymentSuccess';
import PaymentCancel from './components/PaymentCancel';
import SuccessPage from './components/SuccessPage';

const App = () => {
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handlePaymentComplete = () => {
    setPaymentSuccess(true);
  };

  const handleBack = () => {
    setPaymentSuccess(false);
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          paymentSuccess ? (
            <SuccessPage onBack={handleBack} />
          ) : (
            <RegistrationForm onPaymentComplete={handlePaymentComplete} />
          )
        }
      />
      <Route path="/contact" element={<ContactUs />} />
      <Route path="/terms" element={<TermsAndConditions />} />
      <Route path="/payment/success" element={<PaymentSuccess />} />
      <Route path="/payment/cancel" element={<PaymentCancel />} />
    </Routes>
  );
};

export default App;