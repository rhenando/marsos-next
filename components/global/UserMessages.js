"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/firebase/config";
import {
  collection,
  query,
  where,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import Link from "next/link";

const UserMessages = () => {
  const { currentUser } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All");

  useEffect(() => {
    if (!currentUser) return;

    let unsubscribes = [];
    (async () => {
      // Fetch user role
      const userSnap = await getDoc(doc(db, "users", currentUser.uid));
      if (!userSnap.exists()) {
        setLoading(false);
        return;
      }
      const role = userSnap.data().role || "buyer";
      setUserRole(role);

      // Define all chat sources
      const chatSources = [
        {
          coll: "rfqChats",
          label: "RFQ Inquiry",
          path: (id) => `/rfq-chat/${id}`,
          key: role === "supplier" ? "supplierId" : "buyerId",
        },
        {
          coll: "productChats",
          label: "Product Inquiry",
          path: (id) => `/product-chat/${id}`,
          key: role === "supplier" ? "supplierId" : "buyerId",
        },
        {
          coll: "cartChats",
          label: "Cart Inquiry",
          path: (id) => `/cart-chat/${id}`,
          key: role === "supplier" ? "supplierId" : "buyerId",
        },
        {
          coll: "orderChats",
          label: "Order Inquiry",
          path: async (id, data) => {
            const bill = data.billNumber;
            let total = null,
              status = null;
            if (bill) {
              const o = await getDoc(doc(db, "orders", bill));
              if (o.exists()) {
                total = o.data().totalAmount;
                status = o.data().orderStatus;
              }
            }
            const extra = encodeURIComponent(
              JSON.stringify({
                billNumber: bill,
                totalAmount: total,
                orderStatus: status,
              })
            );
            return `/order-chat/${id}?extraData=${extra}`;
          },
          key: role === "supplier" ? "supplierId" : "buyerId",
        },
      ];

      // Subscribe to each collection
      unsubscribes = chatSources.map((src) => {
        const q = query(
          collection(db, src.coll),
          where(src.key, "==", currentUser.uid)
        );
        return onSnapshot(q, async (snap) => {
          const updated = await Promise.all(
            snap.docs.map(async (ds) => {
              const data = ds.data();
              // find other party name
              const otherId =
                role === "supplier" ? data.buyerId : data.supplierId;
              let otherName = "Unknown";
              if (otherId) {
                const u = await getDoc(doc(db, "users", otherId));
                if (u.exists()) otherName = u.data().name || otherName;
              }
              // build path
              const path =
                typeof src.path === "function"
                  ? await src.path(ds.id, data)
                  : src.path;
              const readBy = data.readBy || [];
              return {
                id: ds.id,
                name: otherName,
                concernType: src.label,
                chatPath: path,
                lastUpdated: data.lastUpdated?.toDate() || new Date(0),
                unread: !readBy.includes(currentUser.uid),
                coll: src.coll,
              };
            })
          );
          setChats((prev) =>
            [
              ...prev.filter((c) => c.concernType !== src.label),
              ...updated,
            ].sort((a, b) => b.lastUpdated - a.lastUpdated)
          );
          setLoading(false);
        });
      })();
    })();

    return () => unsubscribes.forEach((u) => u());
  }, [currentUser]);

  const getBadge = (type) => {
    const base =
      "inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full";
    switch (type) {
      case "RFQ Inquiry":
        return (
          <span className={`${base} bg-yellow-100 text-yellow-800`}>
            📄 RFQ
          </span>
        );
      case "Product Inquiry":
        return (
          <span className={`${base} bg-blue-100 text-blue-800`}>
            📦 Product
          </span>
        );
      case "Cart Inquiry":
        return (
          <span className={`${base} bg-purple-100 text-purple-800`}>
            🛒 Cart
          </span>
        );
      case "Order Inquiry":
        return (
          <span className={`${base} bg-green-100 text-green-800`}>
            🧾 Order
          </span>
        );
      default:
        return (
          <span className={`${base} bg-gray-200 text-gray-700`}>❔ Other</span>
        );
    }
  };

  const markRead = async (id, coll) => {
    await updateDoc(doc(db, coll, id), {
      readBy: arrayUnion(currentUser.uid),
    });
    setChats((c) => c.map((x) => (x.id === id ? { ...x, unread: false } : x)));
  };

  const filtered = chats.filter((c) => {
    const matchName = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = selectedType === "All" || c.concernType === selectedType;
    return matchName && matchType;
  });

  if (loading || !userRole) {
    return <p className='text-center py-8'>Loading messages…</p>;
  }

  return (
    <div className='p-4 max-w-6xl mx-auto'>
      <h2 className='text-xl font-semibold mb-4'>Your Messages</h2>

      {/* Filters */}
      <div className='flex flex-wrap gap-4 mb-4'>
        <input
          type='text'
          placeholder='Search by name…'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className='border px-3 py-1 rounded w-48 text-sm'
        />
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className='border px-3 py-1 rounded text-sm'
        >
          <option>All</option>
          <option>RFQ Inquiry</option>
          <option>Product Inquiry</option>
          <option>Cart Inquiry</option>
          <option>Order Inquiry</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className='text-gray-500 text-center'>No messages found.</p>
      ) : (
        <div className='overflow-x-auto'>
          <table className='min-w-full text-sm text-left border'>
            <thead className='bg-[#2c6449] text-white'>
              <tr>
                <th className='px-4 py-2'>
                  {userRole === "supplier" ? "Buyer" : "Supplier"}
                </th>
                <th className='px-4 py-2'>Type</th>
                <th className='px-4 py-2'>Last Updated</th>
                <th className='px-4 py-2'>Action</th>
              </tr>
            </thead>
            <tbody className='divide-y'>
              {filtered.map((chat) => (
                <tr key={chat.id} className={chat.unread ? "bg-yellow-50" : ""}>
                  <td className='px-4 py-2'>{chat.name}</td>
                  <td className='px-4 py-2'>{getBadge(chat.concernType)}</td>
                  <td className='px-4 py-2 whitespace-nowrap'>
                    {chat.lastUpdated.toLocaleString()}
                  </td>
                  <td className='px-4 py-2 flex gap-2'>
                    <Link
                      href={chat.chatPath}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-white bg-[#2c6449] px-3 py-1 rounded text-xs hover:bg-green-700'
                    >
                      Open
                    </Link>
                    {chat.unread && (
                      <button
                        onClick={() => markRead(chat.id, chat.coll)}
                        className='text-xs text-gray-700 bg-yellow-200 px-2 py-1 rounded hover:bg-yellow-300'
                      >
                        Mark as Read
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserMessages;
