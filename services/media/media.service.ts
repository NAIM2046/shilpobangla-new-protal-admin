"use server";

import { revalidatePath } from "next/cache";
import { serverFetch } from "@/lib/server-fetch"; // 

export const uploadMediaAction = async (formData: FormData) => {
  try {
  
    const res = await serverFetch.post("/media/upload", {
      body: formData,
     
    });

    const data = await res.json();
   // console.log(data)

    if (!res.ok) {
      return {
        success: false,
        message: data?.message || "Failed to upload image.",
        data: null
      };
    }

    
    revalidatePath("/editor/dashboard/media"); 

   return data 
  } catch (error: any) {
    console.error("Upload Action Error:", error);
    return {
      success: false,
      message: error?.message || "Something went wrong while uploading.",
      data: null
    };
  }
};