// app/admin/videos/page.tsx (আপনার রাউট অনুযায়ী পাথ মিলিয়ে নিন)
import PaginationControls from '@/components/module/share/PaginationControls';
import AddVideo from '@/components/module/video/AddVideo';
import VideoList from '@/components/module/video/VideoList';
import { getAllVideo } from '@/services/videos/video.service';
import React from 'react';

// পেজটি যেন ক্যাশ না ধরে এবং সবসময় রিয়েল-টাইম ডাটা দেখায়
export const dynamic = "force-dynamic";

const VideoPage = async ({ searchParams }: { searchParams: { page?: string } }) => {
  // URL থেকে current page নিচ্ছি, না থাকলে ডিফল্ট 1
  const currentPage = Number(searchParams?.page) || 1;
  const limit = 10;

  // ব্যাকএন্ড থেকে ডাটা আনছি
  const result = await getAllVideo({ page: currentPage, limit });
  
  // result থেকে ডাটা এবং মেটা বের করে নিচ্ছি
  const videos = result?.data || [];
  const totalPages = result?.meta?.totalPages || 1;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Video Management</h1>
          <p className="text-sm text-gray-500">Manage your published videos here.</p>
        </div>
        
        {/* URL ইনপুট ফর্ম */}
        <AddVideo />
      </div>

      {/* ভিডিও লিস্ট টেবিল */}
      <VideoList videos={videos} />

      {/* পেজিনেশন কন্ট্রোলস */}
      {totalPages > 1 && (
        <PaginationControls 
          currentPage={currentPage}
          totalPages={totalPages}
        />
      )}
    </div>
  );
};

export default VideoPage;