"use client";

import React from "react";
import Link from "next/link"; // ✅ Replaces react-router-dom
import { List } from "react-feather";
import { useTranslation } from "react-i18next";

const NavLinks = ({ show }) => {
  const { t } = useTranslation();

  return (
    <div
      className={`hidden lg:block absolute top-full left-0 w-full z-40 transition-opacity duration-300 ease-in-out ${
        show
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      } bg-white px-6 py-2 text-base text-[#2c6449] border-t border-b border-gray-200`}
    >
      <div className='flex items-center justify-between'>
        {/* LEFT: Categories + Navigation */}
        <div className='flex items-center space-x-6 rtl:space-x-reverse'>
          <Link
            href='/categories'
            className='flex items-center gap-1 font-semibold hover:text-[#1b4533] transition-all'
          >
            <List size={20} className='text-[#2c6449]' />
            {t("header.allCategories")}
          </Link>

          <div className='h-5 w-px bg-[#2c6449]'></div>

          <Link href='/videos' className='hover:text-[#1b4533] transition-all'>
            {t("header.featured")}
          </Link>
          <Link href='/top' className='hover:text-[#1b4533] transition-all'>
            {t("header.trending")}
          </Link>
          <Link href='/secured' className='hover:text-[#1b4533] transition-all'>
            {t("header.secured")}
          </Link>
        </div>

        {/* RIGHT: Support & Actions */}
        <div className='flex items-center space-x-6 rtl:space-x-reverse'>
          <Link href='/videos' className='hover:text-[#1b4533] transition-all'>
            {t("header.help")}
          </Link>
          <Link href='/top' className='hover:text-[#1b4533] transition-all'>
            {t("header.app")}
          </Link>
          <Link href='/secured' className='hover:text-[#1b4533] transition-all'>
            {t("header.buyerCentral")}
          </Link>
          <Link href='/secured' className='hover:text-[#1b4533] transition-all'>
            {t("header.becomeSupplier")}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NavLinks;
