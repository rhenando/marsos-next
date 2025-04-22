"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";

export default function Products() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || "en";

  const { loading, role, userData } = useAuth();
  const [productData, setProductData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedTab, setSelectedTab] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const router = useRouter();

  // fetch only when supplier & logged in
  useEffect(() => {
    async function fetchProducts() {
      const supplierId = userData?.uid || userData?.supplierId;
      if (!supplierId || role !== "supplier") return;
      try {
        const productsRef = collection(db, "products");
        const supplierQuery = query(
          productsRef,
          where("supplierId", "==", supplierId)
        );
        const snapshot = await getDocs(supplierQuery);
        const products = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setProductData(products);

        const uniqueCats = [
          "All",
          ...new Set(products.map((p) => p.category || "Uncategorized")),
        ];
        setCategories(uniqueCats);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    }

    if (!loading && userData && role === "supplier") {
      fetchProducts();
    }
  }, [loading, userData, role]);

  const handleDelete = async (productId) => {
    if (!confirm(t("products.confirmDelete"))) return;
    try {
      await deleteDoc(doc(db, "products", productId));
      setProductData((prev) => prev.filter((p) => p.id !== productId));
      alert(t("products.deleteSuccess"));
    } catch (err) {
      console.error("Error deleting product:", err);
      alert(t("products.deleteFail"));
    }
  };

  const filtered =
    selectedTab === "All"
      ? productData
      : productData.filter((p) => p.category === selectedTab);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const pageItems = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading || !userData) {
    return <div>{t("products.loading") || "Loading..."}</div>;
  }
  if (role !== "supplier") {
    return <div>{t("products.notAuthorized")}</div>;
  }

  return (
    <div className='container-fluid py-3'>
      {/* Header */}
      <div className='mb-2'>
        <h4 className='text-success fw-bold'>{t("products.title")}</h4>
        <p className='text-muted small'>{t("products.subtitle")}</p>
      </div>

      {/* Tabs */}
      <div className='mb-2 d-flex align-items-center'>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setSelectedTab(cat);
              setCurrentPage(1);
            }}
            className={`btn btn-link text-decoration-none me-2 small ${
              selectedTab === cat ? "text-success fw-bold" : "text-muted"
            }`}
          >
            {cat}{" "}
            <span className='badge bg-light text-dark ms-1 small'>
              {cat === "All"
                ? productData.length
                : productData.filter((p) => p.category === cat).length}
            </span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className='d-flex align-items-center mb-2 small'>
        <select
          className='form-select form-select-sm me-2'
          style={{ maxWidth: 150 }}
        >
          <option value='manual'>{t("products.location")}</option>
          <option value='price'>{t("products.price")}</option>
          <option value='quantity'>{t("products.quantity")}</option>
        </select>
        <button className='btn btn-outline-primary btn-sm me-2'>
          {t("products.filter")}
        </button>
        <input
          type='text'
          className='form-control form-control-sm me-2'
          placeholder={t("products.searchPlaceholder")}
          style={{ maxWidth: 300 }}
        />
        <button className='btn btn-primary btn-sm'>
          {t("products.search")}
        </button>
      </div>

      {/* Actions */}
      <div className='d-flex align-items-center justify-content-between mb-2 small'>
        <button className='btn btn-outline-primary btn-sm'>
          {t("products.export")}
        </button>
        <div>
          <button className='btn btn-outline-secondary btn-sm me-2'>
            {t("products.options")}
          </button>
          <button
            className='btn btn-success btn-sm'
            onClick={() => router.push("/supplier-add-products")}
          >
            {t("products.addNew")}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className='table-responsive'>
        <table className='table table-striped table-hover table-sm'>
          <thead className='table-light small'>
            <tr>
              <th>
                <input type='checkbox' />
              </th>
              <th>{t("products.product")}</th>
              <th>{t("products.name")}</th>
              <th>{t("products.supplierName")}</th>
              <th>{t("products.location")}</th>
              <th>{t("products.qtyPricing")}</th>
              <th>{t("products.size")}</th>
              <th>{t("products.color")}</th>
              <th>{t("products.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((p) => (
              <tr key={p.id}>
                <td>
                  <input type='checkbox' />
                </td>
                <td>
                  <img
                    src={p.mainImageUrl || "https://via.placeholder.com/50"}
                    alt={
                      typeof p.productName === "object"
                        ? p.productName[currentLang]
                        : p.productName
                    }
                    className='img-fluid rounded'
                    style={{ width: 40, height: 40 }}
                  />
                </td>
                <td className='small'>
                  {typeof p.productName === "object"
                    ? p.productName[currentLang] || p.productName.en
                    : p.productName}
                </td>
                <td className='small'>{p.supplierName || "N/A"}</td>
                <td className='small'>{p.mainLocation || "N/A"}</td>
                <td className='small'>
                  {p.priceRanges?.length ? (
                    <ul className='mb-0 ps-0'>
                      {p.priceRanges.map((r, i) => (
                        <li key={i}>
                          {t("products.min")}: {r.minQty}, {t("products.max")}:{" "}
                          {r.maxQty}, {t("products.price")}: SAR {r.price}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    "N/A"
                  )}
                </td>
                <td className='small'>
                  {p.sizes?.length ? p.sizes.join(", ") : "N/A"}
                </td>
                <td className='small'>
                  {p.colors?.length ? p.colors.join(", ") : "N/A"}
                </td>
                <td>
                  <button
                    className='text-primary border-0 bg-transparent p-0 me-2'
                    style={{ fontSize: "0.85rem" }}
                    onClick={() =>
                      router.push(`/supplier-edit-products/${p.id}`)
                    }
                  >
                    {t("products.edit")}
                  </button>
                  <button
                    className='text-danger border-0 bg-transparent p-0'
                    style={{ fontSize: "0.85rem" }}
                    onClick={() => handleDelete(p.id)}
                  >
                    {t("products.remove")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className='d-flex justify-content-between align-items-center mt-3'>
        <button
          className='btn btn-outline-secondary btn-sm'
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
        >
          {t("products.previous")}
        </button>
        <span className='text-muted small'>
          {t("products.page")} {currentPage} {t("products.of")} {totalPages}
        </span>
        <button
          className='btn btn-outline-secondary btn-sm'
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          {t("products.next")}
        </button>
      </div>
    </div>
  );
}
