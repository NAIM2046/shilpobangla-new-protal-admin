"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { uploadMediaAction } from "@/services/media/media.service";
import { updateNewsAction } from "@/services/news/news.service";
import dynamic from "next/dynamic";

const ReactQuillWrapper = dynamic(
  async () => {
    const { default: RQ } = await import("react-quill-new");
    return function ForwardedQuill({ forwardedRef, ...props }: any) {
      return <RQ ref={forwardedRef} {...props} />;
    };
  },
  {
    ssr: false,
    loading: () => (
      <p className="text-gray-500 p-4 border rounded">Loading Editor...</p>
    ),
  },
);
import "react-quill-new/dist/quill.snow.css";

interface EditNewsFormProps {
  initialCategories: any[];
  initialData: any;
  newsId: string;
}

const EditorNewsEditForm = ({
  initialCategories,
  initialData,
  newsId,
}: EditNewsFormProps) => {
  const router = useRouter();
  const quillRef = useRef<any>(null);

  const [isLoading, setIsLoading] = useState(false);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.thumbnail?.file_url || initialData?.seo_meta?.og_image || null,
  );
  console.log(imagePreview, "........imagePreview");
  //console.log(initialData, "........initialData");
  // 🌟 formData তে এডিটরের নতুন ফিল্ডগুলো যুক্ত করা হলো
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    short_desc: initialData?.short_desc || "",
    content: initialData?.content || "",
    category_id: initialData?.category?.id || initialData?.category_id || "",
    tags: Array.isArray(initialData?.tags)
      ? initialData.tags.map((item: any) => item.tag.name).join(", ")
      : initialData?.seo_meta?.keywords || "",

    // 🌟 নতুন ফিল্ডসমূহ
    status: initialData?.status || "DRAFT",
    is_breaking: initialData?.is_breaking || false,
    is_featured: initialData?.is_featured || false,
    is_top_news: initialData?.is_top_news || false,
    is_photo_gallery: initialData?.is_photo_gallery || false,
  });

  useEffect(() => {
    const savedDraft = localStorage.getItem(`news_edit_draft_${newsId}`);
    if (savedDraft) {
      setFormData(JSON.parse(savedDraft));
    }
  }, [newsId]);

  useEffect(() => {
    if (formData.title || formData.content) {
      localStorage.setItem(
        `news_edit_draft_${newsId}`,
        JSON.stringify(formData),
      );
    }
  }, [formData, newsId]);

  // 🌟 Checkbox এবং সাধারণ ইনপুটের জন্য handleChange আপডেট করা হলো (HTMLTextAreaElement যুক্ত করা হয়েছে)
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const target = e.target;
    const name = target.name;

    // যদি ইনপুটটি চেকবক্স হয়, তাহলে value-এর বদলে checked প্রপার্টি নেব
    if (target.type === "checkbox") {
      const checked = (target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: target.value });
    }
  };

  const handleContentChange = (value: string) => {
    setFormData({ ...formData, content: value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const imageHandler = () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (file) {
        try {
          const mediaFormData = new FormData();
          mediaFormData.append("file", file);
          mediaFormData.append("alt_text", "editor-image");

          const uploadResult = await uploadMediaAction(mediaFormData);

          if (uploadResult.success && uploadResult.data?.file_url) {
            const imageUrl = uploadResult.data.file_url;
            const quill = quillRef.current.getEditor();
            const range = quill.getSelection(true);
            quill.insertEmbed(range.index, "image", imageUrl);
            quill.setSelection(range.index + 1);
          } else {
            alert("Failed to upload image in editor");
          }
        } catch (error) {
          console.error("Editor image upload error:", error);
          alert("An error occurred while uploading the image.");
        }
      }
    };
  };

  // 🌟 "আরও পড়ুন" বক্স ইনসার্ট করার ফাংশন
  const insertReadMoreBox = () => {
    if (!quillRef.current) {
      alert("Editor is not ready!");
      return;
    }

    const quill = quillRef.current.getEditor();
    const range = quill.getSelection(true);

    const htmlTemplate = `
      <div style="border: 1px solid #e5e7eb; margin: 20px 0; border-radius: 4px; overflow: hidden; font-family: sans-serif;">
        <div style="background-color: #cfe2ff; padding: 10px 15px; font-weight: bold; font-size: 18px; color: #000;">
          আরও পড়ুন
        </div>
        <ul style="list-style: none; padding: 0; margin: 0;">
          <li style="padding: 12px 15px; border-bottom: 1px dashed #9ca3af; display: flex; align-items: center; gap: 10px;">
            <span style="color: #2563eb; font-size: 14px;">◉</span>
            <a href="#" style="color: #0056b3; text-decoration: none; font-size: 16px; font-weight: 500;">এখানে প্রথম খবরের শিরোনাম দিন</a>
          </li>
          <li style="padding: 12px 15px; display: flex; align-items: center; gap: 10px;">
            <span style="color: #2563eb; font-size: 14px;">◉</span>
            <a href="#" style="color: #0056b3; text-decoration: none; font-size: 16px; font-weight: 500;">এখানে দ্বিতীয় খবরের শিরোনাম দিন</a>
          </li>
        </ul>
      </div>
      <p><br></p>
    `;

    quill.clipboard.dangerouslyPasteHTML(range.index, htmlTemplate);
    setTimeout(() => quill.setSelection(range.index + 1), 100);
  };

  const quillModules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          [{ font: [] }],
          [{ size: ["small", false, "large", "huge"] }],
          ["bold", "italic", "underline", "strike"],
          [{ color: [] }, { background: [] }],
          [{ script: "sub" }, { script: "super" }],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ indent: "-1" }, { indent: "+1" }],
          [{ align: [] }],
          ["blockquote", "code-block"],
          ["link", "image", "video"],
          ["clean"],
        ],
        handlers: { image: imageHandler },
      },
    }),
    [],
  );

  const renderCategoryOptions = (categories: any[], level = 0) => {
    return categories.map((cat) => (
      <React.Fragment key={cat.id}>
        <option value={cat.id}>
          {level > 0
            ? `${"\u00A0\u00A0\u00A0".repeat(level)} ↳ ${cat.name}`
            : cat.name}
        </option>
        {cat.children &&
          cat.children.length > 0 &&
          renderCategoryOptions(cat.children, level + 1)}
      </React.Fragment>
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.content || formData.content === "<p><br></p>") {
      alert("Content cannot be empty!");
      return;
    }

    setIsLoading(true);

    try {
      let finalThumbnailId =
        initialData?.thumbnail_id || initialData?.thumbnail?.id || null;
      let finalThumbnailurl =
        initialData?.seo_meta?.og_image ||
        initialData?.thumbnail?.file_url ||
        null;

      if (imageFile) {
        const mediaFormData = new FormData();
        mediaFormData.append("file", imageFile);
        mediaFormData.append("alt_text", formData.title);

        const uploadResult = await uploadMediaAction(mediaFormData);

        if (!uploadResult.success || !uploadResult.data) {
          alert("Failed to upload new thumbnail: " + uploadResult.message);
          setIsLoading(false);
          return;
        }

        finalThumbnailId = uploadResult.data.id;
        finalThumbnailurl = uploadResult.data.file_url;
      }

      const tagsArray = (formData.tags || "")
        .split(",")
        .map((tag: string) => tag.trim())
        .filter((tag: string) => tag !== "");

      const seoMetaObject = {
        meta_title: formData.title,
        keywords: formData.tags,
        og_image: finalThumbnailurl,
      };

      // 🌟 পেলোডে নতুন ফিল্ডগুলো যুক্ত করা হলো
      const newsPayload = {
        title: formData.title,
        short_desc: formData.short_desc,
        content: formData.content,
        category_id: formData.category_id,
        thumbnail_id: finalThumbnailId,
        tags: tagsArray,
        seo_meta: {
          ...seoMetaObject,
          meta_description: formData.short_desc,
        },

        status: formData.status,
        is_breaking: formData.is_breaking,
        is_featured: formData.is_featured,
        is_top_news: formData.is_top_news,
        is_photo_gallery: formData.is_photo_gallery,
      };

      const newsResult = await updateNewsAction(newsId, newsPayload);
      console.log(newsResult, "........");

      if (newsResult.success) {
        alert("News updated successfully!");
        localStorage.removeItem(`news_edit_draft_${newsId}`);
        //router.push("/reporter/dashboard/my-news");
      } else {
        alert(newsResult.message || "Failed to update news");
      }
    } catch (error) {
      alert("Something went wrong!");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-5xl bg-white p-8 rounded-xl shadow-sm border space-y-6"
    >
      <div className="flex justify-between items-center border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">Update Article</h2>
        {(formData.title !== initialData?.title ||
          formData.content !== initialData?.content) && (
          <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
            Unsaved changes
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full border rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Enter news title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Short Description
            </label>
            <textarea
              name="short_desc"
              rows={3}
              value={formData.short_desc}
              onChange={handleChange}
              className="w-full border rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              placeholder="Write a short summary (for SEO and list view)..."
            />
          </div>

          <div>
            {/* 🌟 Content লেবেলের পাশে "আরও পড়ুন" বাটন যুক্ত করা হয়েছে */}
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Content
              </label>
              <button
                type="button"
                onClick={insertReadMoreBox}
                className="bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 px-3 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                ➕ 'আরও পড়ুন' বক্স
              </button>
            </div>
            <div className="bg-white rounded-md">
              <ReactQuillWrapper
                forwardedRef={quillRef}
                theme="snow"
                value={formData.content}
                onChange={handleContentChange}
                modules={quillModules}
                className="h-[400px] mb-12"
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* 🌟 Editor Controls Section (New Fields) */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h3 className="text-sm font-semibold text-blue-800 mb-3 border-b border-blue-200 pb-2">
              Editor Controls
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full border border-blue-200 rounded-md px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PENDING">Pending (Review)</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_breaking"
                    checked={formData.is_breaking}
                    onChange={handleChange}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span className="text-sm text-gray-700 font-medium">
                    Breaking News
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={formData.is_featured}
                    onChange={handleChange}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span className="text-sm text-gray-700 font-medium">
                    Featured News
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_top_news"
                    checked={formData.is_top_news}
                    onChange={handleChange}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span className="text-sm text-gray-700 font-medium">
                    Top News
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_photo_gallery"
                    checked={formData.is_photo_gallery}
                    onChange={handleChange}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span className="text-sm text-gray-700 font-medium">
                    Photo Gallery
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Thumbnail Image Section */}
          <div className="bg-slate-50 p-4 rounded-lg border">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thumbnail Image
            </label>
            {imagePreview ? (
              <div className="relative mb-3">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-40 object-cover rounded-md border"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded shadow"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="w-full h-40 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center bg-white mb-3">
                <span className="text-sm text-gray-400">No image selected</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              name="category_id"
              required
              value={formData.category_id}
              onChange={handleChange}
              className="w-full border rounded-md px-4 py-2 bg-white outline-none"
            >
              <option value="" disabled>
                Select a category
              </option>
              {renderCategoryOptions(initialCategories)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags (Comma separated)
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="w-full border rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. Bangladesh, Politics"
            />
          </div>
        </div>
      </div>

      <div className="pt-4 border-t flex gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full md:w-auto px-8 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-md transition-colors disabled:opacity-50"
        >
          {isLoading ? "Updating..." : "Update News"}
        </button>
      </div>
    </form>
  );
};

export default EditorNewsEditForm;
