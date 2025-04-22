// src/constants/productOptions.js

// All cities in Saudi Arabia
export const defaultLocationOptions = [
  "Riyadh",
  "Jeddah",
  "Mecca",
  "Medina",
  "Dammam",
  "Khobar",
  "Tabuk",
  "Abha",
  "Khamis Mushait",
  "Buraidah",
  "Najran",
  "Hail",
  "Al Hufuf",
  "Yanbu",
  "Al Jubail",
  "Al Khafji",
  "Arar",
  "Sakaka",
  "Hafar Al-Batin",
  "Qatif",
  "Al Bahah",
  "Jizan",
  "Al Majma'ah",
  "Al Zulfi",
  "Unaizah",
  "Rabigh",
  "Ras Tanura",
  "Safwa",
  "Turubah",
  "Turaif",
  "Wadi ad-Dawasir",
  "Dhurma",
  "Al Qunfudhah",
  "Dhahran",
  "Al Lith",
  "Diriyah",
  "Al Muzahmiyya",
  "Al Aflaj",
  "Thadiq",
  "Shaqra",
  "Al Dawadmi",
  "Samtah",
  "Al Namas",
  "Tanumah",
].map((city) => ({ value: city, label: city }));

// Sizes
export const defaultSizeOptions = [
  { value: "XS", label: "XS" },
  { value: "S", label: "S" },
  { value: "M", label: "M" },
  { value: "L", label: "L" },
  { value: "XL", label: "XL" },
  { value: "XXL", label: "XXL" },
];

// Colors
export const defaultColorOptions = [
  { value: "Red", label: "Red" },
  { value: "Blue", label: "Blue" },
  { value: "Green", label: "Green" },
  { value: "Yellow", label: "Yellow" },
  { value: "Black", label: "Black" },
  { value: "White", label: "White" },
  { value: "Pink", label: "Pink" },
  { value: "Purple", label: "Purple" },
  { value: "Orange", label: "Orange" },
  { value: "Gray", label: "Gray" },
];

// Quantity options (1–100 + Unlimited)
export const defaultQtyOptions = Array.from({ length: 100 }, (_, i) => ({
  value: (i + 1).toString(),
  label: (i + 1).toString(),
})).concat({ value: "Unlimited", label: "Unlimited" });

// Quantity options (1–10 + Unlimited)
export const shortQtyOptions = Array.from({ length: 10 }, (_, i) => ({
  value: (i + 1).toString(),
  label: (i + 1).toString(),
})).concat({ value: "Unlimited", label: "Unlimited" });
