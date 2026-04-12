import { serverFetch } from "@/lib/server-fetch";

export const getAllLiveUpdate = async () => {
  try {
   
    const res = await serverFetch.get(`/live-updates`, {
      cache: "no-store",
    });

    const data = await res.json();
    //console.log(data ,  "........")

    if (!res.ok) {
      return {
        success: false,
        message: data?.message || "Failed to fetch Live Update.",
        data: null,
      };
    }

    return data;
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Something went wrong while fetching Live Update.",
      data: null,
    };
  }
};

export const toggleLiveUpdate = async (id: string , is_active : boolean) => {
  try {
   
    const res = await serverFetch.patch(`/live-updates/${id}/status`, {
      body: JSON.stringify({is_active}),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
   // console.log(data ,  "........")

    if (!res.ok) {
      return {
        success: false,
        message: data?.message || "Failed to change state Live Update.",
        data: null,
      };
    }

    return data;
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Something went wrong while change state Live Update.",
      data: null,
    };
  }
};

export const createLiveUpdate = async (payload: any) => {
  try {
    const res = await serverFetch.post("/live-updates", {
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        message: data?.message || "Failed to create live update .",
        data: null,
      };
    }

    return data;
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Something went wrong while creating live update.",
      data: null,
    };
  }
};

export const updateLiveUpdate = async (payload: any , id : string) => {
  try {
    const res = await serverFetch.patch(`/live-updates/${id}`, {
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        message: data?.message || "Failed to create live update .",
        data: null,
      };
    }

    return data;
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Something went wrong while creating live update.",
      data: null,
    };
  }
};

