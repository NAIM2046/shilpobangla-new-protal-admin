import React from "react";
import {
  FileEdit,
  CheckCircle,
  Clock,
  Eye,
  PlusCircle,
  Edit,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getEditorDashboardStatus } from "@/services/dashboard/dashboard.service";
import Link from "next/link";

const EditorDashboard = async () => {
  // 🌟 API থেকে রিয়েল ডাটা আনছি
  const response = await getEditorDashboardStatus();

  // API রেসপন্স থেকে ডাটা আলাদা করা (যদি ডাটা না থাকে তবে ডিফল্ট মান 0 বা ফাঁকা অ্যারে বসবে)
  const statsData = response?.data?.stats || {
    pendingReviews: 0,
    publishedToday: 0,
    drafts: 0,
    totalViews: 0,
  };
  const pendingNews = response?.data?.pendingNews || [];

  // 🌟 API এর ডাটা দিয়ে স্ট্যাটাস কার্ড তৈরি
  const stats = [
    {
      title: "অপেক্ষমান রিভিউ",
      value: statsData.pendingReviews,
      icon: Clock,
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
    {
      title: "আজ প্রকাশিত",
      value: statsData.publishedToday,
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      title: "খসড়া (Drafts)",
      value: statsData.drafts,
      icon: FileEdit,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "মোট ভিউ",
      value: statsData.totalViews,
      icon: Eye,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* 🌟 হেডার সেকশন */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">এডিটর ড্যাশবোর্ড</h1>
          <p className="text-gray-500 mt-1">
            স্বাগতম! পেন্ডিং সংবাদগুলো রিভিউ করুন এবং কন্টেন্ট ম্যানেজ করুন।
          </p>
        </div>
        <Link href="/editor/dashboard/add-news">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
            <PlusCircle className="w-5 h-5" />
            নতুন সংবাদ লিখুন
          </Button>
        </Link>
      </div>

      {/* 🌟 স্ট্যাটাস কার্ডস (Overview) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="border-none shadow-sm">
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`p-4 rounded-full ${stat.bg} ${stat.color}`}>
                  <Icon className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {stat.title}
                  </p>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {/* সংখ্যাগুলোকে বাংলায় কনভার্ট করতে চাইলে toLocaleString('bn-BD') ব্যবহার করতে পারেন */}
                    {Number(stat.value).toLocaleString("bn-BD")}
                  </h3>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 🌟 পেন্ডিং রিভিউ টেবিল */}
      <Card className="border-none shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl font-bold text-gray-800">
            অপেক্ষমান সংবাদ (Pending Review)
          </CardTitle>
          <Link href="/editor/news/pending">
            <Button variant="outline" className="text-sm">
              সব দেখুন
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b text-gray-500 text-sm">
                  <th className="pb-3 font-medium">শিরোনাম</th>
                  <th className="pb-3 font-medium">রিপোর্টার/অথার</th>
                  <th className="pb-3 font-medium">ক্যাটাগরি</th>
                  <th className="pb-3 font-medium">তারিখ</th>
                  <th className="pb-3 font-medium text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {pendingNews.length > 0 ? (
                  pendingNews.map((news: any) => (
                    <tr
                      key={news.id}
                      className="border-b last:border-0 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 text-gray-900 font-medium max-w-sm truncate pr-4">
                        {news.title}
                      </td>
                      <td className="py-4 text-gray-600">
                        {news.author?.name || "অজ্ঞাত"}
                      </td>
                      <td className="py-4 text-gray-600">
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium">
                          {news.category?.name || "সাধারণ"}
                        </span>
                      </td>
                      <td className="py-4 text-gray-500 text-sm">
                        {/* 🌟 তারিখ ফরমেট করা হয়েছে */}
                        {new Date(news.created_at).toLocaleDateString("bn-BD", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-4 text-right">
                        <Link href={`/editor/dashboard/edit-news/${news.slug}`}>
                          <Button
                            size="sm"
                            className="bg-orange-100 hover:bg-orange-200 text-orange-700 border-none flex items-center gap-1 ml-auto"
                          >
                            <Edit className="w-4 h-4" />
                            রিভিউ করুন
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      কোনো অপেক্ষমান সংবাদ নেই।
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditorDashboard;
