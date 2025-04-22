"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CreatableSelect from "react-select/creatable";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, getStorage } from "firebase/storage";
import { db, storage } from "@/firebase/config";
import { useAuth } from "@/context/AuthContext";
import { translateText } from "@/utils/translate";
import { showSuccess, showError, showWarning } from "@/utils/toastUtils";
import LoadingSpinner from "@/components/global/LoadingSpinner";
import {
  defaultLocationOptions,
  defaultSizeOptions,
  defaultColorOptions,
  defaultQtyOptions,
} from "@/constants/productOptions";
import { useTranslation } from "react-i18next";

export default function SupplierAddProduct() {
  const router = useRouter();
  const { currentUser, userData } = useAuth();
  const { t, i18n } = useTranslation();

  const [categories, setCategories] = useState({});
  const [translatedCategories, setTranslatedCategories] = useState({});
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");

  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [mainImage, setMainImage] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([null]);

  const [priceRanges, setPriceRanges] = useState([
    {
      minQty: "",
      maxQty: "",
      price: "",
      locations: [{ location: "", locationPrice: "" }],
    },
  ]);

  const [locationOptions, setLocationOptions] = useState(
    defaultLocationOptions
  );
  const [sizeOptions, setSizeOptions] = useState(defaultSizeOptions);
  const [colorOptions, setColorOptions] = useState(defaultColorOptions);
  const [qtyOptions, setQtyOptions] = useState(defaultQtyOptions);

  const [mainLocation, setMainLocation] = useState(null);
  const [productNameEn, setProductNameEn] = useState("");
  const [productNameAr, setProductNameAr] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Build categories & subcategories from existing products
  useEffect(() => {
    async function fetchCats() {
      try {
        const snap = await getDocs(collection(db, "products"));
        const map = {};
        snap.forEach((doc) => {
          const { category = "Uncategorized", subCategory = "Uncategorized" } =
            doc.data();
          map[category] ||= new Set();
          map[category].add(subCategory);
        });
        const formatted = {};
        for (const cat in map) formatted[cat] = Array.from(map[cat]);
        setCategories(formatted);

        // on Arabic, translate
        if (i18n.language === "ar") {
          const keys = Object.keys(formatted);
          const translated = {};
          await Promise.all(
            keys.map(async (key) => {
              translated[key] = await translateText(key, "ar");
            })
          );
          setTranslatedCategories(translated);
        }
      } catch (err) {
        console.error("Error loading categories:", err);
      }
    }
    fetchCats();
  }, [i18n.language]);

  const generateFileName = (file, idx) =>
    `${Date.now()}${idx != null ? "_" + idx : ""}_${file.name}`;

  // Notification helper
  const notify = (title, text) => {
    if (/error/i.test(title)) showError(text);
    else if (/warning/i.test(title)) showWarning(text);
    else showSuccess(text);
  };

  const handleCreateOption = (value, opts, setOpts) => {
    if (opts.some((o) => o.value.toLowerCase() === value.toLowerCase()))
      return notify("Warning", `${value} already exists.`);
    const obj = { value, label: value };
    setOpts([...opts, obj]);
    return obj;
  };

  // Add/remove helpers omitted for brevity...

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !productNameEn ||
      !productNameAr ||
      !descriptionEn ||
      !descriptionAr ||
      !category ||
      !subCategory ||
      sizes.length === 0 ||
      colors.length === 0 ||
      !mainImage ||
      !mainLocation ||
      priceRanges.length === 0
    ) {
      return notify("Validation Error", "Please fill all required fields.");
    }

    setLoading(true);
    try {
      // Upload main image
      const storageRef = ref(storage, `images/${generateFileName(mainImage)}`);
      await uploadBytes(storageRef, mainImage);
      const mainUrl = await getDownloadURL(storageRef);

      // Upload additional images
      const addUrls = [];
      for (let idx = 0; idx < additionalImages.length; idx++) {
        const file = additionalImages[idx];
        if (!file) continue;
        const r = ref(storage, `images/${generateFileName(file, idx)}`);
        await uploadBytes(r, file);
        addUrls.push(await getDownloadURL(r));
      }

      // Prepare doc
      await addDoc(collection(db, "products"), {
        productName: { en: productNameEn, ar: productNameAr },
        description: { en: descriptionEn, ar: descriptionAr },
        category,
        subCategory,
        sizes: sizes.map((s) => s.value),
        colors: colors.map((c) => c.value),
        mainImageUrl: mainUrl,
        additionalImageUrls: addUrls,
        mainLocation: mainLocation.value,
        priceRanges: priceRanges.map((r) => ({
          ...r,
          locations: r.locations.map((l) => ({
            location: l.location,
            locationPrice: parseFloat(l.locationPrice || 0),
          })),
        })),
        createdAt: new Date(),
        supplierId: currentUser.uid,
        supplierName: userData.name,
        supplierNumber: userData.contact,
      });

      notify("Success", "Product uploaded successfully.");
      router.push("/supplier-dashboard");
    } catch (err) {
      console.error(err);
      notify("Error", "Failed to upload product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='px-6 py-8 max-w-5xl mx-auto'>
      <h1 className='text-2xl font-bold mb-6'>
        {t("admin_product_add.title")}
      </h1>
      {loading && <LoadingSpinner />}
      <form onSubmit={handleSubmit} className='space-y-6'>
        {/* Names & descriptions */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <input
            type='text'
            placeholder={t("admin_product_add.name_en")}
            value={productNameEn}
            onChange={(e) => setProductNameEn(e.target.value)}
            className='w-full border rounded p-2'
            required
          />
          <input
            type='text'
            dir='rtl'
            placeholder={t("admin_product_add.name_ar")}
            value={productNameAr}
            onChange={(e) => setProductNameAr(e.target.value)}
            className='w-full border rounded p-2'
            required
          />
          <input
            type='text'
            placeholder={t("admin_product_add.desc_en")}
            value={descriptionEn}
            onChange={(e) => setDescriptionEn(e.target.value)}
            className='w-full border rounded p-2'
            required
          />
          <input
            type='text'
            dir='rtl'
            placeholder={t("admin_product_add.desc_ar")}
            value={descriptionAr}
            onChange={(e) => setDescriptionAr(e.target.value)}
            className='w-full border rounded p-2'
            required
          />
        </div>

        {/* Category selectors */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <CreatableSelect
            options={Object.keys(categories).map((cat) => ({
              value: cat,
              label: translatedCategories[cat] || cat,
            }))}
            value={
              category
                ? {
                    value: category,
                    label: translatedCategories[category] || category,
                  }
                : null
            }
            onChange={(opt) => {
              setCategory(opt?.value || "");
              setSubCategory("");
            }}
            onCreateOption={async (val) => {
              setCategories((prev) => ({ ...prev, [val]: ["Uncategorized"] }));
              const tr = await translateText(val, "ar");
              setTranslatedCategories((prev) => ({ ...prev, [val]: tr }));
              setCategory(val);
              setSubCategory("Uncategorized");
            }}
            placeholder={t("admin_product_add.category")}
          />

          <CreatableSelect
            options={(categories[category] || []).map((sub) => ({
              value: sub,
              label: sub,
            }))}
            value={
              subCategory ? { value: subCategory, label: subCategory } : null
            }
            onChange={(opt) => setSubCategory(opt?.value || "")}
            onCreateOption={(val) => {
              setCategories((prev) => ({
                ...prev,
                [category]: [...(prev[category] || []), val],
              }));
              setSubCategory(val);
            }}
            isDisabled={!category}
            placeholder={t("admin_product_add.subcategory")}
          />
        </div>

        {/* Sizes, Colors, Location */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <CreatableSelect
            isMulti
            options={sizeOptions}
            value={sizes}
            onChange={setSizes}
            onCreateOption={(val) => {
              const o = handleCreateOption(val, sizeOptions, setSizeOptions);
              if (o) setSizes([...sizes, o]);
            }}
            placeholder={t("admin_product_add.sizes")}
          />
          <CreatableSelect
            isMulti
            options={colorOptions}
            value={colors}
            onChange={setColors}
            onCreateOption={(val) => {
              const o = handleCreateOption(val, colorOptions, setColorOptions);
              if (o) setColors([...colors, o]);
            }}
            placeholder={t("admin_product_add.colors")}
          />
          <CreatableSelect
            options={locationOptions}
            value={mainLocation}
            onChange={setMainLocation}
            onCreateOption={(val) => {
              const o = handleCreateOption(
                val,
                locationOptions,
                setLocationOptions
              );
              if (o) setMainLocation(o);
            }}
            placeholder={t("admin_product_add.main_location")}
          />
        </div>

        {/* Image uploads */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <input
            type='file'
            accept='image/*'
            onChange={(e) => setMainImage(e.target.files[0])}
            required
          />
          {additionalImages.map((_, i) => (
            <div key={i} className='flex items-center gap-2'>
              <input
                type='file'
                accept='image/*'
                onChange={(e) => {
                  const arr = [...additionalImages];
                  arr[i] = e.target.files[0];
                  setAdditionalImages(arr);
                }}
              />
              <button
                type='button'
                onClick={() => {
                  const arr = additionalImages.slice();
                  arr.splice(i, 1);
                  setAdditionalImages(arr);
                }}
              >
                −
              </button>
            </div>
          ))}
          <button
            type='button'
            onClick={() => setAdditionalImages([...additionalImages, null])}
          >
            + Add Image
          </button>
        </div>

        {/* Price tiers */}
        {priceRanges.map((tier, idx) => (
          <div key={idx} className='border p-4 rounded mb-4'>
            <div className='flex justify-between'>
              <span>Tier #{idx + 1}</span>
              <button
                type='button'
                onClick={() => {
                  const arr = priceRanges.slice();
                  arr.splice(idx, 1);
                  setPriceRanges(arr);
                }}
              >
                Remove
              </button>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-4'>
              <CreatableSelect
                options={qtyOptions}
                value={
                  tier.minQty
                    ? { value: tier.minQty, label: tier.minQty }
                    : null
                }
                onChange={(opt) => {
                  const arr = priceRanges.slice();
                  arr[idx].minQty = opt?.value || "";
                  setPriceRanges(arr);
                }}
                onCreateOption={(val) => {
                  const o = handleCreateOption(val, qtyOptions, setQtyOptions);
                  if (o) {
                    const arr = priceRanges.slice();
                    arr[idx].minQty = o.value;
                    setPriceRanges(arr);
                  }
                }}
                placeholder='Min Qty'
              />
              <CreatableSelect
                options={qtyOptions}
                value={
                  tier.maxQty
                    ? { value: tier.maxQty, label: tier.maxQty }
                    : null
                }
                onChange={(opt) => {
                  const arr = priceRanges.slice();
                  arr[idx].maxQty = opt?.value || "";
                  setPriceRanges(arr);
                }}
                onCreateOption={(val) => {
                  const o = handleCreateOption(val, qtyOptions, setQtyOptions);
                  if (o) {
                    const arr = priceRanges.slice();
                    arr[idx].maxQty = o.value;
                    setPriceRanges(arr);
                  }
                }}
                placeholder='Max Qty'
              />
              <CreatableSelect
                options={[...qtyOptions]}
                value={
                  tier.price ? { value: tier.price, label: tier.price } : null
                }
                onChange={(opt) => {
                  const arr = priceRanges.slice();
                  arr[idx].price = opt?.value || "";
                  setPriceRanges(arr);
                }}
                onCreateOption={(val) => {
                  if (!/^[0-9]*\.?[0-9]+$/.test(val)) {
                    return notify("Validation Error", "Price must be numeric");
                  }
                  const arr = priceRanges.slice();
                  arr[idx].price = val;
                  setPriceRanges(arr);
                }}
                placeholder='Price'
              />
            </div>

            {/* Delivery locations */}
            {tier.locations.map((loc, li) => (
              <div key={li} className='flex gap-2 mt-2'>
                <CreatableSelect
                  options={locationOptions}
                  value={
                    loc.location
                      ? { value: loc.location, label: loc.location }
                      : null
                  }
                  onChange={(opt) => {
                    const arr = priceRanges.slice();
                    arr[idx].locations[li].location = opt?.value || "";
                    setPriceRanges(arr);
                  }}
                  onCreateOption={(val) => {
                    const o = handleCreateOption(
                      val,
                      locationOptions,
                      setLocationOptions
                    );
                    if (o) {
                      const arr = priceRanges.slice();
                      arr[idx].locations[li].location = o.value;
                      setPriceRanges(arr);
                    }
                  }}
                  placeholder='Location'
                />
                <CreatableSelect
                  options={[...qtyOptions]}
                  value={
                    loc.locationPrice
                      ? { value: loc.locationPrice, label: loc.locationPrice }
                      : null
                  }
                  onChange={(opt) => {
                    const arr = priceRanges.slice();
                    arr[idx].locations[li].locationPrice = opt?.value || "";
                    setPriceRanges(arr);
                  }}
                  onCreateOption={(val) => {
                    if (!/^[0-9]*\.?[0-9]+$/.test(val)) {
                      return notify("Validation Error", "Must be numeric");
                    }
                    const arr = priceRanges.slice();
                    arr[idx].locations[li].locationPrice = val;
                    setPriceRanges(arr);
                  }}
                  placeholder='Delivery Price'
                />
                <button
                  type='button'
                  onClick={() => {
                    const arr = priceRanges.slice();
                    arr[idx].locations.splice(li, 1);
                    setPriceRanges(arr);
                  }}
                >
                  −
                </button>
              </div>
            ))}
            <button
              type='button'
              className='mt-2 text-blue-600'
              onClick={() => {
                const arr = priceRanges.slice();
                arr[idx].locations.push({ location: "", locationPrice: "" });
                setPriceRanges(arr);
              }}
            >
              + Add Delivery Location
            </button>
          </div>
        ))}

        <button
          type='button'
          onClick={() =>
            setPriceRanges([
              ...priceRanges,
              {
                minQty: "",
                maxQty: "",
                price: "",
                locations: [{ location: "", locationPrice: "" }],
              },
            ])
          }
          className='px-4 py-2 bg-gray-200 rounded'
        >
          + Add Price Tier
        </button>

        {/* Submit */}
        <div className='mt-6'>
          <button
            type='submit'
            disabled={loading}
            className='px-6 py-2 bg-[#2c6449] text-white rounded hover:bg-[#24523b] disabled:opacity-50'
          >
            {loading ? "Uploading…" : t("admin_product_add.upload")}
          </button>
        </div>
      </form>
    </div>
  );
}
