// components/live-updates/LiveUpdateList.tsx
"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Plus, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createLiveUpdate, toggleLiveUpdate, updateLiveUpdate } from "@/services/live-update/live-update.service";
import { toast } from "sonner";

// টাইপ ডিফাইন
export interface LiveUpdate {
  id: string;
  title: string;
  link?: string | null;
  is_active: boolean;
  is_breaking: boolean;
  expires_at?: string | null;
  created_at?: string;
}

type FormData = {
  title: string;
  link: string;
  is_breaking: boolean;
  expires_at: string;
};

// 🌟 Server থেকে initialUpdates প্রপস হিসেবে রিসিভ করছি
export default function LiveUpdateList({ initialUpdates }: { initialUpdates: LiveUpdate[] }) {
  // useEffect-এর বদলে সরাসরি initialUpdates দিয়ে state শুরু করছি
  const [updates, setUpdates] = useState<LiveUpdate[]>(initialUpdates);
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUpdate, setSelectedUpdate] = useState<LiveUpdate | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>();

  // ==========================================
  // ১. Add Update
  // ==========================================
  const openAddModal = () => {
    reset({ title: "", link: "", is_breaking: false, expires_at: "" });
    setIsAddOpen(true);
  };

  const onAddSubmit = async (data: FormData) => {
    setIsLoading(true);
    const payload = {
      ...data,
      is_active: true,
      expires_at: data.expires_at ? new Date(data.expires_at).toISOString() : null,
    };

    console.log("Submitting New:", payload);
    // TODO: POST API Call here
    const result = await createLiveUpdate(payload) ;
    if(result.success){
        toast.success(`${result.message}`)
       setUpdates([{ id: Date.now().toString(), ...payload } as LiveUpdate, ...updates]);
    }
    else{
         toast.error(`${result.message}`)
    }
   
    setIsLoading(false);
    setIsAddOpen(false);
  };

  // ==========================================
  // ২. Edit Update
  // ==========================================
  const openEditModal = (item: LiveUpdate) => {
    setSelectedUpdate(item);
    setValue("title", item.title);
    setValue("link", item.link || "");
    setValue("is_breaking", item.is_breaking);
    
    let formattedDate = "";
    if (item.expires_at) {
      const d = new Date(item.expires_at);
      formattedDate = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    }
    setValue("expires_at", formattedDate);
    
    setIsEditOpen(true);
  };

  const onEditSubmit = async (data: FormData) => {
    if (!selectedUpdate) return;
    setIsLoading(true);

    const payload = {
      ...data,
      expires_at: data.expires_at ? new Date(data.expires_at).toISOString() : null,
    };

    console.log(`Updating ID ${selectedUpdate.id}:`, payload);
   
    const result = await updateLiveUpdate( payload , selectedUpdate.id) 
    if(result.success){
      toast.success(`${result.message}`) ;
       setUpdates(updates.map(item => 
      item.id === selectedUpdate.id ? { ...item, ...payload } : item
    ));
    }
    else{
      toast.error(`${result.message}`)
    }
    
   

    setIsLoading(false);
    setIsEditOpen(false);
  };

  // ==========================================
  // ৩. Status Toggle
  // ==========================================
  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    // TODO: PATCH API Call here
    const result = await toggleLiveUpdate(id , newStatus) ;
    if(result.success){
      toast.success(`${result.message}`) ;
      setUpdates(updates.map(item => item.id === id ? { ...item, is_active: newStatus } : item));
    }
    else{
      toast.error(`${result.message}`)
    }
   
  };

  // ==========================================
  // ৪. Delete Update
  // ==========================================
  const handleDelete = async (id: string) => {
    if(window.confirm("Are you sure you want to delete this update?")) {
      console.log("Deleting ID:", id);
      // TODO: DELETE API Call here
      const result = await 
      setUpdates(updates.filter(item => item.id !== id));
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Live Updates & Breaking News</h1>
          <p className="text-sm text-gray-500">Manage scrolling texts and breaking news alerts.</p>
        </div>
        <Button onClick={openAddModal} className="bg-red-600 hover:bg-red-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Live Update
        </Button>
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Expires At</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {updates.length > 0 ? (
              updates.map((item) => (
                <TableRow key={item.id} className={!item.is_active ? "opacity-60 bg-gray-50" : ""}>
                  <TableCell className="font-medium text-gray-900 max-w-xs truncate">
                    {item.title}
                    {item.link && (
                      <a href={item.link} target="_blank" rel="noreferrer" className="block text-xs text-blue-500 hover:underline mt-1">
                        View Link
                      </a>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.is_breaking ? (
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">Breaking</span>
                    ) : (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">Normal</span>
                    )}
                  </TableCell>
                  <TableCell className="text-gray-500 text-sm">
                    {item.expires_at ? new Date(item.expires_at).toLocaleString() : "Never"}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button 
                      onClick={() => handleToggleStatus(item.id, item.is_active)}
                      variant={item.is_active ? "default" : "secondary"}
                      size="sm"
                      className={`h-7 w-20 text-xs ${item.is_active ? "bg-emerald-500 hover:bg-emerald-600" : "bg-gray-300 text-gray-700"}`}
                    >
                      {item.is_active ? "Active" : "Inactive"}
                    </Button>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button onClick={() => openEditModal(item)} variant="outline" size="icon" className="h-8 w-8 text-blue-600 border-blue-200 hover:bg-blue-50">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button onClick={() => handleDelete(item.id)} variant="outline" size="icon" className="h-8 w-8 text-red-600 border-red-200 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-gray-500">
                  No live updates found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>Create New Live Update</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onAddSubmit)} className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Update Title *</label>
              <Input {...register("title", { required: "Title is required" })} className="mt-1" />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Link (Optional)</label>
              <Input {...register("link")} className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Expiration Date (Optional)</label>
                <Input type="datetime-local" {...register("expires_at")} className="mt-1" />
              </div>
              <div className="flex items-center gap-2 mt-7">
                <input type="checkbox" id="is_breaking_add" {...register("is_breaking")} className="w-4 h-4 rounded text-red-600" />
                <label htmlFor="is_breaking_add" className="text-sm font-medium text-gray-700">Is Breaking News?</label>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-red-600 hover:bg-red-700" disabled={isLoading}>{isLoading ? "Saving..." : "Save Update"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>Edit Live Update</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onEditSubmit)} className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Update Title *</label>
              <Input {...register("title", { required: "Title is required" })} className="mt-1" />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Link (Optional)</label>
              <Input {...register("link")} className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Expiration Date (Optional)</label>
                <Input type="datetime-local" {...register("expires_at")} className="mt-1" />
              </div>
              <div className="flex items-center gap-2 mt-7">
                <input type="checkbox" id="is_breaking_edit" {...register("is_breaking")} className="w-4 h-4 rounded text-red-600" />
                <label htmlFor="is_breaking_edit" className="text-sm font-medium text-gray-700">Is Breaking News?</label>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isLoading}>{isLoading ? "Updating..." : "Update Changes"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}