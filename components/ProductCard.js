"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Eye, Mail, Heart } from "react-feather";
import Currency from "./global/CurrencySymbol";
import { getAuth } from "firebase/auth";

const ProductCard = ({ product }) => {
  const router = useRouter();
  const { t, i18n } = useTranslation();

  const priceRanges = product.priceRanges || [];
  const prices = priceRanges.map((range) => parseFloat(range.price));
  const lowestPrice = prices.length ? Math.min(...prices) : "N/A";
  const highestPrice = prices.length ? Math.max(...prices) : "N/A";
  const minOrder = priceRanges[0]?.minQty || "N/A";
  const mainImage = product.mainImageUrl || "https://via.placeholder.com/300";
  const category = product.category || t("uncategorized");

  const getLocalizedProductName = () => {
    const name = product.productName;
    if (typeof name === "string") return name;
    if (typeof name === "object" && name !== null) {
      return name[i18n.language] || name["en"] || t("hero.unnamed_product");
    }
    return t("hero.unnamed_product");
  };

  const handleContactSupplier = () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      alert("Please log in to contact the supplier");
      return;
    }

    if (!product?.supplierId) {
      alert("Supplier ID is missing.");
      return;
    }

    const chatId = `${currentUser.uid}_${product.supplierId}_${product.id}`;

    router.push(
      `/product-chat/${chatId}?productId=${product.id}&supplierId=${product.supplierId}`
    );
  };

  return (
    <div className='p-2'>
      <div className='relative bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden min-h-[460px]'>
        {/* Wishlist Heart */}
        <div className='absolute top-2 right-2 z-10'>
          <Heart size={18} className='text-red-500' />
        </div>

        {/* Hot Badge */}
        <div className='absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded shadow-sm z-10'>
          Hot
        </div>

        {/* Product Image */}
        <div
          className='relative aspect-[4/3] overflow-hidden cursor-pointer border-b border-gray-200'
          onClick={() => router.push(`/product/${product.id}`)}
        >
          <img
            src={mainImage}
            alt={getLocalizedProductName()}
            className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out'
            loading='lazy'
          />
        </div>

        {/* Product Info */}
        <div className='p-4 flex flex-col justify-between flex-grow'>
          <div>
            <p className='text-sm text-gray-400 mb-1 capitalize'>{category}</p>

            <h3
              className='text-sm font-semibold text-gray-800 hover:text-[#2c6449] cursor-pointer line-clamp-2 capitalize'
              onClick={() => router.push(`/product/${product.id}`)}
            >
              {getLocalizedProductName()}
            </h3>

            <p className='text-xs text-gray-500 mt-1 mb-2'>
              Supplier:{" "}
              <span className='text-[#2c6449] font-medium'>
                {product.supplierName || "Unknown"}
              </span>
            </p>

            {/* Price or Negotiable */}
            {!isNaN(lowestPrice) && !isNaN(highestPrice) && lowestPrice > 0 ? (
              <p className='text-lg font-bold text-[#2c6449] mb-1'>
                <Currency amount={lowestPrice} /> -{" "}
                <Currency amount={highestPrice} />
              </p>
            ) : (
              <p className='text-sm italic text-[#2c6449] mb-1'>
                {t("hero.negotiable") ||
                  "Product Negotiable - Contact Supplier"}
              </p>
            )}

            <p className='text-xs text-gray-500'>
              {t("hero.min_order", { minOrder })}
            </p>
          </div>

          {/* Action Buttons */}
          <div className='mt-2 flex gap-2'>
            <button
              onClick={() => router.push(`/product/${product.id}`)}
              className='w-1/2 h-8 text-xs px-2 py-1 border border-[#2c6449] text-[#2c6449] font-medium rounded hover:bg-[#2c644910] transition flex items-center justify-center gap-1 whitespace-nowrap truncate'
            >
              <Eye size={14} />
              {t("hero.view_details")}
            </button>

            <button
              onClick={handleContactSupplier}
              className='w-1/2 h-8 text-xs px-2 py-1 border border-blue-600 text-blue-600 font-medium rounded hover:bg-blue-50 transition flex items-center justify-center gap-1 whitespace-nowrap truncate'
            >
              <Mail size={14} />
              {t("hero.contact_supplier")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
