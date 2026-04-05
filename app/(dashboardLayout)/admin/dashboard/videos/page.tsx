import PaginationControls from "@/components/module/share/PaginationControls";
import AddVideo from "@/components/module/video/AddVideo";
import VideoList from "@/components/module/video/VideoList";
import { getAllVideo } from "@/services/videos/video.service";

// পেজটি যেন ক্যাশ না ধরে এবং সবসময় রিয়েল-টাইম ডাটা দেখায়
export const dynamic = "force-dynamic";

const VideoPage = async ({
  searchParams,
}: {
  searchParams: { page?: string };
}) => {
  // URL থেকে current page নিচ্ছি, না থাকলে ডিফল্ট 1
  const currentPage = Number(searchParams?.page) || 1;
  const limit = 10;

  // ব্যাকএন্ড থেকে ডাটা আনছি
  const result = await getAllVideo({ page: currentPage, limit });

  // result থেকে ডাটা এবং মেটা বের করে নিচ্ছি
  const videos = result?.data || [];
  const totalPages = result?.meta?.totalPages || 1;

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* 🌟 হেডার সেকশন */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Video Management</h1>
        <p className="text-gray-500 mt-1">
          Manage, add, and organize your YouTube videos here.
        </p>
      </div>

      {/* 🌟 নতুন ভিডিও যুক্ত করার ফর্ম */}
      <div className="w-full">
        <AddVideo />
      </div>

      {/* 🌟 ভিডিও লিস্ট সেকশন */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">
            Uploaded Videos
          </h2>
          <span className="text-sm text-gray-500 bg-gray-200 px-3 py-1 rounded-full">
            Total Pages: {totalPages}
          </span>
        </div>

        <div className="p-0">
          <VideoList videos={videos} />
        </div>
      </div>

      {/* 🌟 পেজিনেশন কন্ট্রোলস */}
      {totalPages > 1 && (
        <div className="flex justify-end pt-4">
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
          />
        </div>
      )}
    </div>
  );
};

export default VideoPage;
