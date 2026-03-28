"use client";

import React, { useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function NewsSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // 🌟 setTimeout-এর আইডি ধরে রাখার জন্য useRef ব্যবহার করছি
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ইনপুটে টাইপ করার সাথে সাথে এই ফাংশনটি কল হবে
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;

    // ১. আগের কোনো টাইমার থাকলে সেটা ক্লিয়ার করে দাও (Debounce logic)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // ২. নতুন করে ৩০০ মিলিসেকেন্ডের টাইমার সেট করো
    timeoutRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      
      if (term) {
        params.set("searchTerm", term);
      } else {
        params.delete("searchTerm");
      }
      
      params.set("page", "1"); 

      // 🌟 router.push এর বদলে router.replace ব্যবহার করা ভালো, 
      // এতে ব্রাউজারের ব্যাক বাটনে হিস্ট্রি জমে যায় না।
      router.replace(`${pathname}?${params.toString()}`);
    }, 300);
  };

  return (
    <div className="w-full sm:max-w-xs">
      <input
        type="text"
        placeholder="Search news by title..."
        // 🌟 useState এর বদলে defaultValue দিয়ে URL থেকে সরাসরি ইনিশিয়াল ভ্যালু বসিয়ে দিলাম
        defaultValue={searchParams.get("searchTerm") || ""}
        onChange={handleSearch}
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}