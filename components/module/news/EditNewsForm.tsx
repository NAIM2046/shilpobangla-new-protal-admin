"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { uploadMediaAction } from '@/services/media/media.service';
// 🌟 আপনার আপডেট করার সার্ভিস ইমপোর্ট করুন
import { updateNewsAction } from '@/services/news/news.service'; 
import dynamic from 'next/dynamic';

// React-Quill-New ডাইনামিক ইম্পোর্ট (আগের মতোই)
const ReactQuillWrapper = dynamic(
    async () => {
        const { default: RQ } = await import('react-quill-new');
        return function ForwardedQuill({ forwardedRef, ...props }: any) {
            return <RQ ref={forwardedRef} {...props} />;
        };
    },
    { 
        ssr: false, 
        loading: () => <p className="text-gray-500 p-4 border rounded">Loading Editor...</p> 
    }
);
import 'react-quill-new/dist/quill.snow.css';

interface EditNewsFormProps {
    initialCategories: any[]; 
    initialData: any; // 🌟 আগের নিউজের ডাটা রিসিভ করার জন্য
    newsId: string;   // 🌟 কোন নিউজটা আপডেট হচ্ছে তার ID
}

const EditNewsForm = ({ initialCategories, initialData, newsId }: EditNewsFormProps) => {
    const router = useRouter();
    const quillRef = useRef<any>(null);

    const [isLoading, setIsLoading] = useState(false);
    console.log(initialData)
    
    const [imageFile, setImageFile] = useState<File | null>(null);
    // 🌟 ইনিশিয়াল ডাটা থেকে আগের ইমেজের URL বসিয়ে দিচ্ছি
    const [imagePreview, setImagePreview] = useState<string | null>(
        initialData?.thumbnail?.file_url || initialData?.seo_meta?.og_image || null
    );

    // 🌟 ইনিশিয়াল ডাটা দিয়ে ফর্মের স্টেট সেট করছি
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        content: initialData?.content || '', 
        category_id: initialData?.category?.id || initialData?.category_id || '',
       tags: Array.isArray(initialData?.tags) 
            ? initialData.tags.map((item: any) => item.tag.name).join(', ') 
            : (initialData?.seo_meta?.keywords || '')
    });

    // ড্রাফট লোড (এডিট পেজের জন্য আলাদা ড্রাফট কি ব্যবহার করা ভালো)
    useEffect(() => {
        const savedDraft = localStorage.getItem(`news_edit_draft_${newsId}`);
        if (savedDraft) {
            setFormData(JSON.parse(savedDraft));
        }
    }, [newsId]);

    // ড্রাফট সেভ
    useEffect(() => {
        if (formData.title || formData.content) {
            localStorage.setItem(`news_edit_draft_${newsId}`, JSON.stringify(formData));
        }
    }, [formData, newsId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
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

    // Quill ইমেজ হ্যান্ডলার (আগের মতোই)
    const imageHandler = () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const file = input.files?.[0];
            if (file) {
                try {
                    const mediaFormData = new FormData();
                    mediaFormData.append('file', file);
                    mediaFormData.append('alt_text', 'editor-image'); 

                    const uploadResult = await uploadMediaAction(mediaFormData);

                    if (uploadResult.success && uploadResult.data?.file_url) {
                        const imageUrl = uploadResult.data.file_url;
                        const quill = quillRef.current.getEditor();
                        const range = quill.getSelection(true);
                        quill.insertEmbed(range.index, 'image', imageUrl);
                        quill.setSelection(range.index + 1); 
                    } else {
                        alert('Failed to upload image in editor');
                    }
                } catch (error) {
                    console.error('Editor image upload error:', error);
                    alert('An error occurred while uploading the image.');
                }
            }
        };
    };

    const quillModules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                [{ 'font': [] }],
                [{ 'size': ['small', false, 'large', 'huge'] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'script': 'sub'}, { 'script': 'super' }],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'indent': '-1'}, { 'indent': '+1' }],
                [{ 'align': [] }],
                ['blockquote', 'code-block'],
                ['link', 'image', 'video'], 
                ['clean'] 
            ],
            handlers: { image: imageHandler }
        }
    }), []);

    const renderCategoryOptions = (categories: any[], level = 0) => {
        return categories.map((cat) => (
            <React.Fragment key={cat.id}>
                <option value={cat.id}>
                    {level > 0 ? `${'\u00A0\u00A0\u00A0'.repeat(level)} ↳ ${cat.name}` : cat.name}
                </option>
                {cat.children && cat.children.length > 0 && 
                    renderCategoryOptions(cat.children, level + 1)
                }
            </React.Fragment>
        ));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.content || formData.content === '<p><br></p>') {
            alert("Content cannot be empty!");
            return;
        }

        setIsLoading(true);

        try {
            // আগের ইমেজের আইডি ধরে রাখছি (যাতে নতুন ইমেজ না দিলে আগেরটাই থাকে)
            let finalThumbnailId = initialData?.thumbnail_id || initialData?.thumbnail?.id || null;
            let finalThumbnailurl = initialData?.seo_meta?.og_image || initialData?.thumbnail?.file_url || null;

            // 🌟 যদি ইউজার নতুন কোনো ছবি সিলেক্ট করে থাকে, তবেই আপলোড হবে
            if (imageFile) {
                const mediaFormData = new FormData();
                mediaFormData.append("file", imageFile);
                mediaFormData.append("alt_text", formData.title); 

                const uploadResult = await uploadMediaAction(mediaFormData);

                if (!uploadResult.success) {
                    alert("Failed to upload new thumbnail: " + uploadResult.message);
                    setIsLoading(false);
                    return; 
                }

                finalThumbnailId = uploadResult.data.id; 
                finalThumbnailurl = uploadResult.data.file_url; 
            }

                    const tagsArray = (formData.tags || '') 
                .split(',')
                .map((tag: string) => tag.trim())      // 🌟 (tag: string) ব্র্যাকেটসহ দিতে হবে
                .filter((tag: string) => tag !== '');
            const seoMetaObject = {
                meta_title: formData.title,
                keywords: formData.tags, 
                og_image: finalThumbnailurl 
            };

            const newsPayload = {
                title: formData.title,
                content: formData.content, 
                category_id: formData.category_id,
                thumbnail_id: finalThumbnailId, 
                tags: tagsArray,
                seo_meta: seoMetaObject
            };

            // 🌟 updateNewsAction কল করা হচ্ছে (newsId সহ)
            const newsResult = await updateNewsAction(newsId, newsPayload);

            if (newsResult.success) {
                alert("News updated successfully!");
                localStorage.removeItem(`news_edit_draft_${newsId}`); // আপডেট হলে ড্রাফট মুছে দাও
                router.push('/reporter/dashboard/my-news'); // লিস্ট পেজে ব্যাক করুন
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
        <form onSubmit={handleSubmit} className="max-w-5xl bg-white p-8 rounded-xl shadow-sm border space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-800">Update Article</h2>
                {(formData.title !== initialData?.title || formData.content !== initialData?.content) && (
                    <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">Unsaved changes</span>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input 
                            type="text" name="title" required
                            value={formData.title} onChange={handleChange}
                            className="w-full border rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Enter news title"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
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
                    <div className="bg-slate-50 p-4 rounded-lg border">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail Image</label>
                        {imagePreview ? (
                            <div className="relative mb-3">
                                <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-md border" />
                                <button 
                                    type="button" 
                                    onClick={() => { setImageFile(null); setImagePreview(null); }}
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select 
                            name="category_id" required
                            value={formData.category_id} onChange={handleChange}
                            className="w-full border rounded-md px-4 py-2 bg-white outline-none"
                        >
                            <option value="" disabled>Select a category</option>
                            {renderCategoryOptions(initialCategories)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tags (Comma separated)</label>
                        <input 
                            type="text" name="tags"
                            value={formData.tags} onChange={handleChange}
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
                    type="submit" disabled={isLoading}
                    className="w-full md:w-auto px-8 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-md transition-colors disabled:opacity-50"
                >
                    {isLoading ? "Updating..." : "Update News"}
                </button>
            </div>
        </form>
    );
};

export default EditNewsForm;