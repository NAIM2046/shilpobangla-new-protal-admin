// app/admin/categories/page.tsx

import CategoryList from "@/components/module/categories/CategoryList";
import { serverFetch } from "@/lib/server-fetch";
import { getAllCategory } from "@/services/categories/categories.service";

// Next.js কে বলে দিচ্ছি যে এই পেজটা ডায়নামিক (Cache ধরবে না)
export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  // ১. ServerFetch দিয়ে ডাটা আনছি (আপনার API এর রাউট অনুযায়ী নাম পরিবর্তন করে নিবেন)
  let categories = [];
   const result = await getAllCategory() ;
   categories = result?.data

  // ২. ডাটাগুলো CategoryList কম্পোনেন্টে পাঠিয়ে দিচ্ছি
  return <CategoryList initialCategories={categories} />;
}