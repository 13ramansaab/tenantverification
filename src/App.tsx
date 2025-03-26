import { BrowserRouter, Routes, Route } from 'react-router-dom'; // Ensure this line is present
import RegistrationForm from './components/RegistrationForm';
import PaymentSuccess from './components/PaymentSuccess';

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
        {/* Optional: Catch-all route for 404 */}
        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;