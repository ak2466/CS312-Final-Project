import React, { useState } from 'react';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const variants = {
    nav: "bg-white text-black hover:bg-gray-400 px-6 py-2 rounded-md font-medium text-sm transition-colors",
    primary: "bg-red-500 text-white hover:bg-gray-500 px-4 py-2 rounded-md font-medium transition-colors",
    tag: "bg-red-500 text-white text-xs px-4 py-1.5 rounded-md font-medium hover:bg-red-900 cursor-pointer",
    text: "text-grey-700 hover:bg-red-50 active:bg-red-100 font-medium px-3 py-1.5 rounded-md"
  };

  return (
    <button className={`${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;