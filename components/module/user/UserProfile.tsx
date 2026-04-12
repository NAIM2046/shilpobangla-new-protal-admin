// src/components/module/user/UserProfile.tsx (আপনার ফাইল পাথ অনুযায়ী)
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

import { uploadMediaAction } from "@/services/media/media.service";
import { updateUser } from "@/services/users/users.services";
import { useRouter } from "next/navigation";

// 🌟 ১. UserData এর জন্য ইন্টারফেস তৈরি করা হলো
interface UserProfileProps {
  userData: {
    id: string;
    name: string;
    email: string;
    bio?: string | null;
    avatar_url?: string | null;
  };
}

export default function UserProfile({ userData }: UserProfileProps) {
  const router = useRouter();
  // 🌟 ২. ডামি ডেটার বদলে Server থেকে আসা আসল ডেটা দিয়ে State ইনিশিয়ালাইজ করা হলো
  const [formData, setFormData] = useState({
    name: userData.name || "",
    email: userData.email || "",
    bio: userData.bio || "",
    avatar_url: userData.avatar_url || "/default-avatar.png",
  });

  // ইমেজ স্টেট ম্যানেজমেন্ট
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // লোডিং ও মেসেজ স্টেট
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // ইনপুট চেঞ্জ হ্যান্ডলার
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ছবি সিলেক্ট করার হ্যান্ডলার
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      // লোকাল প্রিভিউ দেখানোর জন্য URL তৈরি করা
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // 🌟 ফাইনাল সাবমিট হ্যান্ডলার
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      let finalAvatarUrl = formData.avatar_url;

      // যদি নতুন ছবি সিলেক্ট করা থাকে, তবে আগে সেটি আপলোড করব
      if (selectedImage) {
        const imageFormData = new FormData();
        imageFormData.append("file", selectedImage);

        const uploadRes = await uploadMediaAction(imageFormData);

        if (!uploadRes?.success) {
          throw new Error(uploadRes?.message || "Image upload failed");
        }

        finalAvatarUrl = uploadRes.data?.url || uploadRes.data?.file_url;
      }

      // 🌟 ফাইনাল পেলোড তৈরি করা
      const finalPayload = {
        name: formData.name,
        email: formData.email, // ইমেইল সাধারণত রিড-অনলি থাকে
        bio: formData.bio,
        avatar_url: finalAvatarUrl,
      };
      //console.log("Final Payload for Profile Update:", finalPayload);
      // প্রোফাইল আপডেট API/Action কল করা
      const profileRes = await updateUser(userData.id, finalPayload);
      //console.log("Profile Update Response:", profileRes);

      if (profileRes.success) {
        setMessage({ type: "success", text: "Profile updated successfully!" });
        setFormData((prev) => ({ ...prev, avatar_url: finalAvatarUrl }));
      } else {
        throw new Error(profileRes.message);
      }
      router.refresh();
    } catch (error: any) {
      console.error("Profile Update Error:", error);
      setMessage({
        type: "error",
        text: error.message || "Something went wrong.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ক্লিনআপ (মেমরি লিক রোধ করতে)
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow rounded-lg p-6 sm:p-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">
          Profile Management
        </h1>

        {message && (
          <div
            className={`p-4 mb-6 rounded ${
              message.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ====================================
              ১. Avatar / Profile Picture Section
          ==================================== */}
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 flex-shrink-0">
              <Image
                src={
                  previewUrl || formData.avatar_url || "/placeholder-avatar.png"
                }
                alt="Profile Avatar"
                fill
                className="object-cover"
                sizes="96px"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Photo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors"
              />
              <p className="text-xs text-gray-500 mt-2">
                JPG, PNG or GIF (Max. 2MB)
              </p>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* ====================================
              ২. User Info Fields
          ==================================== */}
          <div className="grid grid-cols-1 gap-6">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Full Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            {/* Email (Readonly) */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                readOnly
                disabled
                className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-500 shadow-sm sm:text-sm cursor-not-allowed"
              />
            </div>

            {/* Bio */}
            <div>
              <label
                htmlFor="bio"
                className="block text-sm font-medium text-gray-700"
              >
                Bio
              </label>
              <textarea
                name="bio"
                id="bio"
                rows={4}
                value={formData.bio}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                placeholder="Write a few sentences about yourself..."
              />
            </div>
          </div>

          {/* ====================================
              ৩. Submit Button
          ==================================== */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className={`inline-flex justify-center rounded-md border border-transparent px-6 py-2.5 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
                isLoading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isLoading ? "Saving changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
