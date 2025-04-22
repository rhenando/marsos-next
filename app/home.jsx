"use client";

import React, { useEffect, useState } from "react";
import HeroSection from "@/components/HeroSection";
import MobileHeroSection from "@/components/mobile/MobileHeroSection";
import TrendingProductsSection from "@/components/TrendingProductsSection";
import FeaturedCategorySection from "@/components/FeaturedCategorySection";
import { db } from "../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import { useTranslation } from "react-i18next";

export default function HomeClient() {
  const [groupedCategories, setGroupedCategories] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const fallbackImage = "/images/fallback.png";

  const { t } = useTranslation();

  useEffect(() => {
    setIsMobile(window.innerWidth < 1024);

    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchAndGroup = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const allProducts = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const categoryMap = {};
        allProducts.forEach((prod) => {
          const category = prod.category || "Uncategorized";
          if (!categoryMap[category]) {
            categoryMap[category] = [];
          }
          categoryMap[category].push({
            name: prod.productName || "Unnamed Product",
            img: prod.mainImageUrl || fallbackImage,
          });
        });

        const groupedArray = Object.entries(categoryMap).map(
          ([categoryName, products]) => ({
            categoryName,
            bannerImage: products[0]?.img || fallbackImage,
            products: products.slice(0, 8),
          })
        );

        setGroupedCategories(groupedArray);
      } catch (error) {
        console.error("Error fetching product categories:", error);
      }
    };

    fetchAndGroup();
  }, []);

  return (
    <div>
      {isMobile ? <MobileHeroSection /> : <HeroSection />}
      <TrendingProductsSection />
      {groupedCategories.length > 0 && (
        <FeaturedCategorySection
          categoryName={groupedCategories[0].categoryName}
          bannerImage={groupedCategories[0].bannerImage}
          products={groupedCategories[0].products}
        />
      )}
    </div>
  );
}
