"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { uploadMediaAction } from '@/services/media/media.service';
import { addNewsAction } from '@/services/news/news.service';
import dynamic from 'next/dynamic';

// 🌟 React-Quill-New ডাইনামিক ইম্পোর্ট
const ReactQuillWrapper = dynamic(
    async () => {
        const { default: RQ } = await import('react-quill-new');
        // টাইপস্ক্রিপ্টকে বোকা বানানোর জন্য ref-কে forwardedRef নামে পাস করছি
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

interface AddNewsFormProps {
    initialCategories: any[]; 
}

const AddNewsForm = ({ initialCategories }: AddNewsFormProps) => {
    const router = useRouter();
    const quillRef = useRef<any>(null); // Quill Editor-এর রেফারেন্স

    const [isLoading, setIsLoading] = useState(false);
    
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        content: '', 
        category_id: '',
        tags: ''
    });

    // 🌟 ড্রাফট লোড
    useEffect(() => {
        const savedDraft = localStorage.getItem('news_draft');
        if (savedDraft) {
            setFormData(JSON.parse(savedDraft));
        }
    }, []);

    // 🌟 ড্রাফট সেভ
    useEffect(() => {
        if (formData.title || formData.content) {
            localStorage.setItem('news_draft', JSON.stringify(formData));
        }
    }, [formData]);

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

    // 🌟 কাস্টম ইমেজ আপলোড হ্যান্ডলার (Quill-এর জন্য)
    const imageHandler = () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const file = input.files?.[0];
            if (file) {
                try {
                    // API-তে পাঠানোর জন্য FormData তৈরি
                    const mediaFormData = new FormData();
                    mediaFormData.append('file', file);
                    mediaFormData.append('alt_text', 'editor-image'); // অপশনাল

                    // আপনার API কল করা হচ্ছে
                    const uploadResult = await uploadMediaAction(mediaFormData);
                    console.log(uploadResult , ".............") 

                    if (uploadResult.success && uploadResult.data?.file_url) {
                        // ব্যাকএন্ড থেকে আসা পাবলিক URL
                        const imageUrl = uploadResult.data.file_url;

                        // এডিটরের বর্তমান পজিশন বের করে ইমেজ বসানো
                        const quill = quillRef.current.getEditor();
                        const range = quill.getSelection(true);
                        quill.insertEmbed(range.index, 'image', imageUrl);
                        quill.setSelection(range.index + 1); // কার্সর ইমেজের পরে নেওয়া
                    } else {
                        alert('Failed to upload image in editor: ' + (uploadResult.message || 'Unknown error'));
                    }
                } catch (error) {
                    console.error('Editor image upload error:', error);
                    alert('An error occurred while uploading the image.');
                }
            }
        };
    };

    // 🌟 Quill মডিউলস (useMemo ব্যবহার করা জরুরি, নাহলে টাইপিংয়ের সময় এডিটর ফোকাস হারাবে)
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
            handlers: {
                image: imageHandler // আমাদের তৈরি কাস্টম ফাংশনটি যুক্ত করা হলো
            }
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
            let finalThumbnailId = null;
            let finalThumbnailurl = null ;

            // মূল থাম্বনেইল আপলোড (যদি থাকে)
            if (imageFile) {
                const mediaFormData = new FormData();
                mediaFormData.append("file", imageFile);
                mediaFormData.append("alt_text", formData.title); 

                const uploadResult = await uploadMediaAction(mediaFormData);

                if (!uploadResult.success) {
                    alert("Failed to upload thumbnail: " + uploadResult.message);
                    setIsLoading(false);
                    return; 
                }

                finalThumbnailId = uploadResult.data.id; 
                finalThumbnailurl = uploadResult.data.file_url; 
            }

            const tagsArray = formData.tags
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag !== '');

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
                tags: tagsArray ,
                seo_meta: seoMetaObject
            };

            const newsResult = await addNewsAction(newsPayload);

            if (newsResult.success) {
                alert("News published successfully!");
                localStorage.removeItem('news_draft');
                router.push('/editor/dashboard/news'); 
            } else {
                alert(newsResult.message || "Failed to create news");
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
                <h2 className="text-2xl font-bold text-gray-800">Create New Article</h2>
                {(formData.title || formData.content) && (
                    <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Draft saved automatically</span>
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
                        
                       <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <div className="bg-white rounded-md">
                    <ReactQuillWrapper 
                        forwardedRef={quillRef} // 🌟 ref-এর বদলে forwardedRef
                        theme="snow" 
                        value={formData.content} 
                        onChange={handleContentChange} 
                        modules={quillModules}
                        className="h-[400px] mb-12" 
                        placeholder="Write the full news content here..."
                    />
                </div>
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

            <div className="pt-4 border-t">
                <button 
                    type="submit" disabled={isLoading}
                    className="w-full md:w-auto px-8 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-md transition-colors disabled:opacity-50"
                >
                    {isLoading ? "Publishing..." : "Publish News"}
                </button>
            </div>
        </form>
    );
};

export default AddNewsForm;