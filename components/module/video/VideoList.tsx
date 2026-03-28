"use client";

import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { deleteVideo } from '@/services/videos/video.service';
import { toast } from 'sonner';

interface Video {
    id: string;
    title: string;
    youtube_url: string;
    thumbnail_url: string;
    status: string;
    created_at: string;
}

const VideoList = ({ videos }: { videos: Video[] }) => {
    
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // 🌟 ডিলিট হ্যান্ডলার
    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this video?")) return;

        setDeletingId(id);
        try {
             await deleteVideo(id);
            console.log("Deleted Video ID:", id);
            
            // সফল হলে প্রোডাকশনে টোস্ট দেখাবেন
             toast.success("Video deleted successfully");
        } catch (error) {
            console.error("Failed to delete video", error);
        } finally {
            setDeletingId(null);
        }
    };

    if (!videos || videos.length === 0) {
        return (
            <div className="bg-white border rounded-xl shadow-sm text-center py-10 text-gray-500">
                No videos found on this page.
            </div>
        );
    }

    return (
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-gray-700 border-b">
                    <tr>
                        <th className="px-6 py-3 font-medium">Video Details</th>
                        <th className="px-6 py-3 font-medium text-center">Status</th>
                        <th className="px-6 py-3 font-medium text-right">Added On</th>
                        <th className="px-6 py-3 font-medium text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y text-gray-600">
                    {videos.map((video) => (
                        <tr key={video.id} className="hover:bg-slate-50 transition-colors">
                           
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    {video.thumbnail_url && (
                                        <img 
                                            src={video.thumbnail_url} 
                                            alt={video.title} 
                                            className="w-16 h-10 object-cover rounded-md border"
                                        />
                                    )}
                                    <div>
                                        <p className="font-medium text-gray-900 line-clamp-1">{video.title}</p>
                                        <a 
                                          href={video.youtube_url || "#"} 
                                          target="_blank" 
                                          rel="noreferrer" 
                                          className="text-blue-500 hover:underline text-xs"
                                        >
                                            {video.youtube_url}
                                        </a>
                                    </div>
                                </div>
                            </td>
                            
                            <td className="px-6 py-4 text-center">
                                <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium">
                                    {video.status}
                                </span>
                            </td>
                            
                            <td className="px-6 py-4 text-right">
                                {new Date(video.created_at).toLocaleDateString()}
                            </td>
                            
                          
                            <td className="px-6 py-4 text-right">
                                <button
                                    onClick={() => handleDelete(video.id)}
                                    disabled={deletingId === video.id}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                                    title="Delete Video"
                                >
                                    {deletingId === video.id ? (
                                        <span className="text-xs">Deleting...</span>
                                    ) : (
                                        <Trash2 size={18} />
                                    )}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default VideoList;