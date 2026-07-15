import { describe, expect, it } from 'vitest';
import {
	CART_STORAGE_KEY,
	emptyCart,
	parseStoredCart,
	serializeCart,
	computeCartTotals,
	clearCartStorage,
	saveCartToStorage,
} from './cartStorage';
import { Product } from '@/types/product';

const sampleProduct: Product = {
	id: 'prod-1',
	name: 'Test Gadget',
	price: 29.99,
	image: 'https://example.com/img.png',
	category: 'audio',
	inStock: true,
	stock: 10,
};

describe('cartStorage', () => {
	it('returns empty cart for missing or invalid storage', () => {
		expect(parseStoredCart(null)).toEqual(emptyCart);
		expect(parseStoredCart('not-json')).toEqual(emptyCart);
		expect(parseStoredCart(JSON.stringify({ items: 'bad' }))).toEqual(
			emptyCart
		);
	});

	it('restores valid items and recomputes totals', () => {
		const raw = serializeCart({
			items: [{ product: sampleProduct, quantity: 2 }],
			total: 0,
			itemCount: 0,
		});

		const cart = parseStoredCart(raw);
		expect(cart.items).toHaveLength(1);
		expect(cart.itemCount).toBe(2);
		expect(cart.total).toBeCloseTo(59.98);
	});

	it('drops entries with invalid product shape', () => {
		const raw = JSON.stringify({
			items: [
				{ product: { id: 'x' }, quantity: 1 },
				{ product: sampleProduct, quantity: 1 },
			],
		});

		const cart = parseStoredCart(raw);
		expect(cart.items).toHaveLength(1);
		expect(cart.items[0].product.id).toBe('prod-1');
	});

	it('computeCartTotals sums price × quantity', () => {
		const totals = computeCartTotals([
			{ product: sampleProduct, quantity: 3 },
		]);
		expect(totals.itemCount).toBe(3);
		expect(totals.total).toBeCloseTo(89.97);
	});

	it('uses consistent storage key', () => {
		expect(CART_STORAGE_KEY).toBe('jias-cart');
	});

	it('clearCartStorage removes persisted cart', () => {
		const storage = {
			data: {} as Record<string, string>,
			setItem(key: string, value: string) {
				this.data[key] = value;
			},
			getItem(key: string) {
				return this.data[key] ?? null;
			},
			removeItem(key: string) {
				delete this.data[key];
			},
		};

		saveCartToStorage(
			{ items: [{ product: sampleProduct, quantity: 1 }], total: 29.99, itemCount: 1 },
			storage
		);
		expect(storage.getItem(CART_STORAGE_KEY)).not.toBeNull();

		clearCartStorage(storage);
		expect(storage.getItem(CART_STORAGE_KEY)).toBeNull();
	});
});
