import { Link } from 'react-router-dom';

const ContactUs = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Contact Us</h1>
        <p className="text-gray-600 mb-4">Last updated on 24-03-2025 17:48:38</p>
        
        <div className="space-y-4">
          <p className="text-gray-700">You may contact us using the information below:</p>
          
          <div className="space-y-2">
            <p><strong>Merchant Legal entity name:</strong> RAVI KUMAR</p>
            <p><strong>Registered Address:</strong> House No. 120 Adarsh colony, Balongi, Punjab, PIN: 160055</p>
            <p><strong>Operational Address:</strong> House No. 120 Adarsh colony, Balongi, Punjab, PIN: 160055</p>
            <p><strong>Telephone No:</strong> <a href="tel:9569456315" className="text-blue-500 hover:text-blue-600">9569456315</a></p>
            <p><strong>E-Mail ID:</strong> <a href="mailto:13ramanmunday@gmail.com" className="text-blue-500 hover:text-blue-600">13ramanmunday@gmail.com</a></p>
          </div>
        </div>

        <div className="mt-8">
          <Link
            to="/"
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Back to Registration
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;