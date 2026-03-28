// components/categories/AddCategoryForm.tsx
"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Category } from "./CategoryList";
import { createCategory } from "@/services/categories/categories.service";
import { toast } from "sonner";
import { useRouter } from "next/navigation";



type FormData = {
  name: string;
  parent_id: string; 
  is_active: boolean;
};


export default function AddCategoryForm({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
   
    const payload = {
      ...data,
      parent_id: data.parent_id === "" ? null : data.parent_id,
      is_active: true, 
    };

    console.log("Form Data Submitted:", payload);
    const result = await createCategory(payload) ; 
    if(result.success){
      toast.success(`${result.message}`)
    }
    else{
       toast.error(`${result.message}`)
    }
    
    router.refresh() ; 
    
    reset(); 
    setIsOpen(false); 
  };

   

  
  const renderCategoryOptions = (categoryList: Category[], prefix = "") => {
    return categoryList.map((cat) => (
      <React.Fragment key={cat.id}>
        <option value={cat.id}>
          {prefix} {cat.name}
        </option>
        
        {cat.children && cat.children.length > 0 && 
          renderCategoryOptions(cat.children, prefix + "--- ")
        }
      </React.Fragment>
    ));
  };



  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Category</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Category Name</label>
            <Input 
              {...register("name", { required: "Name is required" })} 
              placeholder="e.g. খেলাধুলা" 
              className="mt-1"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

         

          {/* 🌟 Parent Category Dropdown */}
          <div>
            <label className="text-sm font-medium text-gray-700">Parent Category (Optional)</label>
            <select
              {...register("parent_id")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mt-1"
            >
              <option value="">None (Main Category)</option>
              {renderCategoryOptions(categories)}
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Save Category
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}