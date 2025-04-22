"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import {
  Instagram,
  Linkedin,
  Twitter,
  Globe,
  Facebook,
  Youtube,
} from "react-feather";

// ✅ Static assets (Make sure they are inside /public or /app/assets)

import saudiLogo from "../public/assets/saudi_business_logo.svg";

import tamaralogo from "../public/assets/tamara.png";
import tabbylogo from "../public/assets/tabby.png";
import visalogo from "../public/assets/visa.png";
import madalogo from "../public/assets/mada.png";
import applepaylogo from "../public/assets/applepay.png";
import mastercardlogo from "../public/assets/mastercard.png";

const Footer = () => {
  useEffect(() => {
    const scriptId = "gogetssl-script";

    const sealExists = document.querySelector("#gogetssl-animated-seal img");

    if (!sealExists && !document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src =
        "https://gogetssl-cdn.s3.eu-central-1.amazonaws.com/site-seals/gogetssl-seal.js";
      script.async = true;
      document.body.appendChild(script);
    }

    // ✅ No cleanup needed – we don't want to remove the seal script between renders
  }, []);

  return (
    <footer className='bg-brandGreen text-white text-sm bg-[#2c6449]'>
      <div className='max-w-screen-xl mx-auto px-4 py-10'>
        <div className='grid grid-cols-1 md:grid-cols-5 gap-6'>
          {/* Discover */}
          <div>
            <h3 className='font-semibold text-white mb-3'>
              Discover Products & Suppliers
            </h3>
            <ul className='space-y-2'>
              <li>Industry Sites</li>
              <li>Regional Channels</li>
              <li>Special Channel</li>
              <li>Custom Products</li>
              <li>Video Show</li>
              <li>Secured Trading Service</li>
              <li>Business Guide</li>
            </ul>
          </div>

          {/* Featured Services */}
          <div>
            <h3 className='font-semibold text-white mb-3'>Featured Service</h3>
            <ul className='space-y-2'>
              <li>Star Buyer</li>
              <li>Trade Resources</li>
              <li>Logistics Partners</li>
            </ul>
          </div>

          {/* About + Help */}
          <div>
            <h3 className='font-semibold text-white mb-3'>About Us</h3>
            <ul className='space-y-2 mb-4'>
              <li>About Marsos</li>
              <li>Site Map</li>
              <li>Trademark</li>
              <li>Friendly Links</li>
            </ul>
            <h3 className='font-semibold text-white mb-3'>Help</h3>
            <ul className='space-y-2'>
              <li>FAQ</li>
              <li>Contact Us</li>
              <li>Join Membership</li>
              <li>Submit a Complaint</li>
            </ul>
          </div>

          {/* Language */}
          <div>
            <h3 className='font-semibold text-white mb-3'>Language Options</h3>
            <ul className='grid grid-cols-2 gap-2'>
              <li>English</li>
              <li>العربية</li>
            </ul>
          </div>

          {/* Logos */}
          <div className='flex flex-col items-center gap-4'>
            <Image
              src='/assets/saudi_business_logo.svg'
              alt='Logo'
              width={400}
              height={100}
            />

            <div className='flex justify-center items-center gap-3 flex-wrap'>
              <Image src={mastercardlogo} alt='MasterCard' height={16} />
              <Image src={visalogo} alt='Visa' height={14} />
              <Image src={applepaylogo} alt='Apple Pay' height={14} />
              <Image src={madalogo} alt='Mada' height={14} />
              <Image src={tamaralogo} alt='Tamara' height={14} />
              <Image src={tabbylogo} alt='Tabby' height={15} />
            </div>

            <div className='text-md-end text-center mt-3'>
              <a
                href='https://www.gogetssl.com'
                rel='nofollow'
                title='GoGetSSL Site Seal Logo'
              >
                <div
                  id='gogetssl-animated-seal'
                  style={{
                    width: "180px",
                    height: "58px",
                    display: "inline-block",
                  }}
                ></div>
              </a>
            </div>
          </div>
        </div>

        {/* App Store + Socials */}
        {/* <div className='mt-10 flex flex-col md:flex-row justify-between items-center border-t pt-6'>
          <div className='flex gap-4 mb-4 md:mb-0'>
            <Image
              src='https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg'
              alt='App Store'
              width={150}
              height={50}
            />
            <Image
              src='https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg'
              alt='Google Play'
              width={150}
              height={50}
            />
          </div>

          <div className='flex gap-4 text-gray-300'>
            <Globe size={18} />
            <Instagram size={18} />
            <Linkedin size={18} />
            <Twitter size={18} />
            <Facebook size={18} />
            <Youtube size={18} />
          </div>
        </div> */}

        {/* Bottom Text */}
        <div className='text-center text-xs text-gray-300 mt-10'>
          &copy; 2025 Marsos Technologies. All rights reserved. | Privacy Policy
        </div>
      </div>
    </footer>
  );
};

export default Footer;
