import { UserRole } from "@/lib/auth-utils";
import { serverFetch } from "@/lib/server-fetch";

export const getAllUsers = async ({
  page = 1,
  limit = 10,
  search = "",
}: {

  page?: number;
  limit?: number;
  search?: string;

}) => {
  try {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      search,
    });

    const res = await serverFetch.get(`/user?${params}`, {
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

export const getUserById = async (id: string) => {
  try {
    const res = await serverFetch.get(`/user/${id}`);
    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        message: data?.message || "Failed to fetch user.",
        data: null,
      };
    }

    return data;
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Something went wrong while fetching user.",
      data: null,
    };
  }
};

export const createUser = async (payload: {
    name : string , 
    email: string , 
    role: UserRole
}) => {
  try {
    const res = await serverFetch.post("/user", {
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

    return data;
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Something went wrong while creating user.",
      data: null,
    };
  }
};

export const updateUser = async (
  id: string,
  payload: {
    name?: string;
    email?: string;
    role?: UserRole
  }
) => {
  try {
    const res = await serverFetch.put(`/user/${id}`, {
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        message: data?.message || "Failed to update user.",
        data: null,
      };
    }

    return data;
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Something went wrong while updating user.",
      data: null,
    };
  }
};

export const deleteUser = async (id: string) => {
  try {
    const res = await serverFetch.delete(`/user/${id}`);
    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        message: data?.message || "Failed to delete user.",
        data: null,
      };
    }

    return data;
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Something went wrong while deleting user.",
      data: null,
    };
  }
};