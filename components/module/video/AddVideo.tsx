"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { AddVideo } from '@/services/videos/video.service';
import { toast } from 'sonner';


const AddVideoForm = () => {
    const [url, setUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!url) return;

        setIsLoading(true);
        
        const result = await AddVideo({ url });
        
        if (result?.success) {
            setUrl(""); // ইনপুট ফাঁকা করে দিন
             toast.success("Video added successfully!"); 
        } else {
             toast.error(result?.message || "Failed to add video");
         
        }
        
        setIsLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full sm:w-auto">
            <Input 
                type="url" 
                placeholder="Enter Video URL..." 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                className="w-full sm:w-64"
            />
            <Button type="submit" disabled={isLoading} className="bg-red-600 hover:bg-red-700 text-white shrink-0">
                {isLoading ? "Adding..." : <><Plus className="w-4 h-4 mr-2"/> Add Video</>}
            </Button>
        </form>
    );
};

export default AddVideoForm;