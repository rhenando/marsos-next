"use client";

import "../app/globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "../context/CartContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Header from "../components/header/Header";
import Footer from "../components/Footer";
import I18nProvider from "../providers/i18n-provider";

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      {/* HEAD: inject reCAPTCHA loader here */}
      <head>
        <script
          src='https://www.google.com/recaptcha/api.js?render=implicit'
          async
          defer
        />
      </head>

      {/* BODY */}
      <body>
        <I18nProvider>
          <AuthProvider>
            <CartProvider>
              <Header />

              {/* Main container */}
              <main className='min-h-screen lg:pt-[50px]'>{children}</main>

              <Footer />
              <ToastContainer position='top-right' autoClose={3000} />
            </CartProvider>
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
