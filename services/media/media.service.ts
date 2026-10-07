"use server";

import { revalidatePath } from "next/cache";
import { serverFetch } from "@/lib/server-fetch"; // 

export type UploadMediaResponse =
  | {
      success: true;
      message: string;
      data: {
        id: string;
        file_url: string;
        url?: string;
        file_name?: string;
        alt_text?: string;
      };
      media?: any;
    }
  | {
      success: false;
      message: string;
      data: null;
    };

export const uploadMediaAction = async (
  formData: FormData
): Promise<UploadMediaResponse> => {
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

    const mediaObj = data.data || data.media || data;
    return {
      success: true,
      message: data.message || "Media uploaded successfully",
      data: {
        id: mediaObj.id,
        file_url: mediaObj.file_url || mediaObj.url,
        url: mediaObj.url || mediaObj.file_url,
        file_name: mediaObj.file_name || mediaObj.fileName || "",
        alt_text: mediaObj.alt_text || "",
      },
      media: data.media || mediaObj,
    }; 
  } catch (error: any) {
    console.error("Upload Action Error:", error);
    return {
      success: false,
      message: error?.message || "Something went wrong while uploading.",
      data: null
    };
  }
};