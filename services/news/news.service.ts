// actions/news.action.ts
"use server";

import { revalidatePath } from "next/cache";
import { serverFetch } from "@/lib/server-fetch"; 

export const addNewsAction = async (payload: any) => {
  try {
    
    const res = await serverFetch.post("/news/create", {
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        message: data?.message || "Failed to create news.",
      };
    }

   
    revalidatePath("/reporter/dashboard/my-news"); 

    return data;
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Something went wrong while creating news.",
    };
  }
};


export const getMyNewsAction = async (searchParams?: any) => {
    try { 
        const query = new URLSearchParams(searchParams || {}).toString();

       
        const res = await serverFetch.get(`/news/my-news?${query}`)

        const data = await res.json();
        return data;

    } catch (error) {
        console.error("Error fetching my news:", error);
        return { success: false, message: "Failed to fetch news" };
    }
};




export const getSingleNewsAction =   async (slug:string) => {
    try { 
        const res = await serverFetch.get(`/news/${slug}`)

        const data = await res.json();
        return data;

    } catch (error) {
        console.error("Error fetching my news:", error);
        return { success: false, message: "Failed to fetch news" };
    }
};

export const updateNewsAction = async ( newsId : string , payload: any) => {
  try {
    
    const res = await serverFetch.patch(`/news/${newsId}`, {
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        message: data?.message || "Failed to create news.",
      };
    }

   
    revalidatePath("/reporter/dashboard/my-news"); 

    return data;
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Something went wrong while creating news.",
    };
  }
};

export const getAllNewsAction = async (searchParams?: any) => {
    try { 
        const query = new URLSearchParams(searchParams || {}).toString();

       
        const res = await serverFetch.get(`/news?${query}`)

        const data = await res.json();
        return data;

    } catch (error) {
        console.error("Error fetching my news:", error);
        return { success: false, message: "Failed to fetch news" };
    }
};