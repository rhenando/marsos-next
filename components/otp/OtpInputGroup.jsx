"use client";

import React from "react";

const OtpInputGroup = ({ onChange }) => {
  const handleChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Allow only numbers
    if (value.length <= 6) {
      onChange(value);
    }
  };

  return (
    <input
      type='text'
      inputMode='numeric'
      maxLength='6'
      pattern='[0-9]*'
      onChange={handleChange}
      placeholder='Enter 6-digit OTP'
      className='w-full px-4 py-2 border border-[#2c6449] rounded-md text-center tracking-widest text-xl focus:outline-none focus:ring-2 focus:ring-[#2c6449]'
    />
  );
};

export default OtpInputGroup;
