import AddNewsForm from "@/components/module/news/AddNewsForm";
import { getAllCategory } from "@/services/categories/categories.service";
import React from "react";

const AddNewsPage = async () => {
  const categoryData = await getAllCategory();

  const categories = categoryData.data || [];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Add News</h1>
      </div>

      <AddNewsForm initialCategories={categories} />
    </div>
  );
};

export default AddNewsPage;
