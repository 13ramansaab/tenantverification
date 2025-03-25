import React from 'react';

interface SuccessPageProps {
  onBack: () => void;
}

const SuccessPage: React.FC<SuccessPageProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow p-8 text-center">
        <div className="mb-6">
          <svg
            className="mx-auto h-16 w-16 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Registration Successful!
        </h1>
        
        <p className="text-lg text-gray-600 mb-8">
          Your details have been submitted successfully for verification.
          We will process your application and get back to you soon.
        </p>

        <button
          onClick={onBack}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
        >
          Back to Registration
        </button>
      </div>
    </div>
  );
};

export default SuccessPage;