import { ProductFormPageContent } from "@/features/admin/products/components/ProductFormPageContent";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;

  return <ProductFormPageContent mode="edit" productId={Number(resolvedParams.id)} />;
}
