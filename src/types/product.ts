export interface Product {
	id: string;
	name: string;
	price: number;
	image: string;
	description: string;
	category: string;
	inStock: boolean;
	stock: number;
	sku: string;
	brand: string;
	weight?: number;
	dimensions?: {
		length: number;
		width: number;
		height: number;
	};
	tags: string[];
	featured: boolean;
}

export interface CartItem {
	product: Product;
	quantity: number;
}

export interface Cart {
	items: CartItem[];
	total: number;
	itemCount: number;
}
