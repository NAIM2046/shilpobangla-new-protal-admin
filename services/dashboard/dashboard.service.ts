import { serverFetch } from "@/lib/server-fetch";

export const getAdminDashboardStatus = async () => {
    try { 
      
        const res = await serverFetch.get(`/dashboard/admin-stats`)

        const data = await res.json();
        return data;

    } catch (error) {
        console.error("Error fetching my news:", error);
        return { success: false, message: "Failed to fetch news" };
    }
};
export const getEditorDashboardStatus = async () => {
    try { 
      
        const res = await serverFetch.get(`/dashboard/editor-stats`)

        const data = await res.json();
        return data;

    } catch (error) {
        console.error("Error fetching my news:", error);
        return { success: false, message: "Failed to fetch news" };
    }
};
