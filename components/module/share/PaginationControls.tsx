"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
};

// পেজ নম্বর জেনারেট করার ফাংশন (যেমন: 1, 2, 3, 4, 5, ..., 10)
const generatePagination = (currentPage: number, totalPages: number) => {
  // যদি মোট পেজ ৭ বা তার কম হয়, তাহলে সবগুলো নম্বর দেখাবে
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // যদি বর্তমান পেজ শুরুর দিকে হয় (যেমন: 1, 2, 3, 4)
  if (currentPage <= 3) {
    return [1, 2, 3, 4, "...", totalPages];
  }

  // যদি বর্তমান পেজ শেষের দিকে হয় (যেমন: 7, 8, 9, 10)
  if (currentPage >= totalPages - 3) {
    return [
      1,
      "...",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  // যদি বর্তমান পেজ মাঝখানের দিকে হয় (যেমন: 1 ... 4, 5, 6 ... 10)
  return [
    1,
    "...",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "...",
    totalPages,
  ];
};

export default function PaginationControls({
  currentPage,
  totalPages,
}: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // পেজ চেঞ্জ করার ফাংশন
  const handlePageChange = (newPage: number | string) => {
    if (typeof newPage === "string") return; // "..." এ ক্লিক করলে কিছু হবে না
    if (newPage < 1 || newPage > totalPages) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());

    router.push(`?${params.toString()}`, { scroll: false });
  };

  // যদি মাত্র ১টি পেজ থাকে, তবে বাটন দেখানোর দরকার নেই
  if (totalPages <= 1) return null;

  const pages = generatePagination(currentPage, totalPages);

  return (
    <div className="flex items-center justify-center py-4">
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Previous Button */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 text-slate-400 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous Page"
        >
          <ChevronLeft size={20} strokeWidth={2.5} />
        </button>

        {/* Page Numbers */}
        {pages.map((page, index) => {
          const isCurrent = page === currentPage;
          const isEllipsis = page === "...";

          if (isEllipsis) {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-2 text-slate-600 font-medium"
              >
                ...
              </span>
            );
          }

          return (
            <button
              key={`page-${page}`}
              onClick={() => handlePageChange(page)}
              className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-sm sm:text-base font-medium transition-all ${
                isCurrent
                  ? "bg-slate-100 text-blue-600 font-bold" // Active State (ছবির মতো হালকা গ্রে ব্যাকগ্রাউন্ড)
                  : "text-blue-600 hover:bg-slate-50" // Inactive State
              }`}
            >
              {page}
            </button>
          );
        })}

        {/* Next Button */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Next Page"
        >
          <ChevronRight size={20} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}