import { BackendProduct } from "@/lib/api";
import { Product } from "@/types/product";

// Convert backend product to frontend product format
export const convertProduct = (backendProduct: BackendProduct): Product => {
	return {
		id: backendProduct._id,
		name: backendProduct.name,
		price: backendProduct.price,
		image: backendProduct.image || "/placeholder.svg",
		description: backendProduct.description || "",
		category: backendProduct.category,
		inStock: backendProduct.stock - (backendProduct.reserved || 0) > 0,
		stock: backendProduct.stock - (backendProduct.reserved || 0),
		sku: backendProduct.sku || "",
		brand: backendProduct.brand || "",
		tags: backendProduct.tags || [],
		featured: backendProduct.featured || false,
	};
};
