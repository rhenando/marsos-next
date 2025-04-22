"use client";

import React, { useState, useEffect } from "react";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, db } from "@/firebase/config";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  showSuccess,
  showError,
  showWarning,
  showInfo,
} from "@/utils/toastUtils";
import OtpInputGroup from "@/components/otp/OtpInputGroup";
import { Lock, Loader } from "react-feather";

export default function UserLogin() {
  const [countryCode, setCountryCode] = useState("+966");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("enter-phone"); // or "enter-otp"
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const router = useRouter();

  // Keep user out of login if already authenticated
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const q = query(collection(db, "users"), where("uid", "==", user.uid));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const data = snap.docs[0].data();
          localStorage.setItem("userRole", data.role || "buyer");
          showInfo("Already logged in—redirecting…");
          router.push(data.role === "buyer" ? "/" : "/supplier-dashboard");
        } else {
          router.push("/register");
        }
      }
    });
    return unsubscribe;
  }, [router]);

  // Initialize the invisible reCAPTCHA once on the client
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth, // ← auth first
        "recaptcha-container", // ← container ID second
        {
          size: "invisible",
          callback: () => {
            showInfo("reCAPTCHA verified");
          },
        }
      );
      window.recaptchaVerifier
        .render()
        .catch((e) => console.error("reCAPTCHA render failed", e));
    }
  }, []);

  // Validate phone input
  const handlePhoneChange = (e) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
    if (digits.startsWith("0")) showWarning("Phone cannot start with 0");
    setPhone(digits);
    setIsPhoneValid(digits.length >= 9);
  };

  // Send the OTP
  const sendOtp = async () => {
    if (!isPhoneValid) {
      showWarning("Enter a valid phone number");
      return;
    }
    setLoading(true);
    try {
      const full = `${countryCode}${phone}`;
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        full,
        window.recaptchaVerifier
      );
      window.confirmationResult = confirmationResult;
      showSuccess("OTP sent!");
      setStep("enter-otp");
    } catch (err) {
      console.error(err);
      showError("Failed to send SMS—check your test numbers or reCAPTCHA");
    } finally {
      setLoading(false);
    }
  };

  // Verify the OTP
  const verifyOtp = async () => {
    if (!otp) {
      showWarning("Enter the OTP");
      return;
    }
    setLoading(true);
    try {
      const result = await window.confirmationResult.confirm(otp);
      const user = result.user;
      const full = `${countryCode}${phone}`;
      let q = query(collection(db, "users"), where("uid", "==", user.uid));
      let snap = await getDocs(q);
      if (snap.empty) {
        q = query(collection(db, "users"), where("phone", "==", full));
        snap = await getDocs(q);
      }
      if (!snap.empty) {
        const data = snap.docs[0].data();
        localStorage.setItem("userRole", data.role || "buyer");
        showSuccess("Login successful!");
        router.push(data.role === "buyer" ? "/" : "/supplier-dashboard");
      } else {
        router.push("/register");
      }
    } catch (err) {
      console.error(err);
      showError("Invalid OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex min-h-screen'>
      <ToastContainer position='top-right' autoClose={3000} />
      {/* Invisible reCAPTCHA mounts here */}
      <div id='recaptcha-container' />

      {/* Left panel on large screens */}
      <div className='hidden lg:flex w-1/2 bg-[#2c6449] text-white items-center justify-center p-10'>
        <h1 className='text-4xl font-bold'>Welcome to Marsos</h1>
      </div>

      {/* Right/login panel */}
      <div className='flex w-full lg:w-1/2 items-center justify-center bg-gray-50 p-8'>
        <div className='w-full max-w-md bg-white p-6 rounded shadow'>
          {step === "enter-phone" ? (
            <>
              <h2 className='text-2xl font-semibold mb-6 text-center'>
                Phone Login
              </h2>
              <div className='flex mb-4'>
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className='border p-2 rounded-l'
                >
                  <option value='+966'>+966</option>
                  <option value='+971'>+971</option>
                  <option value='+974'>+974</option>
                </select>
                <input
                  type='tel'
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder='Phone number'
                  className='flex-1 border p-2 rounded-r focus:outline-none'
                />
              </div>
              <button
                onClick={sendOtp}
                disabled={!isPhoneValid || loading}
                className='w-full bg-[#2c6449] text-white py-2 rounded flex items-center justify-center gap-2 disabled:opacity-50'
              >
                {loading ? (
                  <>
                    <Loader className='animate-spin' /> Sending…
                  </>
                ) : (
                  "Send OTP"
                )}
              </button>
            </>
          ) : (
            <>
              <h2 className='text-2xl font-semibold mb-6 text-center'>
                Enter OTP
              </h2>
              <OtpInputGroup onChange={(v) => setOtp(v)} />
              <button
                onClick={verifyOtp}
                disabled={loading}
                className='w-full bg-[#2c6449] text-white py-2 rounded mt-4 flex items-center justify-center gap-2 disabled:opacity-50'
              >
                {loading ? (
                  <>
                    <Loader className='animate-spin' /> Verifying…
                  </>
                ) : (
                  "Verify OTP"
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
