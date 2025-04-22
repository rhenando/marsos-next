"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { collection, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase/config";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";

export default function SupplierOrdersPage() {
  const { currentUser } = useAuth();
  const { addNotification, removeNotification, seenNotifications } =
    useNotification();
  const router = useRouter();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredOrderId, setHoveredOrderId] = useState(null);

  useEffect(() => {
    async function fetchSupplierOrders() {
      if (!currentUser?.uid) return;

      const ordersRef = collection(db, "orders");
      const snapshot = await getDocs(ordersRef);
      const filtered = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const supplierInItems = data.items?.some(
          (item) => item.supplierId === currentUser.uid
        );
        if (!supplierInItems) return;

        const createdAt = data.createdAt?.seconds
          ? new Date(data.createdAt.seconds * 1000)
          : null;

        filtered.push({
          id: docSnap.id,
          sadadNumber: data.sadadNumber || "N/A",
          billNumber: data.billNumber || "N/A",
          totalAmount: data.totalAmount || "0.00",
          orderStatus: data.orderStatus || "Pending",
          createdAt: createdAt ? createdAt.toLocaleString() : "Unknown Date",
          buyerId: data.items?.[0]?.buyerId || null,
        });
      });

      setOrders(filtered);
      setLoading(false);
    }

    fetchSupplierOrders();
  }, [currentUser?.uid]);

  useEffect(() => {
    if (!currentUser?.uid) return;

    const paymentsRef = collection(db, "payments");
    const unsubscribe = onSnapshot(paymentsRef, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added" || change.type === "modified") {
          const paymentData = change.doc.data();
          const billNumber = change.doc.id;
          const { paymentStatus, paymentAmount } = paymentData;

          setOrders((prev) =>
            prev.map((o) =>
              String(o.billNumber) === billNumber
                ? { ...o, orderStatus: paymentStatus }
                : o
            )
          );

          if (
            paymentStatus === "APPROVED" &&
            !seenNotifications.has(billNumber)
          ) {
            addNotification({
              id: billNumber,
              message: `Payment for Order #${billNumber} of ${paymentAmount} SR is Approved! 🎉`,
            });
          }
        }
      });
    });

    return () => unsubscribe();
  }, [currentUser?.uid, addNotification, seenNotifications]);

  if (loading) {
    return <p className='text-center mt-4'>Loading orders...</p>;
  } else if (orders.length === 0) {
    return <p className='text-center mt-4'>No orders found.</p>;
  }

  return (
    <div className='container mt-4'>
      <h2>Supplier Orders</h2>

      {/* Desktop Table */}
      <div className='d-none d-sm-block table-responsive'>
        <table className='table table-bordered'>
          <thead>
            <tr>
              <th>Sadad Number</th>
              <th>Bill Number</th>
              <th>Net Amount</th>
              <th>Service Fee (0%)</th>
              <th>Billed Amount</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const net = parseFloat(order.totalAmount);
              const fee = 0;
              const billed = net - fee;

              return (
                <tr
                  key={order.id}
                  onClick={() => removeNotification(order.billNumber)}
                >
                  <td>{order.sadadNumber}</td>
                  <td>{order.billNumber}</td>
                  <td>{net.toFixed(2)} SR</td>
                  <td>{fee.toFixed(2)} SR</td>
                  <td>{billed.toFixed(2)} SR</td>
                  <td
                    className={
                      order.orderStatus === "APPROVED"
                        ? "text-success"
                        : "text-warning"
                    }
                  >
                    {order.orderStatus}
                  </td>
                  <td>{order.createdAt}</td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    <Link
                      href={
                        order.orderStatus === "APPROVED"
                          ? `/review-invoice/${order.billNumber}`
                          : "#"
                      }
                      className={`btn btn-sm me-2 fw-semibold ${
                        order.orderStatus !== "APPROVED" &&
                        "btn-secondary disabled"
                      }`}
                      style={{
                        backgroundColor:
                          order.orderStatus === "APPROVED"
                            ? "#2c6449"
                            : undefined,
                        color:
                          order.orderStatus === "APPROVED" ? "#fff" : undefined,
                        cursor:
                          order.orderStatus === "APPROVED"
                            ? "pointer"
                            : "not-allowed",
                      }}
                    >
                      Review Invoice
                    </Link>

                    <button
                      className='btn btn-sm fw-semibold'
                      onClick={() => {
                        const chatId = `order_${order.buyerId}_${currentUser.uid}`;
                        const extra = {
                          billNumber: order.billNumber,
                          totalAmount: order.totalAmount,
                          orderStatus: order.orderStatus,
                        };
                        const encoded = encodeURIComponent(
                          JSON.stringify(extra)
                        );
                        router.push(
                          `/order-chat/${chatId}?extraData=${encoded}`
                        );
                      }}
                      onMouseEnter={() => setHoveredOrderId(order.id)}
                      onMouseLeave={() => setHoveredOrderId(null)}
                      style={{
                        backgroundColor:
                          hoveredOrderId === order.id
                            ? "#2c6449"
                            : "transparent",
                        color: hoveredOrderId === order.id ? "#fff" : "#2c6449",
                        border: "1px solid #2c6449",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                    >
                      Contact Buyer
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className='d-block d-sm-none'>
        {orders.map((order) => {
          const net = parseFloat(order.totalAmount);
          const fee = 0;
          const billed = net - fee;

          return (
            <div
              className='card mb-3 shadow-sm'
              key={order.id}
              onClick={() => removeNotification(order.billNumber)}
            >
              <div className='card-body p-3'>
                <h6 className='fw-semibold small mb-2'>
                  Invoice:{" "}
                  <span className='text-muted'>{order.billNumber}</span>
                </h6>
                <p className='mb-1 small'>
                  <strong className='text-muted'>SADAD:</strong>{" "}
                  {order.sadadNumber}
                </p>
                <p className='mb-1 small'>
                  <strong className='text-muted'>Net:</strong> {net.toFixed(2)}{" "}
                  SR
                </p>
                <p className='mb-1 small'>
                  <strong className='text-muted'>Fee (0%):</strong>{" "}
                  {fee.toFixed(2)} SR
                </p>
                <p className='mb-1 small'>
                  <strong className='text-muted'>Billed:</strong>{" "}
                  {billed.toFixed(2)} SR
                </p>
                <p className='mb-1 small'>
                  <strong className='text-muted'>Status:</strong>
                  {` `}
                  <span
                    className={
                      order.orderStatus === "APPROVED"
                        ? "text-success"
                        : "text-warning"
                    }
                  >
                    {order.orderStatus}
                  </span>
                </p>
                <p className='mb-3 small'>
                  <strong className='text-muted'>Date:</strong>{" "}
                  {order.createdAt}
                </p>

                <Link
                  href={
                    order.orderStatus === "APPROVED"
                      ? `/review-invoice/${order.billNumber}`
                      : "#"
                  }
                  className={`btn btn-sm fw-semibold w-100 mb-2 ${
                    order.orderStatus !== "APPROVED" && "btn-secondary disabled"
                  }`}
                  style={{
                    backgroundColor:
                      order.orderStatus === "APPROVED" ? "#2c6449" : undefined,
                    color:
                      order.orderStatus === "APPROVED" ? "#fff" : undefined,
                    cursor:
                      order.orderStatus === "APPROVED"
                        ? "pointer"
                        : "not-allowed",
                  }}
                  onClick={(e) => {
                    if (order.orderStatus !== "APPROVED") e.preventDefault();
                  }}
                >
                  Review Invoice
                </Link>

                <button
                  className='btn btn-sm fw-semibold w-100 small'
                  onClick={() => {
                    const chatId = `order_${order.buyerId}_${currentUser.uid}`;
                    const extra = {
                      billNumber: order.billNumber,
                      totalAmount: order.totalAmount,
                      orderStatus: order.orderStatus,
                    };
                    const encoded = encodeURIComponent(JSON.stringify(extra));
                    router.push(`/order-chat/${chatId}?extraData=${encoded}`);
                  }}
                  onMouseEnter={() => setHoveredOrderId(order.id)}
                  onMouseLeave={() => setHoveredOrderId(null)}
                  style={{
                    backgroundColor:
                      hoveredOrderId === order.id ? "#2c6449" : "transparent",
                    color: hoveredOrderId === order.id ? "#fff" : "#2c6449",
                    border: "1px solid #2c6449",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  Contact Buyer
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
