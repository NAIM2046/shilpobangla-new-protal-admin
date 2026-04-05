import EditorNewsEditForm from "@/components/module/news/EditorNewsEditForm";
import { getAllCategory } from "@/services/categories/categories.service";
import { getSingleNewsAction } from "@/services/news/news.service";

type Props = { params: Promise<{ slug: string }> };

export default async function NewsEditPage({ params }: Props) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  // ১. নিউজ ফেচ করুন
  const newsResponse = await getSingleNewsAction(slug);
  const initialData = newsResponse?.data;

  // ২. ক্যাটাগরি ফেচ করুন
  const categoryResponse = await getAllCategory();
  const categories = categoryResponse?.data || [];

  if (!initialData) {
    return <div>News not found!</div>;
  }

  return (
    <div className="p-6">
      <EditorNewsEditForm
        initialCategories={categories}
        initialData={initialData}
        newsId={initialData.id}
      />
    </div>
  );
}
