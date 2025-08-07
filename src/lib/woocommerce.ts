// app/lib/woocommerce.ts
import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";

export const api = new WooCommerceRestApi({
  url: process.env.NEXT_PUBLIC_WORDPRESS_SITE_URL!,
  consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY!,
  consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET!,
  version: "wc/v3"
});

export interface Product {
  id: number;
  name: string;
  regular_price: string;
  sale_price?: string;
  description: string;
  images: Array<{ src: string }>;
  categories: Array<{ id: number; name: string }>;
}

export async function fetchFeaturedProducts(
  perPage: number = 3
): Promise<Product[]> {
  try {
    const response = await api.get("products", {
      featured: true,
      per_page: perPage
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return [];
  }
}