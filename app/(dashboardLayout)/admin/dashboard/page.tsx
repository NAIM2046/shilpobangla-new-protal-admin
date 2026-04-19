import React from "react";
import Link from "next/link";
import { Users, FileText, Eye, Clock, MoreVertical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminDashboardStatus } from "@/services/dashboard/dashboard.service";

const AdminDashboard = async () => {
  // 🌟 ডাটাবেজ থেকে আসল ডাটা আনা হচ্ছে
  const response = await getAdminDashboardStatus();

  // আপনার API রেসপন্স অনুযায়ী ডাটা এক্সট্র্যাক্ট করা
  const dashboardData = response?.data || response || {};
  const serverStats = dashboardData?.stats || {};
  const recentNews = dashboardData?.recentNews || [];
  console.log("Dashboard Data:", recentNews); // ডাটা চেক করার জন্য লগ

  // সংখ্যাগুলোকে বাংলায় দেখানোর জন্য একটি হেল্পার ফাংশন
  const toBengaliNumber = (num?: number) => {
    if (num === undefined || num === null) return "০";
    return num.toLocaleString("bn-BD");
  };

  // 🌟 ডাইনামিক ডাটা দিয়ে স্ট্যাটস আপডেট
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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 bg-gray-50 min-h-screen w-full">
      {/* 🌟 হেডার সেকশন */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            ড্যাশবোর্ড ওভারভিউ
          </h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">
            স্বাগতম! আপনার পোর্টালের আজকের আপডেট দেখুন।
          </p>
        </div>
      </div>

      {/* 🌟 স্ট্যাটাস কার্ডস (Responsive Grid Layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={index}
              className="border-none shadow-sm hover:shadow-md transition-shadow"
            >
              <CardContent className="p-5 sm:p-6 flex items-center gap-4">
                <div
                  className={`p-3 sm:p-4 rounded-full ${stat.bg} ${stat.color} shrink-0`}
                >
                  <Icon className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <div className="min-w-0">
                  {" "}
                  {/* Text truncation fix for small screens */}
                  <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                    {stat.title}
                  </p>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                    {stat.value}
                  </h3>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 🌟 সাম্প্রতিক সংবাদ লিস্ট (Responsive Table) */}
      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="p-5 sm:p-6 border-b border-gray-100 bg-white">
          <CardTitle className="text-lg sm:text-xl font-bold text-gray-800">
            সাম্প্রতিক সংবাদ
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {/* overflow-x-auto ensures horizontal scrolling on mobile */}
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 text-xs sm:text-sm bg-gray-50/50 sm:bg-transparent">
                  <th className="p-4 sm:px-0 sm:pb-3 font-medium whitespace-nowrap">
                    শিরোনাম
                  </th>
                  <th className="p-4 sm:px-0 sm:pb-3 font-medium whitespace-nowrap">
                    ক্যাটাগরি
                  </th>
                  <th className="p-4 sm:px-0 sm:pb-3 font-medium whitespace-nowrap">
                    তারিখ
                  </th>
                  <th className="p-4 sm:px-0 sm:pb-3 font-medium whitespace-nowrap">
                    স্ট্যাটাস
                  </th>
                  <th className="p-4 sm:px-0 sm:pb-3 font-medium text-right whitespace-nowrap">
                    অ্যাকশন
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {recentNews.length > 0 ? (
                  recentNews.map((news: any) => (
                    <tr
                      key={news.id}
                      className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4 sm:py-4 sm:px-0 text-gray-900 font-medium max-w-[200px] sm:max-w-xs truncate">
                        {news.title}
                      </td>
                      <td className="p-4 sm:py-4 sm:px-0 text-gray-600 whitespace-nowrap">
                        {news.category?.name || "N/A"}
                      </td>
                      <td className="p-4 sm:py-4 sm:px-0 text-gray-600 whitespace-nowrap">
                        {new Date(news.created_at).toLocaleDateString("bn-BD", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="p-4 sm:py-4 sm:px-0 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 text-[11px] sm:text-xs font-semibold rounded-full ${
                            news.status === "PUBLISHED"
                              ? "bg-green-100 text-green-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {news.status}
                        </span>
                      </td>
                      <td className="p-4 sm:py-4 sm:px-0 text-right whitespace-nowrap">
                        <Link
                          href={`/admin/dashboard/edit-news/${news.slug}`}
                          className="text-green-600 font-medium hover:text-green-700 hover:underline inline-flex items-center gap-1 transition-colors"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      কোনো সংবাদ পাওয়া যায়নি
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
