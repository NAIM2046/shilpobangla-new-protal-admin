import React from 'react';
import Link from 'next/link';
import { getMyNewsAction } from '@/services/news/news.service';
import { getAllCategory } from '@/services/categories/categories.service';
import NewsSearch from '@/components/module/share/NewsSearch';
import NewsFilter from '@/components/module/share/NewsFilter';
import PaginationControls from '@/components/module/share/PaginationControls';

// 🌟 ১. Next.js 15 অনুযায়ী টাইপ আপডেট করা হলো
type Props = {
    searchParams: Promise<{ [key: string]: string | undefined }>;
};

const MyNewsPage = async ({ searchParams }: Props) => {
    
    // 🌟 ২. searchParams কে await করে ডাটা বের করা হলো
    const resolvedParams = await searchParams;
    const currentPage = Number(resolvedParams?.page) || 1;
     const [newsResponse, categoryResponse] = await Promise.all([
        getMyNewsAction(resolvedParams),
        getAllCategory()
    ]);
    
    const newsList = newsResponse?.data || [];
    const limit = newsResponse?.meta?.limit || 10;
    const totalItems = newsResponse?.meta?.total || 0;
    const totalPages = Math.ceil(totalItems / limit);

  
    const categories = categoryResponse?.data || [];

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className='text-3xl font-bold text-gray-800'>My News</h1>
                <Link 
                    href="/reporter/dashboard/add-news" 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md font-medium transition"
                >
                    + Add New News
                </Link>
            </div>

            {/* 🌟 Search and Filter Section */}
            <div className="flex flex-col sm:flex-row justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6 gap-4">
                <NewsSearch />
                {/* 🌟 আসল ক্যাটাগরি প্রপস হিসেবে পাঠিয়ে দিলাম */}
                <NewsFilter categories={categories} />
            </div>

            {/* News Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 text-gray-700">
                        <tr>
                            <th className="p-4 font-semibold border-b">Title</th>
                            <th className="p-4 font-semibold border-b">Category</th>
                            <th className="p-4 font-semibold border-b">Status</th>
                            <th className="p-4 font-semibold border-b text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {newsList.length > 0 ? (
                            newsList.map((news: any) => (
                                <tr key={news.id} className="border-b hover:bg-gray-50 transition">
                                    <td className="p-4 text-gray-800 font-medium">
                                        <div className="line-clamp-2">{news.title}</div>
                                    </td>
                                    <td className="p-4 text-gray-600">
                                        {news.category?.name || 'N/A'}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                            news.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' :
                                            news.status === 'DRAFT' ? 'bg-gray-100 text-gray-700' :
                                            news.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                            'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            {news.status}
                                        </span>
                                    </td>
                                    <td className="p-4 flex gap-3 justify-center items-center">
                                        {(news.status === 'DRAFT' || news.status === 'PENDING' || news.status === 'REJECTED') ? (
                                            <Link href={`/reporter/dashboard/my-news/${news.slug}`} className="text-green-600 font-medium">
                                                Edit
                                            </Link>
                                        ) : (
                                            <span className="text-gray-400 text-sm cursor-not-allowed" title="Published news cannot be edited">🔒 Locked</span>
                                        )}
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

            {totalPages > 1 && (
                <div className="mt-6">
                    <PaginationControls currentPage={currentPage} totalPages={totalPages} />
                </div>
            )}
        </div>
    );
};

export default MyNewsPage;