// app/register/page.jsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterChoice() {
  const router = useRouter();

  const handleRoleSelection = (role) => {
    router.push(role === "supplier" ? "/supplier" : "/buyer");
  };

  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4'>
      <div className='text-center mb-6'>
        <Image
          src='/assets/logo.svg'
          alt='Logo'
          width={80}
          height={80}
          priority
        />
        <h2 className='text-2xl font-bold text-[#2d6a4f]'>Register as a</h2>
      </div>

      <div className='w-full max-w-sm bg-white p-6 rounded-lg shadow text-center'>
        <div className='flex justify-between mb-6 gap-4'>
          <button
            onClick={() => handleRoleSelection("supplier")}
            className='w-1/2 bg-[#2d6a4f] text-white font-bold py-2 rounded hover:bg-[#245e45] transition'
          >
            Supplier
          </button>
          <button
            onClick={() => handleRoleSelection("buyer")}
            className='w-1/2 bg-[#2d6a4f] text-white font-bold py-2 rounded hover:bg-[#245e45] transition'
          >
            Buyer
          </button>
        </div>

        <p className='text-sm text-gray-600 mb-2'>
          Already have an account?{" "}
          <Link
            href='/user-login'
            className='text-[#2d6a4f] font-semibold hover:underline'
          >
            Login
          </Link>
        </p>

        <Link
          href='/guest'
          className='text-[#2d6a4f] font-semibold hover:underline text-sm'
        >
          Browse as a Guest
        </Link>
      </div>
    </div>
  );
}
