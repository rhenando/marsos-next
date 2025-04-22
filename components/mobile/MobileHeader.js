"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Menu,
  User,
  ShoppingCart,
  MessageSquare,
  MousePointer,
  MapPin,
  Camera,
  Search,
} from "react-feather";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useTranslation } from "react-i18next";
import { db } from "../../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import { Combobox } from "@headlessui/react";

const MobileHeader = ({ onHamburgerClick }) => {
  const router = useRouter();
  const { currentUser, userData, logout } = useAuth();
  const { cartItemCount } = useCart();
  const { t, i18n } = useTranslation();

  const [showUserMenuMobile, setShowUserMenuMobile] = useState(false);
  const [showLanguageMenuMobile, setShowLanguageMenuMobile] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("English");

  const userIconRef = useRef();
  const languageRef = useRef();

  const [query, setQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    document.documentElement.setAttribute(
      "dir",
      i18n.language === "ar" ? "rtl" : "ltr"
    );
  }, [i18n.language]);

  useEffect(() => {
    const fetchProducts = async () => {
      const snapshot = await getDocs(collection(db, "products"));
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().productName || "Unnamed Product",
      }));
      setProducts(items);
    };
    fetchProducts();
  }, []);

  const filteredProducts =
    query === ""
      ? []
      : products.filter((item) =>
          item.name.toLowerCase().includes(query.toLowerCase())
        );

  useEffect(() => {
    if (selectedProduct) {
      router.push(`/product/${selectedProduct.id}`);
    }
  }, [selectedProduct]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (userIconRef.current && !userIconRef.current.contains(event.target)) {
        setShowUserMenuMobile(false);
      }
      if (languageRef.current && !languageRef.current.contains(event.target)) {
        setShowLanguageMenuMobile(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className='lg:hidden sticky top-0 w-full z-50 bg-white shadow-sm'>
      <div className='flex items-center justify-between px-4 py-4 min-h-[70px] relative'>
        <button onClick={onHamburgerClick}>
          <Menu size={24} className='text-[#2c6449]' />
        </button>

        <Link href='/' className='absolute left-1/2 -translate-x-1/2'>
          <img
            src='/logo.png'
            alt='Logo'
            className='h-16 w-auto object-contain'
          />
        </Link>

        <div
          ref={userIconRef}
          className='relative flex items-center gap-1 justify-end'
        >
          {currentUser && userData && (
            <span className='text-sm text-[#2c6449] font-medium'>
              {userData.name?.split(" ")[0]}
            </span>
          )}
          <button
            onClick={() => setShowUserMenuMobile(!showUserMenuMobile)}
            className='text-[#2c6449]'
          >
            <User size={22} />
          </button>

          {showUserMenuMobile && (
            <div className='absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 shadow-lg rounded z-50 text-sm text-gray-700'>
              {currentUser && userData ? (
                <>
                  <button
                    onClick={() => {
                      const { role } = userData;
                      if (role === "buyer") router.push("/buyer-dashboard");
                      else if (role === "supplier")
                        router.push("/supplier-dashboard");
                      else if (role === "admin")
                        router.push("/admin-dashboard");
                      setShowUserMenuMobile(false);
                    }}
                    className='block w-full text-left px-4 py-2 hover:bg-gray-100'
                  >
                    {t("header.myDashboard")}
                  </button>
                  <button
                    onClick={() => {
                      router.push("/orders");
                      setShowUserMenuMobile(false);
                    }}
                    className='block w-full text-left px-4 py-2 hover:bg-gray-100'
                  >
                    {t("header.orderHistory")}
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        await logout();
                        router.push("/user-login");
                        setShowUserMenuMobile(false);
                      } catch (error) {
                        console.error("Logout failed:", error);
                      }
                    }}
                    className='block w-full text-left px-4 py-2 hover:bg-gray-100'
                  >
                    {t("header.logout")}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    router.push("/user-login");
                    setShowUserMenuMobile(false);
                  }}
                  className='block w-full text-left px-4 py-2 hover:bg-gray-100'
                >
                  {t("header.signIn")}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Search Box */}
      <Combobox value={selectedProduct} onChange={setSelectedProduct}>
        <div className='relative mx-4 mb-2'>
          <div className='flex items-center border border-[#2c6449] bg-white rounded-full overflow-hidden'>
            <div className='px-3 text-[#2c6449]'>
              <Camera size={18} />
            </div>
            <Combobox.Input
              className='w-full text-sm text-[#2c6449] placeholder-[#2c6449] outline-none py-2 px-2'
              displayValue={(item) => item?.name || ""}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("header.searchPlaceholder")}
            />
            <button className='bg-[#2c6449] px-4 py-2 rounded-r-full'>
              <Search size={18} className='text-white' />
            </button>
          </div>

          <Combobox.Options className='absolute w-full mt-1 bg-white border border-gray-200 shadow-lg rounded z-50 text-sm text-[#2c6449]'>
            {filteredProducts.length === 0 ? (
              <div className='px-4 py-2 text-gray-400'>No results found</div>
            ) : (
              filteredProducts.map((item) => (
                <Combobox.Option
                  key={item.id}
                  value={item}
                  className={({ active }) =>
                    `px-4 py-2 cursor-pointer ${
                      active ? "bg-[#2c6449] text-white" : ""
                    }`
                  }
                >
                  {item.name}
                </Combobox.Option>
              ))
            )}
          </Combobox.Options>
        </div>
      </Combobox>

      {/* Bottom Navigation */}
      <div className='flex justify-around items-center px-4 py-2 text-xs text-[#2c6449] border-t'>
        <button onClick={() => router.push("/rfq")}>
          <MousePointer size={16} className='mx-auto' />
          <span className='block mt-1'>{t("mobile_header.rfq")}</span>
        </button>

        <Link href='/messages' className='text-center'>
          <MessageSquare size={16} className='mx-auto' />
          <span className='block mt-1'>{t("mobile_header.messages")}</span>
        </Link>

        <Link href='/cart' className='relative text-center'>
          <ShoppingCart size={16} className='mx-auto' />
          {cartItemCount > 0 && (
            <span className='absolute -top-1 -right-3 bg-[#2c6449] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center'>
              {cartItemCount}
            </span>
          )}
          <span className='block mt-1'>{t("mobile_header.cart")}</span>
        </Link>

        <Link href='/basket' className='text-center'>
          <MapPin size={16} className='mx-auto' />
          <span className='block mt-1'>{t("mobile_header.location")}</span>
        </Link>

        <div ref={languageRef} className='relative text-center'>
          <button
            onClick={() => setShowLanguageMenuMobile(!showLanguageMenuMobile)}
            className='flex items-center gap-1 text-[#2c6449]'
          >
            <img
              src={`https://flagcdn.com/h20/${
                selectedLanguage === "English" ? "us" : "sa"
              }.png`}
              alt='flag'
              className='w-5 h-5 rounded-sm object-contain'
            />
            <span className='text-[11px] font-medium'>
              {selectedLanguage === "English" ? "EN" : "العربية"}
            </span>
          </button>

          {showLanguageMenuMobile && (
            <ul className='absolute right-0 top-full mt-2 w-[120px] bg-white border border-gray-200 rounded shadow-md z-50 text-sm text-[#2c6449]'>
              <li
                className='px-4 py-2 hover:bg-[#2c6449] hover:text-white cursor-pointer'
                onClick={() => {
                  setSelectedLanguage("English");
                  i18n.changeLanguage("en");
                  document.documentElement.dir = "ltr";
                  setShowLanguageMenuMobile(false);
                }}
              >
                EN
              </li>
              <li
                className='px-4 py-2 hover:bg-[#2c6449] hover:text-white cursor-pointer'
                onClick={() => {
                  setSelectedLanguage("العربية");
                  i18n.changeLanguage("ar");
                  document.documentElement.dir = "rtl";
                  setShowLanguageMenuMobile(false);
                }}
              >
                العربية
              </li>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileHeader;
