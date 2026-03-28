"use client";

import React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

// 🌟 আপনার ডাটাবেজের আসল রেসপন্স অনুযায়ী টাইপ তৈরি করলাম
type Category = {
  id: string;
  name: string;
  slug: string;
  children?: Category[]; // যদি সাব-ক্যাটাগরি থাকে
};

type FilterProps = {
  categories: Category[];
};

export default function NewsFilter({ categories }: FilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    params.set("page", "1"); // ফিল্টার চেঞ্জ করলে পেজ ১ এ যাবে

    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
      {/* Category Filter */}
      <select
        defaultValue={searchParams.get("category_id") || ""}
        onChange={(e) => handleFilterChange("category_id", e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        <option value="">All Categories</option>
        {/* 🌟 আসল ক্যাটাগরিগুলো এখানে ম্যাপ হচ্ছে */}
        {categories.map((cat) => (
          <React.Fragment key={cat.id}>
            <option value={cat.id}>{cat.name}</option>
            {/* যদি সাব-ক্যাটাগরি ড্রপডাউনে দেখাতে চান, তাহলে নিচের অংশটুকু আনকমেন্ট করতে পারেন */}
            {cat.children && cat.children.map(subCat => (
                <option key={subCat.id} value={subCat.id}>-- {subCat.name}</option>
            ))}
          </React.Fragment>
        ))}
      </select>

      {/* Status Filter */}
      <select
        defaultValue={searchParams.get("status") || ""}
        onChange={(e) => handleFilterChange("status", e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        <option value="">All Status</option>
        <option value="PUBLISHED">Published</option>
        <option value="PENDING">Pending</option>
        <option value="DRAFT">Draft</option>
        <option value="REJECTED">Rejected</option>
      </select>
    </div>
  );
}