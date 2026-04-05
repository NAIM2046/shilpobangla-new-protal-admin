// app/admin/categories/page.tsx

import CategoryList from "@/components/module/categories/CategoryList";

import { getAllCategory } from "@/services/categories/categories.service";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  let categories = [];
  const result = await getAllCategory();
  categories = result?.data;
  console.log("Fetched Categories:", categories); // ডিবাগিং এর জন্য কনসোল লগ

  // ২. ডাটাগুলো CategoryList কম্পোনেন্টে পাঠিয়ে দিচ্ছি
  return <CategoryList initialCategories={categories} />;
}
