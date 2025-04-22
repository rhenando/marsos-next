"use client";

import "../app/globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "../context/CartContext";
import { GlobalLoadingProvider } from "@/context/GlobalLoadingContext";
import GlobalSpinner from "@/components/global/GlobalSpinner";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Header from "../components/header/Header";
import Footer from "../components/Footer";
import I18nProvider from "../providers/i18n-provider";

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <head>
        <script
          src='https://www.google.com/recaptcha/api.js?render=implicit'
          async
          defer
        />
      </head>

      <body>
        <I18nProvider>
          <AuthProvider>
            <CartProvider>
              <GlobalLoadingProvider>
                <GlobalSpinner />
                <Header />

                <main className='min-h-[80vh] lg:pt-[50px]'>{children}</main>

                <Footer />
                <ToastContainer position='top-right' autoClose={3000} />
              </GlobalLoadingProvider>
            </CartProvider>
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
