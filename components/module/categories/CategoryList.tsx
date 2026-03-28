// components/categories/CategoryList.tsx
"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Edit, Trash2, Search } from "lucide-react";
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
  DialogFooter,
} from "@/components/ui/dialog";
import AddCategoryForm from "./AddCategoryForm";
import { deleteCategory, updateCategory } from "@/services/categories/categories.service";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export interface Category {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  children?: Category[];
  parent_id?: string | null;
}

export default function CategoryList({ initialCategories }: { initialCategories: Category[] }) {
  const router = useRouter() ;
  
  // 🌟 States
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // 🌟 Edit Form Setup
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<Category>();

  // ==========================================
  // ১. Search Logic (Recursive Filtering)
  // ==========================================
  const filterCategories = (categories: Category[], term: string): Category[] => {
    if (!term) return categories;
    const lowerTerm = term.toLowerCase();

    return categories.reduce((acc: Category[], category) => {
      // নিজের নাম বা স্লাগের সাথে মেলে কি না চেক
      const isMatch = category.name.toLowerCase().includes(lowerTerm) || category.slug.toLowerCase().includes(lowerTerm);
      // চিলড্রেনদের মধ্যে মেলে কি না চেক
      const filteredChildren = category.children ? filterCategories(category.children, term) : [];

      if (isMatch || filteredChildren.length > 0) {
        acc.push({ ...category, children: filteredChildren });
      }
      return acc;
    }, []);
  };

  const filteredCategories = filterCategories(initialCategories, searchTerm);

  // ==========================================
  // ২. Delete Logic
  // ==========================================
  const handleDelete = async (id: string, name: string) => {
    const isConfirmed = window.confirm(`Are you sure you want to delete "${name}"?`);
    if (isConfirmed) {
      console.log("Deleting Category ID:", id);
      const result = await deleteCategory(id) ;

       if(result.success){
      toast.success(`${result.message}`)
      router.refresh() ;
    }
    else{
      toast.error(`${result.message}`)
    }
    }
  };

  // ==========================================
  // ৩. Edit Logic
  // ==========================================
  const openEditModal = (category: Category) => {
    setSelectedCategory(category);
  
    setValue("name", category.name);
    setValue("slug", category.slug);
    setValue("is_active", category.is_active);
    setIsEditOpen(true);
  };

  const onEditSubmit = async (data: Category) => {
    console.log("Updated Data for ID:", selectedCategory?.id, data);
   
     
    const result = await updateCategory(data , selectedCategory?.id as string) ; 
     
    if(result.success){
      toast.success(`${result.message}`)
      router.refresh() ;
    }
    else{
      toast.error(`${result.message}`)
    }
    
    setIsEditOpen(false);
    reset();
  };

  // ==========================================
  // Render Row Function
  // ==========================================
  const renderCategoryRow = (category: Category, level: number = 0) => {
    return (
      <React.Fragment key={category.id}>
        <TableRow className="hover:bg-slate-50">
          <TableCell className="font-medium text-gray-900">
            <div style={{ paddingLeft: `${level * 24}px` }} className="flex items-center">
              {level > 0 && <span className="text-gray-400 mr-2">└─</span>}
              {category.name}
            </div>
          </TableCell>
          <TableCell className="text-gray-500">{category.slug}</TableCell>
          <TableCell>
            <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                category.is_active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
              }`}>
              {category.is_active ? "Active" : "Inactive"}
            </span>
          </TableCell>
          <TableCell className="text-right space-x-2">
            {/* 🌟 Edit Button */}
            <Button 
              onClick={() => openEditModal(category)}
              variant="outline" 
              size="icon" 
              className="h-8 w-8 text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <Edit className="w-4 h-4" />
            </Button>
            {/* 🌟 Delete Button */}
            <Button 
              onClick={() => handleDelete(category.id, category.name)}
              variant="outline" 
              size="icon" 
              className="h-8 w-8 text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </TableCell>
        </TableRow>
        {category.children && category.children.map((child) => renderCategoryRow(child, level + 1))}
      </React.Fragment>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Categories</h1>
          <p className="text-sm text-gray-500">Manage your news categories and sub-categories.</p>
        </div>
        <AddCategoryForm categories={initialCategories} /> 
      </div>

      {/* 🌟 Search Input */}
      <div className="flex items-center w-full max-w-sm relative">
        <Search className="w-4 h-4 absolute left-3 text-gray-400" />
        <Input 
          type="text" 
          placeholder="Search categories..." 
          className="pl-9" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Category Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* 🌟 Filtered Data Render */}
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category) => renderCategoryRow(category, 0))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10 text-gray-500">
                  No categories found matching "{searchTerm}".
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* 🌟 Edit Category Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onEditSubmit)} className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Category Name</label>
              <Input 
                {...register("name", { required: "Name is required" })} 
                className="mt-1"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message as string}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Slug</label>
              <Input 
                {...register("slug", { required: "Slug is required" })} 
                className="mt-1"
              />
              {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug.message as string}</p>}
            </div>

            {/* Status Toggle (Optional but good to have) */}
            <div className="flex items-center gap-2 mt-4">
              <input type="checkbox" id="is_active" {...register("is_active")} className="w-4 h-4" />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-700">Is Active?</label>
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Update Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
