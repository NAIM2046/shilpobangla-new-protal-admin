import { serverFetch } from "@/lib/server-fetch";

export const getAllCategory = async () => {
  try {
   
    const res = await serverFetch.get(`/categories`, {
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

export const createCategory = async (payload: any) => {
  try {
    const res = await serverFetch.post("/categories/create-category", {
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        message: data?.message || "Failed to create category.",
        data: null,
      };
    }

    return data;
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Something went wrong while creating category.",
      data: null,
    };
  }
};

export const updateCategory = async (payload: any , id : string) => {
  try {
    const res = await serverFetch.patch(`/categories/${id}`, {
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        message: data?.message || "Failed to create category.",
        data: null,
      };
    }

    return data;
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Something went wrong while creating category.",
      data: null,
    };
  }
};

export const deleteCategory = async ( id : string) => {
  try {
    const res = await serverFetch.delete(`/categories/${id}`);

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        message: data?.message || "Failed to create category.",
        data: null,
      };
    }

    return data;
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Something went wrong while creating category.",
      data: null,
    };
  }
};