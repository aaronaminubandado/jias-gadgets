import { Cart, CartItem, Product } from '@/types/product';

export const CART_STORAGE_KEY = 'jias-cart';

export const emptyCart: Cart = { items: [], total: 0, itemCount: 0 };

export function computeCartTotals(
	items: CartItem[]
): Pick<Cart, 'total' | 'itemCount'> {
	const total = items.reduce(
		(sum, item) => sum + item.product.price * item.quantity,
		0
	);
	const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
	return { total, itemCount };
}

function isValidProduct(value: unknown): value is Product {
	if (!value || typeof value !== 'object') return false;
	const p = value as Product;
	return (
		typeof p.id === 'string' &&
		typeof p.name === 'string' &&
		typeof p.price === 'number' &&
		typeof p.image === 'string'
	);
}

export function parseStoredCart(raw: string | null): Cart {
	if (!raw) return emptyCart;

	try {
		const parsed = JSON.parse(raw) as { items?: unknown[] };
		if (!parsed.items || !Array.isArray(parsed.items)) return emptyCart;

		const items: CartItem[] = parsed.items
			.filter((item): item is CartItem => {
				if (!item || typeof item !== 'object') return false;
				const row = item as CartItem;
				return (
					isValidProduct(row.product) &&
					Number.isInteger(row.quantity) &&
					row.quantity > 0
				);
			})
			.map((item) => ({
				product: item.product,
				quantity: item.quantity,
			}));

		return { items, ...computeCartTotals(items) };
	} catch {
		return emptyCart;
	}
}

export function loadCartFromStorage(
	storage: Pick<Storage, 'getItem'> = localStorage
): Cart {
	return parseStoredCart(storage.getItem(CART_STORAGE_KEY));
}

export function serializeCart(cart: Cart): string {
	return JSON.stringify({ items: cart.items });
}

export function saveCartToStorage(
	cart: Cart,
	storage: Pick<Storage, 'setItem'> = localStorage
) {
	try {
		storage.setItem(CART_STORAGE_KEY, serializeCart(cart));
	} catch {
		// Storage full or unavailable — cart stays in memory for this session
	}
}
