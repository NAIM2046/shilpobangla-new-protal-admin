"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; // 🌟 Label ইমপোর্ট করা হয়েছে
import { Plus } from "lucide-react";
import { AddVideo } from "@/services/videos/video.service";
import { toast } from "sonner";

const AddVideoForm = () => {
  // 🌟 নতুন স্টেটগুলো অ্যাড করা হলো
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Title বা URL না থাকলে সাবমিট হবে না
    if (!url || !title) {
      toast.error("Title and URL are required!");
      return;
    }

    setIsLoading(true);

    // 🌟 ব্যাকএন্ডের চাহিদা অনুযায়ী payload পাঠানো হচ্ছে
    const result = await AddVideo({
      title,
      url,
      description,
    });

    if (result?.success) {
      // সফল হলে সব ইনপুট ফাঁকা করে দিন
      setTitle("");
      setUrl("");
      setDescription("");
      toast.success("Video added successfully!");
    } else {
      toast.error(result?.message || "Failed to add video");
    }

    setIsLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 max-w-xl">
      <h2 className="text-lg font-bold text-gray-800 mb-4">Add New Video</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 🌟 Title Input */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-gray-700">
            Video Title <span className="text-red-500">*</span>
          </Label>
          <Input
            id="title"
            type="text"
            placeholder="Enter video title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="focus-visible:ring-red-500"
          />
        </div>

        {/* 🌟 URL Input */}
        <div className="space-y-2">
          <Label htmlFor="url" className="text-gray-700">
            YouTube URL <span className="text-red-500">*</span>
          </Label>
          <Input
            id="url"
            type="url"
            placeholder="https://www.youtube.com/watch?v=..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            className="focus-visible:ring-red-500"
          />
        </div>

        {/* 🌟 Description Input (Optional) */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-gray-700">
            Description (Optional)
          </Label>
          <Input
            id="description"
            type="text"
            placeholder="Enter short description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="focus-visible:ring-red-500"
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white mt-2"
        >
          {isLoading ? (
            "Adding..."
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" /> Add Video
            </>
          )}
        </Button>
      </form>
    </div>
  );
};

export default AddVideoForm;
