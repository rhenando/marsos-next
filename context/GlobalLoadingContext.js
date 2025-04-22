"use client";
import React, { createContext, useContext, useState } from "react";

const GlobalLoadingContext = createContext();

export const useGlobalLoading = () => useContext(GlobalLoadingContext);

export const GlobalLoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);

  return (
    <GlobalLoadingContext.Provider value={{ loading, setLoading }}>
      {children}
    </GlobalLoadingContext.Provider>
  );
};
