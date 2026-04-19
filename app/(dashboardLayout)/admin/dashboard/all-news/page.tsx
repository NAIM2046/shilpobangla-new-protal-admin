import React from "react";
import Link from "next/link";
import { getAllNewsAction } from "@/services/news/news.service";
import { getAllCategory } from "@/services/categories/categories.service";
import NewsSearch from "@/components/module/share/NewsSearch";
import NewsFilter from "@/components/module/share/NewsFilter";
import PaginationControls from "@/components/module/share/PaginationControls";

// Next.js 15 অনুযায়ী টাইপ
type Props = {
  searchParams: Promise<{ [key: string]: string | undefined }>;
};

const AllNewsPage = async ({ searchParams }: Props) => {
  // 🌟 searchParams কে await করে ডাটা বের করা হলো
  const resolvedParams = await searchParams;
  const currentPage = Number(resolvedParams?.page) || 1;

  // 🌟 ম্যাজিক: Promise.all ব্যবহার করে দুটি API একযোগে (Parallel) কল করা হলো
  const [newsResponse, categoryResponse] = await Promise.all([
    getAllNewsAction(resolvedParams),
    getAllCategory(),
  ]);

  // নিউজ ডাটা এক্সট্রাক্ট করা
  const newsList = newsResponse?.data || [];
  const limit = newsResponse?.meta?.limit || 10;
  const totalItems = newsResponse?.meta?.total || 0;
  const totalPages = Math.ceil(totalItems / limit);

  // ক্যাটাগরি ডাটা এক্সট্রাক্ট করা
  const categories = categoryResponse?.data || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-full">
      {/* 🌟 হেডার সেকশন (মোবাইলে টাইটেল এবং বাটন নিচে নিচে বসবে) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          My News
        </h1>
        <Link
          href="/admin/dashboard/add-news"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md font-medium transition w-full sm:w-auto text-center"
        >
          + Add New News
        </Link>
      </div>

      {/* 🌟 Search and Filter Section */}
      <div className="flex flex-col lg:flex-row justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6 gap-4 w-full">
        <div className="w-full lg:w-auto flex-1">
          <NewsSearch />
        </div>
        <div className="w-full lg:w-auto">
          <NewsFilter categories={categories} />
        </div>
      </div>

      {/* 🌟 News Table (মোবাইলের জন্য ওভারফ্লো স্ক্রল যুক্ত করা হয়েছে) */}
      <div className="bg-white rounded-lg shadow border border-gray-200 w-full overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead className="bg-gray-50 text-gray-700 text-sm sm:text-base">
              <tr>
                <th className="p-4 font-semibold border-b whitespace-nowrap">
                  Title
                </th>
                <th className="p-4 font-semibold border-b whitespace-nowrap">
                  Category
                </th>
                <th className="p-4 font-semibold border-b whitespace-nowrap">
                  Status
                </th>
                <th className="p-4 font-semibold border-b text-center whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="text-sm sm:text-base">
              {newsList.length > 0 ? (
                newsList.map((news: any) => (
                  <tr
                    key={news.id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="p-4 text-gray-800 font-medium max-w-[250px] sm:max-w-xs">
                      <div className="line-clamp-2">{news.title}</div>
                    </td>
                    <td className="p-4 text-gray-600 whitespace-nowrap">
                      {news.category?.name || "N/A"}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold ${
                          news.status === "PUBLISHED"
                            ? "bg-green-100 text-green-700"
                            : news.status === "DRAFT"
                              ? "bg-gray-100 text-gray-700"
                              : news.status === "REJECTED"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {news.status}
                      </span>
                    </td>
                    <td className="p-4 text-center whitespace-nowrap">
                      <div className="flex gap-3 justify-center items-center">
                        <Link
                          href={`/admin/dashboard/edit-news/${news.slug}`}
                          className="text-green-600 font-medium hover:underline transition-colors"
                        >
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">
                    No news found matching your search/filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🌟 Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center sm:justify-start w-full overflow-x-auto">
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
          />
        </div>
      )}
    </div>
  );
};

export default AllNewsPage;
