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
    <div className='py-3 px-4 w-full'>
      {/* Header */}
      <div className='mb-2'>
        <h4 className='text-green-700 font-bold'>{t("products.title")}</h4>
        <p className='text-gray-500 text-sm'>{t("products.subtitle")}</p>
      </div>

      {/* Tabs */}
      <div className='mb-2 flex items-center'>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setSelectedTab(cat);
              setCurrentPage(1);
            }}
            className={`mr-2 text-sm ${
              selectedTab === cat ? "text-green-700 font-bold" : "text-gray-500"
            }`}
          >
            {cat}
            <span className='bg-gray-100 text-gray-800 ml-1 px-1.5 py-0.5 rounded text-xs'>
              {cat === "All"
                ? productData.length
                : productData.filter((p) => p.category === cat).length}
            </span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className='flex items-center mb-2 text-sm'>
        <select className='border border-gray-300 rounded px-2 py-1 mr-2 max-w-[150px]'>
          <option value='manual'>{t("products.location")}</option>
          <option value='price'>{t("products.price")}</option>
          <option value='quantity'>{t("products.quantity")}</option>
        </select>
        <button className='border border-blue-500 text-blue-500 rounded px-2 py-1 mr-2'>
          {t("products.filter")}
        </button>
        <input
          type='text'
          className='border border-gray-300 rounded px-2 py-1 mr-2 max-w-[300px]'
          placeholder={t("products.searchPlaceholder")}
        />
        <button className='bg-blue-500 text-white rounded px-2 py-1'>
          {t("products.search")}
        </button>
      </div>

      {/* Actions */}
      <div className='flex items-center justify-between mb-2 text-sm'>
        <button className='border border-blue-500 text-blue-500 rounded px-2 py-1'>
          {t("products.export")}
        </button>
        <div>
          <button className='border border-gray-400 text-gray-600 rounded px-2 py-1 mr-2'>
            {t("products.options")}
          </button>
          <button
            className='bg-green-700 text-white rounded px-2 py-1'
            onClick={() => router.push("/supplier-add-products")}
          >
            {t("products.addNew")}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className='overflow-x-auto'>
        <table className='w-full table-auto text-sm'>
          <thead className='bg-gray-100'>
            <tr>
              <th className='p-2'>
                <input type='checkbox' />
              </th>
              <th className='p-2'>{t("products.product")}</th>
              <th className='p-2'>{t("products.name")}</th>
              <th className='p-2'>{t("products.supplierName")}</th>
              <th className='p-2'>{t("products.location")}</th>
              <th className='p-2'>{t("products.qtyPricing")}</th>
              <th className='p-2'>{t("products.size")}</th>
              <th className='p-2'>{t("products.color")}</th>
              <th className='p-2'>{t("products.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((p) => (
              <tr key={p.id} className='border-b hover:bg-gray-50'>
                <td className='p-2'>
                  <input type='checkbox' />
                </td>
                <td className='p-2'>
                  <img
                    src={p.mainImageUrl || "https://via.placeholder.com/50"}
                    alt={
                      typeof p.productName === "object"
                        ? p.productName[currentLang]
                        : p.productName
                    }
                    className='rounded w-10 h-10 object-cover'
                  />
                </td>
                <td className='p-2'>
                  {typeof p.productName === "object"
                    ? p.productName[currentLang] || p.productName.en
                    : p.productName}
                </td>
                <td className='p-2'>{p.supplierName || "N/A"}</td>
                <td className='p-2'>{p.mainLocation || "N/A"}</td>
                <td className='p-2'>
                  {p.priceRanges?.length ? (
                    <ul className='list-none'>
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
                <td className='p-2'>
                  {p.sizes?.length ? p.sizes.join(", ") : "N/A"}
                </td>
                <td className='p-2'>
                  {p.colors?.length ? p.colors.join(", ") : "N/A"}
                </td>
                <td className='p-2 space-x-2'>
                  <button
                    className='text-blue-500'
                    onClick={() =>
                      router.push(`/supplier-edit-products/${p.id}`)
                    }
                  >
                    {t("products.edit")}
                  </button>
                  <button
                    className='text-red-500'
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
      <div className='flex justify-between items-center mt-3'>
        <button
          className='border border-gray-400 text-gray-600 rounded px-2 py-1 text-sm'
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
        >
          {t("products.previous")}
        </button>
        <span className='text-gray-500 text-sm'>
          {t("products.page")} {currentPage} {t("products.of")} {totalPages}
        </span>
        <button
          className='border border-gray-400 text-gray-600 rounded px-2 py-1 text-sm'
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          {t("products.next")}
        </button>
      </div>
    </div>
  );
}
