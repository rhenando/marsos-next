"use client";

import React, { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { useAuth } from "@/context/AuthContext";

export default function ManageTerms() {
  const { userData } = useAuth();
  const [terms, setTerms] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Fetch existing terms & conditions for this supplier
  useEffect(() => {
    if (!userData?.uid) return;

    const fetchTerms = async () => {
      try {
        const ref = doc(db, "terms_and_conditions", userData.uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setTerms(snap.data().content || "");
        } else {
          setTerms("");
        }
      } catch (err) {
        console.error("Error fetching terms:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTerms();
  }, [userData]);

  // Save updated terms & conditions
  const handleSave = async () => {
    if (!userData?.uid) return;

    try {
      const ref = doc(db, "terms_and_conditions", userData.uid);
      await setDoc(ref, {
        content: terms,
        supplierId: userData.uid,
        supplierName: userData.name || "",
      });
      setMessage("Terms and Conditions saved successfully.");
    } catch (err) {
      console.error("Error saving terms:", err);
      setMessage("Error saving terms.");
    }
  };

  if (loading) {
    return <p>Loading terms &amp; conditions…</p>;
  }

  return (
    <div className='space-y-4'>
      <h4 className='text-xl font-semibold'>Manage Terms &amp; Conditions</h4>
      <textarea
        className='w-full border rounded p-2 h-48'
        value={terms}
        onChange={(e) => setTerms(e.target.value)}
      />
      <button
        onClick={handleSave}
        className='px-4 py-2 bg-[#2c6449] text-white rounded hover:bg-[#24523b]'
      >
        Save Terms and Conditions
      </button>
      {message && <p className='mt-2 text-sm'>{message}</p>}
    </div>
  );
}
