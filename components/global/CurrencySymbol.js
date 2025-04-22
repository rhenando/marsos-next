"use client";

import React from "react";

const Currency = ({ amount, className = "", iconClass = "" }) => (
  <span className='inline-flex items-center gap-1'>
    <img
      src='/assets/sar_symbol.svg' // ✅ MUST be from /public
      alt='SAR'
      className={`w-4 h-4 ${iconClass}`}
    />
    <span className={className}>{parseFloat(amount).toFixed(2)}</span>
  </span>
);

export default Currency;
