"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { signInWithCustomToken, onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "@/firebase/config";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Loader } from "react-feather";

export default function UserLogin() {
  const router = useRouter();

  const [step, setStep] = useState("phone");
  const [countryCode, setCountryCode] = useState("+966");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const fullPhone = `${countryCode}${phone}`;
  const isPhoneValid = phone.length >= 9 && !phone.startsWith("0");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          localStorage.setItem("userRole", data.role || "buyer");
          toast.info("Already logged in — redirecting...");
          router.push(data.role === "buyer" ? "/" : "/supplier-dashboard");
        } else {
          router.push("/register");
        }
      }
    });
    return unsubscribe;
  }, [router]);

  const handleSendOtp = async () => {
    if (!isPhoneValid) {
      return toast.warning("Enter a valid phone number");
    }

    setLoading(true);
    try {
      const res = await axios.post(
        "https://firebase-auth-azs4.onrender.com/send-otp",
        {
          phone: fullPhone,
        }
      );

      if (res.data.success) {
        toast.success("OTP sent successfully!");
        setStep("otp");
      } else {
        toast.error("Failed to send OTP");
      }
    } catch (err) {
      console.error("OTP send error:", err);
      toast.error("Could not send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 4) {
      return toast.warning("Enter the OTP");
    }

    setLoading(true);
    try {
      const res = await await axios.post(
        "https://firebase-auth-azs4.onrender.com/verify-otp",
        {
          phone: fullPhone,
          code: otp,
        }
      );

      const token = res.data.token;
      const result = await signInWithCustomToken(auth, token);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        localStorage.setItem("userRole", data.role || "buyer");
        toast.success("Login successful!");
        router.push(data.role === "buyer" ? "/" : "/supplier-dashboard");
      } else {
        router.push("/register");
      }
    } catch (err) {
      console.error("OTP verification error:", err);
      toast.error("Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex min-h-screen'>
      <ToastContainer position='top-right' autoClose={3000} />

      {/* LEFT PANEL */}
      <div className='hidden lg:flex w-1/2 bg-gradient-to-br from-[#2c6449] to-green-400 text-white flex-col items-center justify-center p-10'>
        <img src='/logo-marsos.svg' alt='Marsos Logo' className='w-28 mb-4' />
        <h1 className='text-4xl font-bold mb-4'>Welcome to Marsos</h1>
        <p className='text-lg max-w-sm text-center opacity-80'>
          Trust made visible. Trade made simple.
        </p>
      </div>

      {/* RIGHT PANEL */}
      <div className='flex w-full lg:w-1/2 justify-center items-center bg-gray-50'>
        <div className='w-full max-w-md bg-white p-8 rounded-lg shadow-lg'>
          <h2 className='text-2xl font-semibold mb-2 text-center text-[#2c6449]'>
            {step === "phone" ? "Login or Register" : "Verify OTP"}
          </h2>
          <p className='text-sm text-gray-600 text-center mb-6'>
            {step === "phone"
              ? "Secure sign-in with your phone number"
              : "Enter the OTP sent to your phone"}
          </p>

          {step === "phone" && (
            <>
              <div className='flex mb-4'>
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className='border p-2 rounded-l w-24'
                >
                  <option value='+966'>+966</option>
                  <option value='+971'>+971</option>
                  <option value='+974'>+974</option>
                  <option value='+63'>+63</option>
                </select>
                <input
                  type='tel'
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  placeholder='Enter phone number'
                  className='flex-1 border p-2 rounded-r focus:outline-none'
                />
              </div>

              <button
                onClick={handleSendOtp}
                disabled={loading || !isPhoneValid}
                className='w-full bg-[#2c6449] text-white py-2 rounded font-semibold flex items-center justify-center gap-2 disabled:opacity-60'
              >
                {loading ? (
                  <>
                    <Loader className='animate-spin' /> Sending OTP...
                  </>
                ) : (
                  "Send OTP"
                )}
              </button>
            </>
          )}

          {step === "otp" && (
            <>
              <input
                type='text'
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder='Enter OTP'
                className='w-full border p-2 mb-4 rounded'
              />

              <button
                onClick={handleVerifyOtp}
                disabled={loading}
                className='w-full bg-[#2c6449] text-white py-2 rounded font-semibold flex items-center justify-center gap-2 disabled:opacity-60'
              >
                {loading ? (
                  <>
                    <Loader className='animate-spin' /> Verifying...
                  </>
                ) : (
                  "Verify and Login"
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
