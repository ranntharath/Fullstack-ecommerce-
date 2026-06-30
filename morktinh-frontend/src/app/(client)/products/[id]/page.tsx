import { Metadata } from "next";
import { ClientProductDetailPageContent } from "@/features/client/products/components/ClientProductDetailPageContent";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  
  // Choose the backend URL based on whether we are in dev (absolute URL) or production docker network (internal hostname)
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.startsWith("http")
    ? process.env.NEXT_PUBLIC_API_URL
    : "http://backend:8000/api/";

  try {
    const res = await fetch(`${apiBaseUrl}products/${id}/`, {
      next: { revalidate: 3600 } // cache for 1 hour
    });
    
    if (!res.ok) throw new Error("Failed to fetch product");
    
    const product = await res.json();

    return {
      title: product.name,
      description: product.description || `Buy ${product.name} on Mork Tinh.`,
      openGraph: {
        title: `${product.name} | Mork Tinh`,
        description: product.description || `Buy ${product.name} on Mork Tinh.`,
        images: product.image ? [{ url: product.image }] : [],
      },
    };
  } catch (error) {
    return {
      title: "Product Details",
      description: "View product details on Mork Tinh.",
    };
  }
}

export default function ClientProductDetailPage() {
  return <ClientProductDetailPageContent />;
}
