import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import RegistrationForm from './components/RegistrationForm';
import ContactUs from './components/ContactUs';
import TermsAndConditions from './components/TermsAndConditions';
import PaymentSuccess from './components/PaymentSuccess';
import PaymentCancel from './components/PaymentCancel';
import SuccessPage from './components/SuccessPage';


interface RegistrationFormProps {
  onPaymentComplete: () => Promise<void>; // Assuming this is the prop type from RegistrationForm
}

function App() {
  const handlePaymentComplete = async () => {
    console.log('Payment completed successfully');
    // Add any async logic here if needed, e.g., API calls or state updates
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RegistrationForm onPaymentComplete={handlePaymentComplete} />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        {/* Optional: Catch-all route for 404 */}
        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;