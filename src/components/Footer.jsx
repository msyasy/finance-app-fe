import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-4 mt-auto">
      <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
        Made with ❤️ by{' '}
        <a 
          href="https://github.com/msyasy" 
          target="_blank" 
          rel="noopener noreferrer"
          className="font-medium text-blue-600 hover:underline"
        >
          @msyasy
        </a>
      </div>
    </footer>
  );
};

export default Footer;