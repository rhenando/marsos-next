"use client";

import React, { useEffect, useState } from "react";
import { List } from "react-feather";
import { db } from "../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import RfqModal from "../pages/RfqPage";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import firstBanner from "../public/assets/banner.webp";
import { useTranslation } from "react-i18next";

function HeroSection() {
  const { i18n } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [randomProducts, setRandomProducts] = useState([]);
  const [showRFQModal, setShowRFQModal] = useState(false);

  useEffect(() => {
    const fetchRandomProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const allProducts = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const shuffled = allProducts.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 3);
        setRandomProducts(selected);
      } catch (err) {
        console.error("Failed to fetch random products:", err);
      }
    };

    fetchRandomProducts();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      const productsSnapshot = await getDocs(collection(db, "products"));
      const categorySet = new Set();

      productsSnapshot.forEach((doc) => {
        const product = doc.data();
        if (product.category) {
          categorySet.add(product.category);
        }
      });

      setCategories(Array.from(categorySet));
    };

    fetchCategories();
  }, []);

  // ✅ Helper to safely get localized product name
  const getLocalizedProductName = (product) => {
    const name = product.productName;

    if (typeof name === "string") return name;
    if (typeof name === "object" && name !== null) {
      return name[i18n.language] || name["en"] || "Unnamed Product";
    }

    return "Unnamed Product";
  };

  const banners = [
    {
      title:
        "Effortless Shopping for the Saudi Products, Right at Your Fingertips",
      description:
        "We’re here to make your importing experience as comfortable and seamless as possible. Discover a platform that unites the products from across the Kingdom of Saudi Arabia—all in one place.\n\nFrom manufactures to your door, we bring together a diverse range of services with a user-friendly technology and convenient payment options, to have a seamless purchasing experience.",
      buttonText: "View More",
      backgroundImage: firstBanner,
    },
    {
      title: "Explore Verified Suppliers",
      description: "Global Connections at Your Fingertips",
      buttonText: "Start Exploring",
      backgroundImage: "/images/suppliers-banner.jpg",
    },
    {
      title: "Your Gateway to Smart Manufacturing",
      description: "Discover the Latest Innovations",
      buttonText: "Join Now",
      backgroundImage: "/images/manufacturing-banner.jpg",
    },
  ];

  return (
    <section
      className='w-full bg-white flex justify-center flex-col items-center'
      style={{ height: "calc(90vh - 104px)" }}
    >
      {/* Main Top Row */}
      <div className='w-[90%] flex h-[75%]'>
        {/* Left Sidebar */}
        <div className='w-1/5 bg-white p-4 border-r'>
          <h2 className='font-semibold mb-4 text-base flex items-center gap-2 text-[#2c6449]'>
            <List size={18} className='mt-[2px]' />
            <span className='leading-none'>Categories</span>
          </h2>
          <ul className='space-y-2 text-base text-gray-700'>
            {categories.map((category) => (
              <li
                key={category}
                className='hover:text-[#2c6449] cursor-pointer'
              >
                {category}
              </li>
            ))}
          </ul>
        </div>

        {/* Center Banner */}
        <div className='w-3/5 relative'>
          <Swiper
            modules={[Autoplay, Pagination]}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            loop={true}
            className='h-full w-full'
          >
            {banners.map((banner, index) => (
              <SwiperSlide key={index}>
                <div
                  className='h-full w-full relative'
                  style={{
                    backgroundImage: `url(${banner.backgroundImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  {/* ✅ GREEN overlay with 40% opacity */}
                  <div
                    className='absolute inset-0'
                    style={{ backgroundColor: "rgba(44, 100, 73, 0.8)" }}
                  ></div>

                  {/* Content on top of overlay */}
                  <div className='relative z-10 flex flex-col justify-center items-center text-white text-center h-full px-8'>
                    <h1 className='text-3xl font-bold mb-4 max-w-2xl leading-snug'>
                      {banner.title}
                    </h1>
                    <p className='mb-6 text-base whitespace-pre-line max-w-2xl leading-relaxed'>
                      {banner.description}
                    </p>
                    <button className='bg-white text-[#2c6449] px-6 py-2 rounded-full text-sm font-semibold'>
                      {banner.buttonText}
                    </button>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Right Recommendations */}
        <div className='w-1/5 bg-white p-4 border-l'>
          <h2 className='font-semibold mb-4'>You May Like</h2>
          <ul className='space-y-4 text-sm'>
            {randomProducts.map((product) => (
              <li key={product.id}>
                <div className='flex items-start gap-2'>
                  {/* Product Image */}
                  <div className='w-12 h-12 bg-gray-200 rounded-sm overflow-hidden'>
                    {product.mainImageUrl ? (
                      <img
                        src={product.mainImageUrl}
                        alt={getLocalizedProductName(product)}
                        className='w-full h-full object-cover'
                      />
                    ) : (
                      <div className='w-full h-full bg-gray-300'></div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div>
                    <p className='font-medium'>
                      {getLocalizedProductName(product)}
                    </p>
                    <p className='text-gray-500 text-xs'>123,000+ Products</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <button
            onClick={() => setShowRFQModal(true)}
            className='mt-6 w-full border border-[#2c6449] text-[#2c6449] text-sm py-2 rounded hover:bg-[#2c6449] hover:text-white transition'
          >
            Request RFQ Now
          </button>
        </div>
      </div>

      {/* Bottom Cards */}
      <div className='w-[90%] grid grid-cols-4 gap-4 mt-4 h-[25%]'>
        {[
          { title: "Buyer's Choice" },
          { title: "Secured Transaction Service" },
          { title: "Leading Factory" },
          { title: "Selected Supplier" },
        ].map((card) => (
          <div
            key={card.title}
            className='bg-white shadow-sm rounded p-4 text-sm text-[#2c6449] hover:shadow-md cursor-pointer transition'
          >
            {card.title}
          </div>
        ))}
      </div>
      <RfqModal show={showRFQModal} onClose={() => setShowRFQModal(false)} />
    </section>
  );
}

export default HeroSection;
