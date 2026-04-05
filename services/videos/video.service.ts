"use server";

import { serverFetch } from "@/lib/server-fetch";
import { revalidatePath } from "next/cache";

export const getAllVideo = async ({
  page = 1,
  limit = 10,
 
}: {

  page?: number;
  limit?: number;
  

}) => {
  try {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
     
    });

    const res = await serverFetch.get(`/videos?${params}`, {
      cache: "no-store",
    });

    const data = await res.json();
    console.log(data ,  "........")

    if (!res.ok) {
      return {
        success: false,
        message: data?.message || "Failed to fetch users.",
        data: null,
      };
    }

    return data;
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Something went wrong while fetching users.",
      data: null,
    };
  }
};

export const AddVideo = async (payload: {
  title: string , 
  url: string,
  description: string
  
}) => {
  try {
    const res = await serverFetch.post("/videos", {
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        message: data?.message || "Failed to create user.",
        data: null,
      };
    }
    revalidatePath("/editor/dashboard/videos");

    return data;
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Something went wrong while creating user.",
      data: null,
    };
  }
};

export const deleteVideo = async (id : string) => {
  try {
    const res = await serverFetch.delete(`/videos/${id}`, );

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        message: data?.message || "Failed to create user.",
        data: null,
      };
    }
    revalidatePath("/editor/dashboard/videos");

    return data;
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Something went wrong while creating user.",
      data: null,
    };
  }
};