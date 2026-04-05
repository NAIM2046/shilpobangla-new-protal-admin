// components/live-updates/LiveUpdateList.tsx
"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Plus,
  Edit,
  ExternalLink,
  Zap,
  Clock,
  Info,
  Loader2,
} from "lucide-react";
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
  DialogDescription,
} from "@/components/ui/dialog";
import {
  createLiveUpdate,
  toggleLiveUpdate,
  updateLiveUpdate,
} from "@/services/live-update/live-update.service";
import { toast } from "sonner";

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

export default function LiveUpdateList({
  initialUpdates,
}: {
  initialUpdates: LiveUpdate[];
}) {
  const [updates, setUpdates] = useState<LiveUpdate[]>(initialUpdates);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUpdate, setSelectedUpdate] = useState<LiveUpdate | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>();

  // Helper function to format date nicely
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "Never Expires";
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

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
      expires_at: data.expires_at
        ? new Date(data.expires_at).toISOString()
        : null,
    };

    const result = await createLiveUpdate(payload);
    if (result.success) {
      toast.success(result.message || "Successfully created!");
      setUpdates([
        { id: Date.now().toString(), ...payload } as LiveUpdate,
        ...updates,
      ]);
      setIsAddOpen(false);
    } else {
      toast.error(result.message || "Failed to create.");
    }
    setIsLoading(false);
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
      formattedDate = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
    }
    setValue("expires_at", formattedDate);
    setIsEditOpen(true);
  };

  const onEditSubmit = async (data: FormData) => {
    if (!selectedUpdate) return;
    setIsLoading(true);

    const payload = {
      ...data,
      expires_at: data.expires_at
        ? new Date(data.expires_at).toISOString()
        : null,
    };

    const result = await updateLiveUpdate(payload, selectedUpdate.id);
    if (result.success) {
      toast.success(result.message || "Successfully updated!");
      setUpdates(
        updates.map((item) =>
          item.id === selectedUpdate.id ? { ...item, ...payload } : item,
        ),
      );
      setIsEditOpen(false);
    } else {
      toast.error(result.message || "Failed to update.");
    }
    setIsLoading(false);
  };

  // ==========================================
  // ৩. Status Toggle
  // ==========================================
  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    const result = await toggleLiveUpdate(id, newStatus);

    if (result.success) {
      toast.success(result.message || "Status updated!");
      setUpdates(
        updates.map((item) =>
          item.id === id ? { ...item, is_active: newStatus } : item,
        ),
      );
    } else {
      toast.error(result.message || "Failed to change status.");
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* 🌟 Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Zap className="text-red-500 w-6 h-6" />
            Live Updates & Breaking News
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your frontend scrolling ticker and breaking news alerts
            instantly.
          </p>
        </div>
        <Button
          onClick={openAddModal}
          className="bg-red-600 hover:bg-red-700 text-white shadow-md transition-all hover:shadow-lg"
        >
          <Plus className="w-5 h-5 mr-1" />
          Add New Update
        </Button>
      </div>

      {/* 🌟 Table Section */}
      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50 border-b">
            <TableRow>
              <TableHead className="w-[45%] font-semibold text-gray-700">
                News Title
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                Type
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                Expires At
              </TableHead>
              <TableHead className="text-center font-semibold text-gray-700">
                Visibility
              </TableHead>
              <TableHead className="text-right font-semibold text-gray-700 pr-6">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {updates.length > 0 ? (
              updates.map((item) => (
                <TableRow
                  key={item.id}
                  className={`transition-colors ${!item.is_active ? "bg-gray-50/50" : "hover:bg-slate-50"}`}
                >
                  {/* Title Column */}
                  <TableCell className="py-4">
                    <div className="flex flex-col gap-1">
                      <span
                        className={`font-medium text-base ${!item.is_active ? "text-gray-500 line-through" : "text-gray-900"}`}
                      >
                        {item.title}
                      </span>
                      {item.link && (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline w-fit"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" /> View Link
                        </a>
                      )}
                    </div>
                  </TableCell>

                  {/* Type Column */}
                  <TableCell>
                    {item.is_breaking ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                        <Zap className="w-3 h-3 mr-1" /> Breaking
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                        <Info className="w-3 h-3 mr-1" /> Normal
                      </span>
                    )}
                  </TableCell>

                  {/* Date Column */}
                  <TableCell>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                      {formatDate(item.expires_at)}
                    </div>
                  </TableCell>

                  {/* Status Column */}
                  <TableCell className="text-center">
                    <Button
                      onClick={() =>
                        handleToggleStatus(item.id, item.is_active)
                      }
                      variant={item.is_active ? "default" : "outline"}
                      size="sm"
                      className={`h-8 w-24 text-xs rounded-full transition-all ${item.is_active ? "bg-emerald-500 hover:bg-emerald-600 text-white border-transparent" : "text-gray-600 border-gray-300 hover:bg-gray-100"}`}
                    >
                      {item.is_active ? "Live Now" : "Hidden"}
                    </Button>
                  </TableCell>

                  {/* Actions Column */}
                  <TableCell className="text-right pr-6">
                    <Button
                      onClick={() => openEditModal(item)}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              // Empty State
              <TableRow>
                <TableCell colSpan={5} className="text-center py-20">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="bg-slate-100 p-4 rounded-full">
                      <Zap className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-lg font-medium text-slate-900">
                      No updates found
                    </p>
                    <p className="text-sm text-slate-500 max-w-sm mx-auto">
                      You haven't added any live updates yet. Click the "Add New
                      Update" button to create your first ticker.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* 🌟 Add Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden">
          <div className="p-6 bg-slate-50 border-b">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Plus className="w-5 h-5 text-red-600" /> Create Live Update
            </DialogTitle>
            <DialogDescription className="mt-1.5 text-gray-500">
              This will instantly appear on the website ticker once saved.
            </DialogDescription>
          </div>

          <form onSubmit={handleSubmit(onAddSubmit)} className="p-6 space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Update Title <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g. Bangladesh wins the match by 5 wickets..."
                {...register("title", { required: "Title is required" })}
                className="focus-visible:ring-red-500"
              />
              {errors.title && (
                <p className="text-red-500 text-xs">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Target Link{" "}
                <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <Input
                placeholder="https://example.com/news/123"
                {...register("link")}
                className="focus-visible:ring-red-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">
                  Expiration Date{" "}
                  <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <Input
                  type="datetime-local"
                  {...register("expires_at")}
                  className="focus-visible:ring-red-500"
                />
              </div>

              <div className="flex items-center gap-3 md:mt-7 bg-red-50 border border-red-100 p-3 rounded-lg">
                <input
                  type="checkbox"
                  id="is_breaking_add"
                  {...register("is_breaking")}
                  className="w-4 h-4 rounded text-red-600 focus:ring-red-500 accent-red-600"
                />
                <label
                  htmlFor="is_breaking_add"
                  className="text-sm font-semibold text-red-800 cursor-pointer select-none"
                >
                  Mark as Breaking News
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 mt-2 border-t">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsAddOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white min-w-[120px]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving
                  </>
                ) : (
                  "Publish Update"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* 🌟 Edit Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden">
          <div className="p-6 bg-slate-50 border-b">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Edit className="w-5 h-5 text-blue-600" /> Edit Live Update
            </DialogTitle>
          </div>

          <form onSubmit={handleSubmit(onEditSubmit)} className="p-6 space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Update Title <span className="text-red-500">*</span>
              </label>
              <Input
                {...register("title", { required: "Title is required" })}
                className="focus-visible:ring-blue-500"
              />
              {errors.title && (
                <p className="text-red-500 text-xs">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Target Link{" "}
                <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <Input
                {...register("link")}
                className="focus-visible:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">
                  Expiration Date{" "}
                  <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <Input
                  type="datetime-local"
                  {...register("expires_at")}
                  className="focus-visible:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-3 md:mt-7 bg-red-50 border border-red-100 p-3 rounded-lg">
                <input
                  type="checkbox"
                  id="is_breaking_edit"
                  {...register("is_breaking")}
                  className="w-4 h-4 rounded text-red-600 focus:ring-red-500 accent-red-600"
                />
                <label
                  htmlFor="is_breaking_edit"
                  className="text-sm font-semibold text-red-800 cursor-pointer select-none"
                >
                  Mark as Breaking News
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 mt-2 border-t">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsEditOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Updating
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
