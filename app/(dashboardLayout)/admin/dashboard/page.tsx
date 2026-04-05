import React from "react";
import {
  Users,
  FileText,
  Eye,
  Clock,
  PlusCircle,
  MoreVertical,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAdminDashboardStatus } from "@/services/dashboard/dashboard.service";

const AdminDashboard = async () => {
  // 🌟 ডাটাবেজ থেকে আসল ডাটা আনা হচ্ছে
  const response = await getAdminDashboardStatus();

  // আপনার API রেসপন্স অনুযায়ী ডাটা এক্সট্র্যাক্ট করা (যদি data প্রপার্টির ভেতর থাকে)
  const dashboardData = response?.data || response || {};
  const serverStats = dashboardData?.stats || {};
  const recentNews = dashboardData?.recentNews || [];

  // সংখ্যাগুলোকে বাংলায় দেখানোর জন্য একটি হেল্পার ফাংশন
  const toBengaliNumber = (num?: number) => {
    if (num === undefined || num === null) return "০";
    return num.toLocaleString("bn-BD");
  };

  // 🌟 ডাইনামিক ডাটা দিয়ে স্ট্যাটস আপডেট
  const stats = [
    {
      title: "মোট সংবাদ",
      value: toBengaliNumber(serverStats.totalNews),
      icon: FileText,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "মোট ব্যবহারকারী",
      value: toBengaliNumber(serverStats.totalUsers),
      icon: Users,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      title: "মোট ভিউ",
      value: toBengaliNumber(serverStats.totalViews),
      icon: Eye,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      title: "অপেক্ষমান সংবাদ",
      value: toBengaliNumber(serverStats.pendingNews),
      icon: Clock,
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* 🌟 হেডার সেকশন */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            ড্যাশবোর্ড ওভারভিউ
          </h1>
          <p className="text-gray-500 mt-1">
            স্বাগতম! আপনার পোর্টালের আজকের আপডেট দেখুন।
          </p>
        </div>
      </div>

      {/* 🌟 স্ট্যাটাস কার্ডস (Grid Layout) */}
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
                    {stat.value}
                  </h3>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 🌟 সাম্প্রতিক সংবাদ লিস্ট (Table-like view) */}
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-800">
            সাম্প্রতিক সংবাদ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b text-gray-500 text-sm">
                  <th className="pb-3 font-medium">শিরোনাম</th>
                  <th className="pb-3 font-medium">ক্যাটাগরি</th>
                  <th className="pb-3 font-medium">তারিখ</th>
                  <th className="pb-3 font-medium">স্ট্যাটাস</th>
                  <th className="pb-3 font-medium text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {recentNews.length > 0 ? (
                  recentNews.map((news: any) => (
                    <tr
                      key={news.id}
                      className="border-b last:border-0 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 text-gray-900 font-medium max-w-xs truncate">
                        {news.title}
                      </td>
                      <td className="py-4 text-gray-600">
                        {news.category?.name || "N/A"}
                      </td>
                      <td className="py-4 text-gray-600">
                        {/* 🌟 তারিখকে সুন্দরভাবে বাংলা ফরম্যাটে দেখানো */}
                        {new Date(news.created_at).toLocaleDateString("bn-BD", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-4">
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            news.status === "PUBLISHED"
                              ? "bg-green-100 text-green-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {news.status}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <button className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      কোনো সংবাদ পাওয়া যায়নি
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

export default AdminDashboard;
