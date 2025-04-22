"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

import React, { useState } from "react";
import CreatableSelect from "react-select/creatable";
import { toast } from "react-toastify";
import { showError } from "@/utils/toastUtils";

import {
  shortQtyOptions,
  defaultLocationOptions,
  defaultSizeOptions,
  defaultColorOptions,
} from "@/constants/productOptions";

export default function SupplierAddProduct() {
  const { currentUser, userData, loading } = useAuth(); // assuming you provide this
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!currentUser) {
        router.push("/user-login");
      } else if (userData?.role !== "supplier") {
        router.push("/not-authorized");
      }
    }
  }, [currentUser, userData, loading]);

  const [additionalImages, setAdditionalImages] = useState([null]);
  const [priceTiers, setPriceTiers] = useState([
    {
      minQty: "",
      maxQty: "",
      price: "",
      locations: [{ location: "", price: "" }],
    },
  ]);

  const [productNameEn, setProductNameEn] = useState("");
  const [productNameAr, setProductNameAr] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [category, setCategory] = useState(null);
  const [subcategory, setSubcategory] = useState(null);
  const [mainLocation, setMainLocation] = useState(null);
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [mainImage, setMainImage] = useState(null);

  const selectStyle = {
    control: (base) => ({
      ...base,
      minHeight: "36px",
      fontSize: "0.875rem",
      backgroundColor: "#f9fafb",
      borderColor: "#d1d5db",
      paddingLeft: "0.25rem",
    }),
    indicatorsContainer: (base) => ({
      ...base,
      height: "36px",
    }),
    valueContainer: (base) => ({
      ...base,
      padding: "0 0.25rem",
    }),
  };

  const validateForm = () => {
    if (!productNameEn.trim() || !productNameAr.trim()) {
      showError("Product name in both languages is required.");
      return false;
    }

    if (!descriptionEn.trim() || !descriptionAr.trim()) {
      showError("Product description in both languages is required.");
      return false;
    }

    if (!category) {
      showError("Please select or create a category.");
      return false;
    }

    if (!mainLocation) {
      showError("Please select a main location.");
      return false;
    }

    if (!mainImage) {
      showError("Please upload a main image.");
      return false;
    }

    for (let i = 0; i < priceTiers.length; i++) {
      const tier = priceTiers[i];
      if (!tier.minQty || !tier.maxQty || !tier.price) {
        showError(`Fill all fields in price tier ${i + 1}`);
        return false;
      }

      for (let j = 0; j < tier.locations.length; j++) {
        const loc = tier.locations[j];
        if (!loc.location || !loc.price) {
          showError(
            `Fill all delivery info in tier ${i + 1}, location ${j + 1}`
          );
          return false;
        }
      }
    }

    return true;
  };

  if (loading || !currentUser || userData?.role !== "supplier") {
    return null; // or <Spinner /> if you prefer
  }

  return (
    <div className='max-w-7xl mx-auto px-4 py-10 text-sm'>
      <nav className='text-sm text-[#2c6449] font-medium mb-4'>
        <ol className='flex space-x-1 md:space-x-2 items-center'>
          <li>
            <button
              type='button'
              onClick={() => router.push("/supplier-dashboard")}
              className='hover:underline'
            >
              Dashboard
            </button>
          </li>
          <li>/</li>
          <li className='text-[#2c6449]'>Add Product</li>
        </ol>
      </nav>

      {/* Product Info & Category */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4'>
        <div>
          <input
            type='text'
            placeholder='Product Name (English)'
            value={productNameEn}
            onChange={(e) => setProductNameEn(e.target.value)}
            className='w-full bg-gray-50 border border-gray-300 rounded px-2 py-1.5 mb-2'
          />
          <input
            type='text'
            dir='rtl'
            placeholder='اسم المنتج (Arabic)'
            value={productNameAr}
            onChange={(e) => setProductNameAr(e.target.value)}
            className='w-full bg-gray-50 border border-gray-300 rounded px-2 py-1.5'
          />
        </div>

        <div>
          <input
            type='text'
            placeholder='Product Description (English)'
            value={descriptionEn}
            onChange={(e) => setDescriptionEn(e.target.value)}
            className='w-full bg-gray-50 border border-gray-300 rounded px-2 py-1.5 mb-2'
          />
          <input
            type='text'
            dir='rtl'
            placeholder='وصف المنتج (Arabic)'
            value={descriptionAr}
            onChange={(e) => setDescriptionAr(e.target.value)}
            className='w-full bg-gray-50 border border-gray-300 rounded px-2 py-1.5'
          />
        </div>

        <div>
          <CreatableSelect
            styles={selectStyle}
            value={category}
            onChange={(selected) => setCategory(selected)}
            placeholder='Select or Create a Category'
          />
        </div>

        <div>
          <CreatableSelect
            styles={selectStyle}
            value={subcategory}
            onChange={(selected) => setSubcategory(selected)}
            placeholder='Select or Create a Subcategory'
            isDisabled
          />
        </div>
      </div>

      {/* Main Location, Sizes, Colors */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-3 mb-6'>
        <CreatableSelect
          styles={selectStyle}
          placeholder='Select or Create a Location'
          options={defaultLocationOptions}
          value={mainLocation}
          onChange={(selected) => setMainLocation(selected)}
        />
        <CreatableSelect
          styles={selectStyle}
          placeholder='Select or Create a Size'
          options={defaultSizeOptions}
          value={sizes}
          onChange={(selected) => setSizes(selected)}
        />
        <CreatableSelect
          styles={selectStyle}
          placeholder='Select or Create a Color'
          options={defaultColorOptions}
          value={colors}
          onChange={(selected) => setColors(selected)}
        />
      </div>

      {/* Main & Additional Images */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
        <div>
          <label className='block mb-1 font-medium'>Main Image</label>
          <input
            type='file'
            onChange={(e) => setMainImage(e.target.files[0])}
            className='block w-full text-sm text-gray-700 border border-gray-300 rounded-md file:border-0 file:mr-4 file:py-1.5 file:px-4 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200'
          />
        </div>

        <div>
          <label className='block mb-1 font-medium'>Additional Images</label>
          {additionalImages.map((_, i) => (
            <div key={i} className='flex items-center gap-2 mb-2'>
              <input
                type='file'
                className='block w-full text-sm text-gray-700 border border-gray-300 rounded-md file:border-0 file:mr-4 file:py-1.5 file:px-4 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200'
              />
              <button type='button' className='text-red-500 text-xs'>
                Remove
              </button>
            </div>
          ))}
          <button
            type='button'
            className='text-blue-600 text-xs font-medium hover:underline'
          >
            + Add Another Image
          </button>
        </div>
      </div>

      {/* Price Tiers */}
      {priceTiers.map((tier, i) => (
        <div key={i} className='border border-gray-200 p-4 rounded mb-6'>
          <div className='flex justify-between items-center mb-3'>
            <h4 className='font-semibold'>Price Tier – Set {i + 1}</h4>
            <button type='button' className='text-red-500 text-xs'>
              Remove Price Tier
            </button>
          </div>

          <div className='hidden md:grid grid-cols-6 gap-3 mb-2 text-gray-600 text-xs font-medium'>
            <span>Min Qty</span>
            <span>Max Qty</span>
            <span>Price</span>
            <span>Delivery Location</span>
            <span>Delivery Price</span>
            <span>Actions</span>
          </div>

          {tier.locations.map((loc, li) => (
            <div
              key={li}
              className='grid grid-cols-1 md:grid-cols-6 gap-3 items-center mb-3'
            >
              <CreatableSelect
                styles={selectStyle}
                placeholder='Min Qty'
                options={
                  i === 0
                    ? shortQtyOptions.filter((opt) => opt.value !== "Unlimited")
                    : shortQtyOptions
                }
                isValidNewOption={(inputValue) => {
                  const trimmed = inputValue.trim();
                  if (i === 0) {
                    return (
                      trimmed !== "" &&
                      /^\d+$/.test(trimmed) &&
                      parseInt(trimmed, 10) >= 1
                    );
                  }
                  return (
                    trimmed !== "" &&
                    (/^\d+$/.test(trimmed) || trimmed === "Unlimited")
                  );
                }}
                formatCreateLabel={() => null}
                onCreateOption={(inputValue) => {
                  let cleaned = inputValue.trim();
                  if (!/^\d+$/.test(cleaned)) {
                    if (i === 0) {
                      showError("Min Qty must be a number. Defaulting to 1.");
                      cleaned = "1";
                    } else {
                      showError("Invalid quantity input.");
                      return;
                    }
                  }

                  if (
                    i === 0 &&
                    (cleaned === "Unlimited" || parseInt(cleaned, 10) < 1)
                  ) {
                    showError(
                      "For Price Tier 1, Min Qty must be at least 1. Defaulting to 1."
                    );
                    cleaned = "1";
                  }

                  const newTiers = [...priceTiers];
                  newTiers[i].minQty = cleaned;
                  setPriceTiers(newTiers);
                }}
                onChange={(selected) => {
                  const value = selected.value;
                  if (
                    i === 0 &&
                    (value === "Unlimited" || parseInt(value, 10) < 1)
                  ) {
                    showError("For Price Tier 1, Min Qty must be at least 1");
                    return;
                  }

                  const newTiers = [...priceTiers];
                  newTiers[i].minQty = value;
                  setPriceTiers(newTiers);
                }}
              />

              <CreatableSelect
                styles={selectStyle}
                placeholder='Max Qty'
                options={shortQtyOptions}
                isValidNewOption={(inputValue) =>
                  /^\d+$/.test(inputValue.trim()) ||
                  inputValue.trim() === "Unlimited"
                }
                formatCreateLabel={() => null}
                onCreateOption={(inputValue) => {
                  if (!/^\d+$/.test(inputValue) && inputValue !== "Unlimited") {
                    showError("Max Qty must be a number or 'Unlimited'");
                    return;
                  }

                  const newOption = { value: inputValue, label: inputValue };
                  const newTiers = [...priceTiers];
                  newTiers[i].minQty = inputValue;
                  setPriceTiers(newTiers);
                }}
                onChange={(selected) => {
                  const newTiers = [...priceTiers];
                  newTiers[i].maxQty = selected.value;
                  setPriceTiers(newTiers);
                }}
              />

              <CreatableSelect
                styles={selectStyle}
                placeholder='Price'
                options={shortQtyOptions}
                isValidNewOption={(inputValue) =>
                  /^\d+$/.test(inputValue.trim()) ||
                  inputValue.trim() === "Unlimited"
                }
                formatCreateLabel={() => null}
                onCreateOption={(inputValue) => {
                  if (!/^\d+$/.test(inputValue) && inputValue !== "Unlimited") {
                    showError("Price must be a number or 'Unlimited'");
                    return;
                  }

                  const newOption = { value: inputValue, label: inputValue };
                  const newTiers = [...priceTiers];
                  newTiers[i].minQty = inputValue;
                  setPriceTiers(newTiers);
                }}
                onChange={(selected) => {
                  const newTiers = [...priceTiers];
                  newTiers[i].price = selected.value;
                  setPriceTiers(newTiers);
                }}
              />

              <CreatableSelect
                styles={selectStyle}
                placeholder='Select Location'
                options={defaultLocationOptions}
                onChange={(selected) => {
                  const newTiers = [...priceTiers];
                  newTiers[i].locations[li].location = selected.value;
                  setPriceTiers(newTiers);
                }}
              />

              <CreatableSelect
                styles={selectStyle}
                placeholder='Delivery Price'
                options={shortQtyOptions}
                isValidNewOption={(inputValue) =>
                  /^\d+$/.test(inputValue.trim()) ||
                  inputValue.trim() === "Unlimited"
                }
                formatCreateLabel={() => null}
                onCreateOption={(inputValue) => {
                  if (!/^\d+$/.test(inputValue) && inputValue !== "Unlimited") {
                    showError("Delivery Price must be a number or 'Unlimited'");
                    return;
                  }

                  const newOption = { value: inputValue, label: inputValue };
                  const newTiers = [...priceTiers];
                  newTiers[i].minQty = inputValue;
                  setPriceTiers(newTiers);
                }}
                onChange={(selected) => {
                  const newTiers = [...priceTiers];
                  newTiers[i].locations[li].price = selected.value;
                  setPriceTiers(newTiers);
                }}
              />

              <div className='flex gap-2'>
                {li === tier.locations.length - 1 && (
                  <button
                    type='button'
                    className='text-blue-600 text-xs font-medium hover:underline whitespace-nowrap'
                  >
                    + Add Location
                  </button>
                )}
                <button
                  type='button'
                  className='text-red-500 text-xs whitespace-nowrap'
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      ))}

      <div className='text-left mb-6'>
        <button
          type='button'
          onClick={() => {
            const newTiers = [...priceTiers];
            newTiers.push({
              minQty: "",
              maxQty: "",
              price: "",
              locations: [{ location: "", price: "" }],
            });
            setPriceTiers(newTiers);
          }}
          className='text-sm text-blue-600 font-medium hover:underline'
        >
          + Add Price Tier
        </button>
      </div>

      {/* Submit Button */}
      <div className='text-center'>
        <button
          type='button'
          onClick={() => {
            if (validateForm()) {
              toast.success("Form is valid! Proceed with upload logic.");
              // TODO: Add upload logic here
            }
          }}
          className='bg-[#2c6449] text-white px-6 py-2 rounded-full hover:bg-[#24523b] shadow text-sm'
        >
          Upload Products
        </button>
      </div>
    </div>
  );
}
