import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t mt-8 py-4">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex justify-center space-x-6">
          <Link to="/contact" className="text-blue-500 hover:text-blue-600">
            Contact Us
          </Link>
          <Link to="/terms" className="text-blue-500 hover:text-blue-600">
            Terms & Conditions
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;