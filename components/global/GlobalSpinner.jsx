"use client";
import React from "react";
import { useGlobalLoading } from "@/context/GlobalLoadingContext";

const GlobalSpinner = () => {
  const { loading } = useGlobalLoading();

  if (!loading) return null; // 👈 Only render if loading is true

  return (
    <div className='fixed inset-0 z-[9999] flex items-center justify-center bg-white'>
      <div className='w-36 h-36 border-2 border-t-2 border-gray-200 border-t-[#2c6449] rounded-full animate-spin absolute'></div>
      <div className='z-10'>
        <img src='/assets/logo.svg' alt='Logo' className='w-28 h-28' />
      </div>
    </div>
  );
};

export default GlobalSpinner;
