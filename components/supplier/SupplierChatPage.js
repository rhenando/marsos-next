// app/chat/[chatId]/page.jsx
"use client";

import React, { useState, useEffect } from "react";
import {
  doc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  getDoc,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { useAuth } from "@/context/AuthContext";
import { File, Image as ImgIcon, MapPin } from "react-feather";

export default function SupplierChatPage({ params }) {
  const { chatId } = params;
  const { currentUser } = useAuth();

  const [cartItems, setCartItems] = useState([]);
  const [messages, setMessages] = useState([]);
  const [buyerName, setBuyerName] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // fetch user display name helper
  const fetchUserName = async (uid, setter) => {
    try {
      const snap = await getDoc(doc(db, "users", uid));
      setter(snap.exists() ? snap.data().name || "Unknown" : "Unknown");
    } catch {
      setter("Unknown");
    }
  };

  useEffect(() => {
    const chatRef = doc(db, "chats", chatId);
    const unsub = onSnapshot(chatRef, async (snap) => {
      if (!snap.exists()) {
        console.warn("No such chat:", chatId);
        setLoading(false);
        return;
      }
      const data = snap.data();
      setCartItems(data.cartItems || []);
      setMessages(data.messages || []);
      if (data.buyerId) await fetchUserName(data.buyerId, setBuyerName);
      if (data.supplierId)
        await fetchUserName(data.supplierId, setSupplierName);
      setLoading(false);
    });
    return () => unsub();
  }, [chatId]);

  const handleFieldChange = async (itemId, field, value) => {
    const updated = cartItems.map((item) =>
      item.cartId === itemId ? { ...item, [field]: value } : item
    );
    // recalc subtotal
    const it = updated.find((i) => i.cartId === itemId);
    if (it && ["price", "quantity", "shippingCost"].includes(field)) {
      it.subtotal = (it.quantity * it.price + (it.shippingCost || 0)).toFixed(
        2
      );
    }
    setCartItems(updated);

    try {
      await updateDoc(doc(db, "chats", chatId), { cartItems: updated });
      const buyerId = cartItems[0]?.buyerId;
      if (buyerId) {
        await updateDoc(doc(db, "carts", buyerId), { items: updated });
      }
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    const msg = {
      senderId: currentUser.uid,
      senderName: currentUser.displayName || supplierName,
      message: newMessage,
      timestamp: new Date().toISOString(),
    };
    try {
      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion(msg),
      });
      setNewMessage("");
    } catch (err) {
      console.error("Send message failed:", err);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className='container my-4'>
      <h2 className='mb-3'>Manage Buyer Cart</h2>

      <h4>Cart Items</h4>
      <table className='table table-bordered mb-4'>
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Size</th>
            <th>Color</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Shipping</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {cartItems.map((item) => (
            <tr key={item.cartId}>
              <td>
                <img
                  src={item.mainImageUrl || "/placeholder.png"}
                  alt={item.name}
                  style={{ width: 50, height: 50 }}
                />
              </td>
              <td>{item.name}</td>
              <td>{item.size || "–"}</td>
              <td>{item.color || "–"}</td>
              <td>
                <input
                  type='number'
                  min='1'
                  value={item.quantity}
                  onChange={(e) =>
                    handleFieldChange(item.cartId, "quantity", +e.target.value)
                  }
                  className='form-control form-control-sm'
                />
              </td>
              <td>
                <input
                  type='number'
                  value={item.price}
                  onChange={(e) =>
                    handleFieldChange(item.cartId, "price", +e.target.value)
                  }
                  className='form-control form-control-sm'
                />
              </td>
              <td>
                <input
                  type='number'
                  value={item.shippingCost || 0}
                  onChange={(e) =>
                    handleFieldChange(
                      item.cartId,
                      "shippingCost",
                      +e.target.value
                    )
                  }
                  className='form-control form-control-sm'
                />
              </td>
              <td>{item.subtotal || "0.00"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h4>Messages</h4>
      <div
        className='border rounded p-3 mb-3'
        style={{ height: 350, overflowY: "auto", background: "#f9f9f9" }}
      >
        {messages.length === 0 && (
          <p className='text-center text-muted'>No messages yet.</p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`d-flex flex-column mb-3 ${
              m.senderId === currentUser.uid
                ? "align-items-end"
                : "align-items-start"
            }`}
          >
            <small className='text-muted mb-1'>
              {m.senderId === currentUser.uid
                ? "You"
                : m.senderName || buyerName}
            </small>
            <div className='bg-white border rounded px-3 py-2'>
              <div>{m.message}</div>
              <div className='text-end small mt-1'>
                {new Date(m.timestamp).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className='input-group'>
        <input
          type='text'
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className='form-control'
          placeholder='Type message...'
        />
        <button onClick={handleSendMessage} className='btn btn-primary'>
          Send
        </button>
        <div className='input-group-text'>
          <button onClick={() => {}} title='File'>
            <File />
          </button>
          <button onClick={() => {}} title='Image'>
            <ImgIcon />
          </button>
          <button onClick={() => {}} title='Location'>
            <MapPin />
          </button>
        </div>
      </div>
    </div>
  );
}
