import { Link } from 'react-router-dom';

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Terms & Conditions</h1>
        <p className="text-gray-600 mb-4">Last updated on 24-03-2025 17:49:13</p>
        
        <div className="prose prose-sm max-w-none">
          <p className="mb-4">
            These Terms and Conditions, along with privacy policy or other terms ("Terms") constitute a binding
            agreement by and between RAVI KUMAR, ("Website Owner" or "we" or "us" or "our") and you
            ("you" or "your") and relate to your use of our website, goods (as applicable) or services (as applicable)
            (collectively, "Services").
          </p>

          <p className="mb-4">
            By using our website and availing the Services, you agree that you have read and accepted these Terms
            (including the Privacy Policy). We reserve the right to modify these Terms at any time and without
            assigning any reason. It is your responsibility to periodically review these Terms to stay informed of
            updates.
          </p>

          <p className="mb-4">
            The use of this website or availing of our Services is subject to the following terms of use:
          </p>

          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>
              To access and use the Services, you agree to provide true, accurate and complete information to us
              during and after registration, and you shall be responsible for all acts done through the use of your
              registered account.
            </li>
            <li>
              Neither we nor any third parties provide any warranty or guarantee as to the accuracy, timeliness,
              performance, completeness or suitability of the information and materials offered on this website
              or through the Services, for any specific purpose.
            </li>
            <li>
              Your use of our Services and the website is solely at your own risk and discretion. You are
              required to independently assess and ensure that the Services meet your requirements.
            </li>
            <li>
              The contents of the Website and the Services are proprietary to Us and you will not have any
              authority to claim any intellectual property rights, title, or interest in its contents.
            </li>
            <li>
              You acknowledge that unauthorized use of the Website or the Services may lead to action against
              you as per these Terms or applicable laws.
            </li>
            <li>
              You agree to pay us the charges associated with availing the Services.
            </li>
            <li>
              You agree not to use the website and/or Services for any purpose that is unlawful, illegal or
              forbidden by these Terms, or Indian or local laws that might apply to you.
            </li>
          </ul>

          <p className="mb-4">
            You shall be entitled to claim a refund of the payment made by you in case we are not able to
            provide the Service. The timelines for such return and refund will be according to the specific
            Service you have availed or within the time period provided in our policies (as applicable).
          </p>

          <p className="mb-4">
            These Terms and any dispute or claim relating to it, or its enforceability, shall be governed by and
            construed in accordance with the laws of India.
          </p>

          <p className="mb-4">
            All disputes arising out of or in connection with these Terms shall be subject to the exclusive
            jurisdiction of the courts in Balongi, Punjab.
          </p>
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

export default TermsAndConditions;